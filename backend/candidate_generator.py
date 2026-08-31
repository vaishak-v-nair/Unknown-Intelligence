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
    """Groups observations by extracted-claim, requiring >= MIN_AUTHORS distinct
    authors. Returns raw candidate rows (dicts to be turned into findings)."""
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
        # Edge toward importance with more converging authors / volume.
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
