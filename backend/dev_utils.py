"""Developer / demo helpers for Aurora Intelligence.

Usage (from repo root):

    # Reset ALL findings to unverified (so investigations can be re-run)
    .venv\\Scripts\\python -m backend.dev_utils reset-findings

    # Wipe all app data (entities, events, observations, findings) from DB
    .venv\\Scripts\\python -m backend.dev_utils wipe

    # Seed demo + ingest a SWE-bench sample in one go
    .venv\\Scripts\\python -m backend.dev_utils seed --limit 200
"""

import sys

from .db import get_sync_db, init_db


def reset_findings():
    db = get_sync_db()
    r = db.findings.update_many(
        {}, {"$set": {"status": "UNVERIFIED_CANDIDATE"}}
    )
    print(f"[dev] reset {r.modified_count} findings to UNVERIFIED_CANDIDATE.")


def wipe():
    db = get_sync_db()
    for col in ("findings", "observations", "events", "entities"):
        n = db[col].delete_many({}).deleted_count
        print(f"[dev] wiped {n} documents from '{col}'.")


def seed(limit=200):
    from .dataset_manager import ingest_swebench, seed_demo

    seed_demo()
    ingest_swebench(limit=limit)
    print("[dev] seeding complete.")


def main():
    init_db()
    args = sys.argv[1:]
    command = args[0] if args else ""
    if command == "reset-findings":
        reset_findings()
    elif command == "wipe":
        wipe()
    elif command == "seed":
        limit = 200
        if len(args) > 1:
            # accept positional or --limit N
            try:
                limit = int(args[-1])
            except ValueError:
                pass
        seed(limit=limit)
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
