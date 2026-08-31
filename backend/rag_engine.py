"""Evidence retrieval (RAG) for Aurora Intelligence.

Primary path: local vector search via Milvus Lite + a local embedding model.

Resilience: if the vector stack is unavailable (model weights not yet
downloaded, Milvus init fails, etc.) the engine transparently falls back to a
keyword match over the MongoDB `observations` collection so the discovery loop
never breaks. The fallback is deterministic and requires no extra downloads.
"""

import os
import re

from .db import get_sync_db

MILVUS_DB_PATH = os.getenv("MILVUS_DB_PATH", "milvus_rag.db")
COLLECTION_NAME = "evidence_collection"
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2


def _to_text(value):
    return (value or "").strip()


class RAGEngine:
    def __init__(self):
        self.vector = None
        self.encoder = None
        self._init_vector()

    def _init_vector(self):
        """Best-effort init of the vector stack; never raise."""
        try:
            from pymilvus import MilvusClient, DataType

            self.milvus_client = MilvusClient(MILVUS_DB_PATH)
            self.milvus_client  # noqa
            from sentence_transformers import SentenceTransformer

            self.encoder = SentenceTransformer("all-MiniLM-L6-v2")
            self._client = self.milvus_client
            self._schema = DataType

            if not self._client.has_collection(COLLECTION_NAME):
                schema = self._client.create_schema(
                    auto_id=False, enable_dynamic_field=True
                )
                schema.add_field(
                    field_name="id",
                    datatype=DataType.VARCHAR,
                    max_length=128,
                    is_primary=True,
                )
                schema.add_field(
                    field_name="vector",
                    datatype=DataType.FLOAT_VECTOR,
                    dim=EMBEDDING_DIM,
                )
                schema.add_field(
                    field_name="text", datatype=DataType.VARCHAR, max_length=65535
                )
                index_params = self._client.prepare_index_params()
                index_params.add_index(
                    field_name="vector", index_type="FLAT", metric_type="COSINE"
                )
                self._client.create_collection(
                    collection_name=COLLECTION_NAME,
                    schema=schema,
                    index_params=index_params,
                )
            self.vector = True
            print("[rag] Vector backend ready (Milvus Lite + MiniLM).")
        except Exception as exc:
            # Fallback: keyword search over Mongo.
            self.vector = False
            print(
                f"[rag] Vector backend unavailable ({exc}); "
                "using MongoDB keyword fallback."
            )

    # ------------------------------------------------------------------
    # Indexing
    # ------------------------------------------------------------------
    def index_all_raw_data(self):
        """Idempotently index observation content into the vector store."""
        db = get_sync_db()
        rows = list(db.observations.find({}, {"id": 1, "content": 1}))
        if not rows:
            print("[rag] No data to index.")
            return

        if not self.vector:
            print("[rag] Skipping vector index (fallback active).")
            return

        try:
            batch_size = 100
            for i in range(0, len(rows), batch_size):
                batch = rows[i : i + batch_size]
                ids = [r["id"] for r in batch]
                texts = [_to_text(r.get("content")) for r in batch]
                vectors = self.encoder.encode(texts).tolist()
                data = [
                    {"id": ids[j], "vector": vectors[j], "text": texts[j]}
                    for j in range(len(batch))
                ]
                self._client.upsert(collection_name=COLLECTION_NAME, data=data)
            print(f"[rag] Indexed {len(rows)} chunks into vector store.")
        except Exception as exc:
            self.vector = False
            print(f"[rag] Vector indexing failed ({exc}); using keyword fallback.")

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------
    def search_evidence(self, query_text, limit=5):
        """Returns a list of evidence content strings relevant to the query."""
        if self.vector:
            try:
                qvec = self.encoder.encode([query_text]).tolist()
                res = self._client.search(
                    collection_name=COLLECTION_NAME,
                    data=qvec,
                    limit=limit,
                    output_fields=["text"],
                )
                out = []
                for hits in res:
                    for hit in hits:
                        out.append(hit["entity"].get("text", ""))
                if out:
                    return out
            except Exception as exc:
                print(f"[rag] Vector search failed ({exc}); keyword fallback.")
        return self._keyword_search(query_text, limit)

    def _keyword_search(self, query_text, limit=5):
        """Deterministic fallback: regex token match over Mongo observations."""
        db = get_sync_db()
        tokens = [
            t
            for t in re.split(r"\\W+", query_text.lower())
            if len(t) > 2
        ]
        out = []
        cursor = db.observations.find({}, {"id": 1, "content": 1}).sort(
            "_id", 1
        )
        for doc in cursor:
            content = _to_text(doc.get("content"))
            low = content.lower()
            if tokens and any(t in low for t in tokens[:5]):
                out.append(content)
                if len(out) >= limit:
                    break
        return out


# Singleton
_engine = None


def get_rag_engine():
    global _engine
    if _engine is None:
        _engine = RAGEngine()
    return _engine
