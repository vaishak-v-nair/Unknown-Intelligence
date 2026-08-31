"""Candidate generation for Aurora Intelligence.

Surfaces potential discoveries by two complementary, deterministic mechanisms
(both cheap and explainable — no LLM required at this stage):

1. CROSS-AUTHOR CONVERGENCE
   Multiple distinct authors reporting on the same claim within the dataset.
   The more independent authors agree, the stronger the signal.

2. FREQUENCY / PATTERN SURFACING
   Claims that appear unusually often (above a configurable floor) are worth
   investigating even when author identity is unknown.

Candidates are persisted to the `findings` collection with status
`UNVERIFIED_CANDIDATE` and handed to the Investigation Engine for verification.
"""

import uuid
import hashlib
from datetime import datetime

from .db import get_sync_db

MIN_AUTHORS = 3      # convergence threshold (independent authors)
MIN_OCCURRENCES = 2  # frequency floor for the pattern mechanism


def compute_hash(claim, evidence_ids):
    raw = claim + str(sorted(evidence_ids))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def _candidate(claim, evidence_ids, score, status="UNVERIFIED_CANDIDATE"):
    return {
        "id": f"cand_{uuid.uuid4()}",
        "hash_key": compute_hash(claim, evidence_ids),
        "claim": claim,
        "evidence_ids": evidence_ids,
        "significance_score": score,
        "status": status,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

def cross_author_convergence(db):
    """
    Groups observations by Semantic Vector Clustering.
    Instead of exact string matching, we embed observations and cluster them.
    If a cluster contains >= MIN_AUTHORS distinct authors, it's surfaced.
    """
    try:
        from .rag_engine import get_rag_engine
        rag = get_rag_engine()
        import numpy as np
        from sklearn.cluster import DBSCAN
        from sklearn.metrics.pairwise import cosine_distances
    except ImportError:
        return _fallback_cross_author_convergence(db)
        
    # 1. Fetch all observations with their event/author data
    pipeline = [
        {
            "$lookup": {
                "from": "events",
                "localField": "event_id",
                "foreignField": "id",
                "as": "event",
            }
        },
        {"$unwind": "$event"},
        {
            "$lookup": {
                "from": "entities",
                "localField": "event.entity_id",
                "foreignField": "id",
                "as": "entity",
            }
        },
        {"$unwind": "$entity"},
        {
            "$project": {
                "content": 1,
                "event_id": "$event.id",
                "author": "$event.actor",
                "entity_id": "$entity.id",
                "entity_name": "$entity.name"
            }
        }
    ]
    
    try:
        obs_list = list(db.observations.aggregate(pipeline))
    except Exception as exc:
        print(f"[candidate] convergence aggregation failed: {exc}")
        return []
        
    if not obs_list:
        return []
        
    if not rag.vector or not rag.encoder:
        print("[candidate] RAG vector engine not available. Falling back to exact string match.")
        return _fallback_cross_author_convergence(db)
        
    texts = [o.get("content", "") for o in obs_list]
    
    # 2. Compute Embeddings
    embeddings = rag.encoder.encode(texts)
    
    # 3. Cluster using DBSCAN (cosine distance)
    # eps = 0.25 means we require cosine similarity >= 0.75
    dist_matrix = cosine_distances(embeddings)
    clustering = DBSCAN(eps=0.25, min_samples=2, metric='precomputed')
    labels = clustering.fit_predict(dist_matrix)
    
    # 4. Analyze Clusters
    clusters = {}
    for i, label in enumerate(labels):
        if label == -1:
            continue
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(i)
        
    candidates = []
    for label, indices in clusters.items():
        unique_authors = set()
        entity_ids = set()
        sample_names = set()
        
        for idx in indices:
            o = obs_list[idx]
            if o.get("author"): unique_authors.add(o["author"])
            if o.get("entity_id"): entity_ids.add(o["entity_id"])
            if o.get("entity_name"): sample_names.add(o["entity_name"])
            
        if len(unique_authors) >= MIN_AUTHORS:
            authors_count = len(unique_authors)
            names = list(sample_names)
            topic = ", ".join(names[:4]) if names else "Correlated Entities"
            
            cluster_dists = dist_matrix[np.ix_(indices, indices)]
            # avg sim = 1 - avg distance
            if len(indices) > 1:
                avg_sim = 1.0 - (np.sum(cluster_dists) / (len(indices) * (len(indices) - 1)))
            else:
                avg_sim = 1.0
                
            semantic_score = float(min(0.99, max(0.0, avg_sim)))
            
            claim = (
                f"True Semantic Convergence (Similarity: {semantic_score*100:.1f}%): "
                f"{authors_count} independent actors reported mathematically correlated events "
                f"regarding ({topic})."
            )
            score = min(0.98, 0.75 + (authors_count - MIN_AUTHORS) * 0.05 + semantic_score * 0.1)
            
            cand = _candidate(claim, list(entity_ids), round(score, 3))
            cand["semantic_score"] = round(semantic_score, 3)
            candidates.append(cand)
            
    return candidates

def _fallback_cross_author_convergence(db):
    """Fallback string-matching if vector engine is missing."""
    pipeline = [
        {"$match": {"extracted_claims": {"$ne": "[]", "$nin": ["[]", ""]}}},
        {
            "$lookup": {
                "from": "events",
                "localField": "event_id",
                "foreignField": "id",
                "as": "event",
            }
        },
        {"$unwind": "$event"},
        {
            "$lookup": {
                "from": "entities",
                "localField": "event.entity_id",
                "foreignField": "id",
                "as": "entity",
            }
        },
        {"$unwind": "$entity"},
        {
            "$group": {
                "_id": "$extracted_claims",
                "unique_authors": {"$addToSet": "$event.actor"},
                "entity_ids": {"$addToSet": "$entity.id"},
                "sample_names": {"$addToSet": "$entity.name"},
                "count": {"$sum": 1},
            }
        },
        {
            "$project": {
                "extracted_claims": "$_id",
                "author_count": {"$size": "$unique_authors"},
                "entity_ids": 1,
                "sample_names": 1,
                "count": 1,
                "_id": 0,
            }
        },
        {"$match": {"author_count": {"$gte": MIN_AUTHORS}}},
    ]

    try:
        items = list(db.observations.aggregate(pipeline))
    except Exception as exc:
        print(f"[candidate] convergence aggregation failed: {exc}")
        return []

    candidates = []
    for item in items:
        authors = item["author_count"]
        tags = item["extracted_claims"]
        entity_ids = item["entity_ids"]
        names = list(item.get("sample_names", []))
        topic = ", ".join(names[:4]) if names else tags

        claim = (
            f"Cross-Author Convergence: {authors} independent actors reported "
            f"on a common claim ({topic}). "
            f"Signal: {item['count']} records share this pattern."
        )
        score = min(0.95, 0.7 + (authors - MIN_AUTHORS) * 0.06 + (item["count"] / 100.0))
        candidates.append(_candidate(claim, entity_ids, round(score, 3)))

    return candidates


def frequency_patterns(db):
    """Surfaces claims that recur frequently, but ONLY when they can be grounded
    to concrete entity evidence (honoring the anti-hallucination rule that a
    candidate must always carry provenance)."""
    pipeline = [
        {"$match": {"extracted_claims": {"$nin": ["[]", ""]}}},
        {
            "$lookup": {
                "from": "events",
                "localField": "event_id",
                "foreignField": "id",
                "as": "event",
            }
        },
        {"$unwind": "$event"},
        {
            "$lookup": {
                "from": "entities",
                "localField": "event.entity_id",
                "foreignField": "id",
                "as": "entity",
            }
        },
        {"$unwind": "$entity"},
        {
            "$group": {
                "_id": "$extracted_claims",
                "count": {"$sum": 1},
                "entity_ids": {"$addToSet": "$entity.id"},
                "names": {"$addToSet": "$entity.name"},
            }
        },
        {"$match": {"count": {"$gte": MIN_OCCURRENCES}}},
    ]

    try:
        items = list(db.observations.aggregate(pipeline))
    except Exception as exc:
        print(f"[candidate] frequency aggregation failed: {exc}")
        return []

    candidates = []
    for item in items:
        tags = item["_id"]
        entity_ids = item["entity_ids"]
        if not entity_ids:
            # Unsupported -> do not surface (anti-hallucination).
            continue
        names = ", ".join(list(item.get("names", []))[:4])
        claim = (
            f"Recurring pattern: '{tags}' appears {item['count']} times across "
            f"entity/entities ({names}), suggesting a repeatable systemic condition."
        )
        score = min(0.9, 0.55 + item["count"] * 0.05)
        candidates.append(_candidate(claim, entity_ids, round(score, 3)))

    return candidates


def generate_candidates():
    db = get_sync_db()
    candidates = cross_author_convergence(db)
    candidates += frequency_patterns(db)
    return candidates


def store_findings(candidates):
    db = get_sync_db()
    inserted = 0
    for c in candidates:
        if not c["evidence_ids"] and c["status"] == "UNVERIFIED_CANDIDATE":
            # Frequency-only rows have no entity evidence; keep but lower priority.
            pass
        try:
            result = db.findings.update_one(
                {"hash_key": c["hash_key"]},
                {"$setOnInsert": c},
                upsert=True,
            )
            if result.upserted_id is not None:
                inserted += 1
        except Exception as exc:
            print(f"Failed to store candidate {c['id']}: {exc}")
    return inserted


if __name__ == "__main__":
    from .db import init_db, get_sync_db

    init_db()
    cands = generate_candidates()
    print(f"Generated {len(cands)} candidate findings.")
    if cands:
        inserted = store_findings(cands)
        print(f"Stored {inserted} new (skipped {len(cands) - inserted} dupes).")
