"""Database layer for Aurora Intelligence.

Storage backend selection (via environment variable `MONGO_URI`):

- `mongodb://...`        -> a real MongoDB server (production / local). Default.
- `mock`                 -> in-memory `mongomock` (dev/testing only; data is not
                            persisted across processes).
- `mongodb://...` with `MONGO_URI=memory://` -> reserved, not used.

The rest of the codebase talks to this module exclusively through
`get_sync_db()` (blocking, sync path) and `get_async_db()` (asyncio path),
never by importing a driver directly. This keeps the storage swap-able and
testable.
"""

import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("AURORA_DB_NAME", "aurora_intelligence")

# ---------------------------------------------------------------------------
# Client construction
# ---------------------------------------------------------------------------

if MONGO_URI == "mock":
    import mongomock
    from mongomock_motor import AsyncMongoMockClient

    sync_client = mongomock.MongoClient()
    sync_db = sync_client[DB_NAME]

    async_client = AsyncMongoMockClient()
    async_db = async_client[DB_NAME]
    _backend = "mock (in-memory)"
else:
    from pymongo import MongoClient
    from motor.motor_asyncio import AsyncIOMotorClient

    sync_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=8000)
    sync_db = sync_client[DB_NAME]

    async_client = AsyncIOMotorClient(MONGO_URI)
    async_db = async_client[DB_NAME]
    _backend = "mongo"


COLLECTIONS = ("entities", "events", "observations", "findings", "baselines")


def get_sync_db():
    return sync_db


def get_async_db():
    return async_db


def backend_name() -> str:
    """Human-readable description of the active storage backend."""
    return _backend


def _ping():
    """Raise a clear error if the configured backend is unreachable."""
    if MONGO_URI == "mock":
        return
    try:
        sync_client.admin.command("ping")
    except Exception as exc:  # pymongo.errors.ServerSelectionTimeoutError etc.
        raise RuntimeError(
            "Cannot connect to MongoDB at "
            f"{MONGO_URI!r}. Is `mongod` running? "
            "Set MONGO_URI=mock for in-memory dev mode."
        ) from exc


def init_db():
    """Creates collections and indices for performance + dedup guarantees.

    Idempotent and safe to call on every startup.
    """
    _ping()

    # Unique index on findings.hash_key to prevent duplicate discoveries.
    sync_db.findings.create_index("hash_key", unique=True)

    # Temporal + filter indices on events.
    sync_db.events.create_index("timestamp")
    sync_db.events.create_index("actor")
    sync_db.events.create_index("entity_id")

    # Observation lookups (including the extracted_claims grouping used by the
    # candidate generator).
    sync_db.observations.create_index("event_id")
    sync_db.observations.create_index("extracted_claims")

    # Entity lookups.
    sync_db.entities.create_index("id", unique=True)

    print(
        f"[db] collections/indices initialized. "
        f"backend={backend_name()} db={DB_NAME}"
    )


if __name__ == "__main__":
    init_db()
