"""Dataset ingestion for Aurora Intelligence.

Converts external datasets (e.g. SWE-bench) and bundled demo scenarios into the
normalized state model stored in MongoDB:

    entities  ->  events  ->  observations

Each observation carries an `extracted_claims` list (JSON encoded in the
document) that the Candidate Generator groups over to surface discoveries.

Run examples (from the repo root):

    # Ingest the real SWE-bench verified dataset (first 200 rows)
    .venv\\Scripts\\python -m backend.dataset_manager --ingest-swebench --limit 200

    # Plant a clean demo scenario (idempotent, always produces findings)
    .venv\\Scripts\\python -m backend.dataset_manager --seed-demo
"""

import csv
import json
import uuid
from datetime import datetime

from .db import get_sync_db

DEFAULT_SWE_BENCH = r"E:\BrosKi\unknown\dataset\swe-bench-verified.csv"


def _now_iso():
    return datetime.utcnow().isoformat() + "Z"


def _upsert_entity(db, entity_id, etype, name, url):
    db.entities.update_one(
        {"id": entity_id},
        {"$set": {"type": etype, "name": name, "url": url}},
        upsert=True,
    )
    return entity_id


def _insert_event_observation(db, entity_id, timestamp, actor, content, claims):
    """Insert one event + its observation. Returns the observation id."""
    event_id = f"event_{uuid.uuid4()}"
    db.events.insert_one(
        {
            "id": event_id,
            "entity_id": entity_id,
            "event_type": "created",
            "timestamp": timestamp,
            "actor": actor,
        }
    )
    obs_id = f"obs_{uuid.uuid4()}"
    db.observations.insert_one(
        {
            "id": obs_id,
            "event_id": event_id,
            "content": content,
            "extracted_claims": json.dumps(claims or []),
        }
    )
    return obs_id


def ingest_swebench(file_path=DEFAULT_SWE_BENCH, limit=200):
    """Normalizes SWE-bench rows into entities/events/observations.

    `repo` is emitted as an extracted claim so multiple issues on the same
    repository act as "converging authors" for the candidate generator."
    """
    db = get_sync_db()
    count = 0

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if limit and count >= limit:
                break

            repo = row.get("repo", "unknown/repo")
            instance_id = row.get("instance_id") or f"issue_{uuid.uuid4()}"
            problem = row.get("problem_statement", "")
            created_at = row.get("created_at") or _now_iso()

            entity_id = f"swe_{instance_id}"
            repo_name = repo.split("/")[-1]

            _upsert_entity(
                db,
                entity_id,
                "ISSUE",
                instance_id,
                f"https://github.com/{repo}/issues/{instance_id}",
            )

            # Actor proxy: SWE-bench doesn't carry authors, so use a stable
            # per-entity developer id. Distinct per issue -> enables
            # cross-author convergence on shared repositories.
            actor = f"developer_{count}"

            _insert_event_observation(
                db,
                entity_id,
                created_at,
                actor,
                problem,
                ["swe-bench-issue", repo_name],
            )
            count += 1

    print(f"[dataset] Ingested {count} SWE-bench issues into '{db.name}'.")
    return count


def seed_demo():
    """Plants a clean, idempotent demo scenario.

    A fictional supplier (`Northwind Fulfilment`) whose delivery reliability
    has deteriorated for six consecutive weeks, concentrated in two critical
    product lines — matching the reference discovery in the product spec.

    Stable ids make the seed idempotent: re-running it never duplicates data.
    """
    db = get_sync_db()

    marker = db.entities.find_one({"id": "demo_supplier_northwind"})
    if marker:
        print("[dataset] Demo seed already present; skipping.")
        return 0

    supplier_id = "demo_supplier_northwind"
    _upsert_entity(
        db,
        supplier_id,
        "SUPPLIER",
        "Northwind Fulfilment",
        "https://example.com/suppliers/northwind",
    )

    product_lines = {
        "Electronics": 18,   # late-delivery rate % target
        "Perishables": 9,    # stable
    }

    # 6 consecutive weeks of degradation in Electronics only.
    from datetime import timedelta

    late_deliveries = [3, 5, 7, 9, 14, 17]
    weeks = len(late_deliveries)
    base = datetime.utcnow()
    for week in range(1, weeks + 1):
        # spread timestamps across the past 6 weeks
        week_ts = base - timedelta(days=(weeks - week) * 7)
        ts = f"{week_ts.year:04d}-{week_ts.month:02d}-{week_ts.day:02d}T00:00:00Z"
        for line_name, content in (
            ("Electronics", f"Week {week}: {late_deliveries[week-1]} late deliveries; cumulative trend rising."),
            ("Perishables", f"Week {week}: {product_lines['Perishables']} late deliveries; stable."),
        ):
            _insert_event_observation(
                db,
                supplier_id,
                ts,
                f"ops_scheduler_week{week}",
                content,
                ["supplier-delivery", line_name.lower()],
            )

    print("[dataset] Demo seed planted (6 weeks of supplier delivery data).")
    return 1


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser(description="Aurora dataset ingestion")
    p.add_argument("--ingest-swebench", action="store_true", help="Ingest SWE-bench CSV")
    p.add_argument("--seed-demo", action="store_true", help="Plant the clean demo scenario")
    p.add_argument("--limit", type=int, default=200, help="Max SWE-bench rows to ingest")
    p.add_argument("--path", default=DEFAULT_SWE_BENCH, help="Override CSV path")
    args = p.parse_args()

    if args.ingest_swebench:
        ingest_swebench(args.path, limit=args.limit)
    if args.seed_demo:
        seed_demo()
    if not (args.ingest_swebench or args.seed_demo):
        p.print_help()
