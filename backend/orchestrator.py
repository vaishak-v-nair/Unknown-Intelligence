"""Proactive orchestrator for Aurora Intelligence.

An infinite background loop that:
  1. syncs raw observations into the vector/evidence store,
  2. generates candidate findings,
  3. persists new candidates (idempotent via hash_key),
  4. runs the LLM investigation over unverified candidates.

Designed to never exit on transient errors — each cycle is isolated.
"""

import time

from .db import init_db, get_sync_db
from .candidate_generator import generate_candidates, store_findings
from .investigator import investigate_candidates


def run_orchestration_loop(interval_seconds=60):
    print("=" * 50)
    print(" AURORA PROACTIVE ORCHESTRATOR STARTED")
    print(f" Polling interval: {interval_seconds}s")
    print("=" * 50)

    try:
        init_db()
    except Exception as exc:
        print(f"[orchestrator] init_db failed: {exc}")

    while True:
        cycle_start = time.time()
        try:
            print("\n[*] Discovery cycle ...")

            # 1. Evidence sync (best-effort; vector stack may be absent).
            try:
                from .rag_engine import get_rag_engine

                get_rag_engine().index_all_raw_data()
            except Exception as exc:
                print(f"[orchestrator] evidence sync skipped: {exc}")

            # 2. Candidate generation.
            candidates = generate_candidates()
            if candidates:
                inserted = store_findings(candidates)
                print(f"[*] {len(candidates)} candidates, {inserted} new.")
            else:
                print("[*] No new candidate signals.")

            # 3. Investigation of any unverified candidates.
            processed = investigate_candidates()
            if processed:
                print(f"[*] Investigated {processed} candidates.")

            # 4. Quick status.
            db = get_sync_db()
            total_findings = db.findings.count_documents({})
            print(f"[*] findings total: {total_findings}")

        except Exception as exc:
            print(f"[!] Orchestrator cycle error: {exc}")

        elapsed = time.time() - cycle_start
        sleep = max(1, interval_seconds - elapsed)
        print(f"[*] Cycle done in {elapsed:.1f}s. Sleeping {sleep:.0f}s ...")
        time.sleep(sleep)


if __name__ == "__main__":
    import sys

    interval = 30
    if len(sys.argv) > 1:
        try:
            interval = int(sys.argv[1])
        except ValueError:
            pass
    run_orchestration_loop(interval)
