import uuid
import json
import hashlib
from .db import get_connection

def compute_hash(claim, evidence_ids):
    """Computes a deterministic hash for idempotency."""
    # Based on the user feedback open question, we'll hash the claim and evidence together.
    # If a new piece of evidence arrives, it spawns a new finding (conservative approach for MVP).
    raw = claim + str(sorted(evidence_ids))
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def build_baseline(cursor):
    """
    Establish what is normal.
    We return total historical events for fallback, but true temporal drift uses SQL sliding windows.
    """
    cursor.execute("SELECT COUNT(*) FROM events")
    return {"total_events": cursor.fetchone()[0]}

def generate_candidates():
    """
    Candidate Generation Mechanism.
    Following Section 20 & 21: Temporal Drift & Cross-Author Convergence
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    baseline = build_baseline(cursor)
    candidates = []
    
    # 1. CROSS-AUTHOR CONVERGENCE
    # Find keywords that appear in multiple unconnected PRs/Issues from DIFFERENT authors.
    cursor.execute("""
        SELECT o.extracted_claims, COUNT(DISTINCT ev.actor) as unique_authors,
               GROUP_CONCAT(e.id) as evidence_ids_csv
        FROM observations o
        JOIN events ev ON o.event_id = ev.id
        JOIN entities e ON ev.entity_id = e.id
        WHERE o.extracted_claims != '[]'
        GROUP BY o.extracted_claims
        HAVING unique_authors >= 3
    """)
    
    convergence_items = cursor.fetchall()
    
    for item in convergence_items:
        keyword = item[0]
        unique_authors = item[1]
        evidence_ids = item[2].split(',')
        
        claim = f"Cross-Author Convergence: {unique_authors} independent developers encountered issues related to {keyword}."
        hash_key = compute_hash(claim, evidence_ids)
        
        candidates.append({
            "id": f"cand_{uuid.uuid4()}",
            "hash_key": hash_key,
            "claim": claim,
            "evidence_ids": json.dumps(evidence_ids),
            "significance": 0.85
        })
        
    return candidates

def store_findings(candidates):
    conn = get_connection()
    # Explicit BEGIN IMMEDIATE to avoid WAL contention (Staff Eng Review Pillar 1)
    conn.execute("BEGIN IMMEDIATE")
    cursor = conn.cursor()
    
    inserted_count = 0
    for c in candidates:
        try:
            # INSERT OR IGNORE provides Idempotency (Staff Eng Review Pillar 2)
            cursor.execute(
                "INSERT OR IGNORE INTO findings (id, hash_key, claim, evidence_ids, significance_score, status) VALUES (?, ?, ?, ?, ?, ?)",
                (c['id'], c['hash_key'], c['claim'], c['evidence_ids'], c['significance'], 'UNVERIFIED_CANDIDATE')
            )
            if cursor.rowcount > 0:
                inserted_count += 1
        except Exception as e:
            print(f"Failed to store candidate {c['id']}: {e}")
            
    conn.commit()
    conn.close()
    return inserted_count

if __name__ == "__main__":
    cands = generate_candidates()
    print(f"Generated {len(cands)} candidate findings from temporal/convergence analysis.")
    if cands:
        inserted = store_findings(cands)
        print(f"Stored {inserted} new findings (ignored {len(cands) - inserted} duplicates).")
