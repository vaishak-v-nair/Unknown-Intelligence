import os
from pymilvus import MilvusClient, DataType
from sentence_transformers import SentenceTransformer
from .db import get_connection

MILVUS_DB_PATH = "milvus_rag.db"
COLLECTION_NAME = "evidence_collection"
EMBEDDING_DIM = 384  # For all-MiniLM-L6-v2

class RAGEngine:
    def __init__(self):
        # Initialize Milvus Lite
        self.client = MilvusClient(MILVUS_DB_PATH)
        
        # Initialize embedding model locally to save API costs
        self.encoder = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Create collection if it doesn't exist
        if not self.client.has_collection(COLLECTION_NAME):
            schema = MilvusClient.create_schema(
                auto_id=False,
                enable_dynamic_field=True
            )
            schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
            schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM)
            schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535)
            
            index_params = self.client.prepare_index_params()
            index_params.add_index(
                field_name="vector", 
                index_type="FLAT",
                metric_type="COSINE"
            )
            
            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                schema=schema,
                index_params=index_params
            )
            
    def index_all_raw_data(self):
        """Fetches raw data from SQLite and indexes it into Milvus."""
        print("[RAG] Indexing raw data into Milvus Vector Database...")
        conn = get_connection()
        cursor = conn.cursor()
        
        # We assume `observations` acts as our raw data source (from candidate_generator phase)
        cursor.execute("SELECT id, content FROM observations")
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            print("[RAG] No data to index.")
            return

        # Simple batched insert
        batch_size = 100
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i+batch_size]
            ids = [row[0] for row in batch]
            texts = [row[1] for row in batch]
            vectors = self.encoder.encode(texts).tolist()
            
            data = [
                {"id": ids[j], "vector": vectors[j], "text": texts[j]}
                for j in range(len(batch))
            ]
            self.client.insert(collection_name=COLLECTION_NAME, data=data)
            
        print(f"[RAG] Successfully indexed {len(rows)} evidence chunks.")
        
    def search_evidence(self, query_text, limit=5):
        """Searches Milvus for semantically relevant context to eliminate AI Slops."""
        query_vector = self.encoder.encode([query_text]).tolist()
        
        res = self.client.search(
            collection_name=COLLECTION_NAME,
            data=query_vector,
            limit=limit,
            output_fields=["text"]
        )
        
        evidence_list = []
        for hits in res:
            for hit in hits:
                evidence_list.append(hit["entity"]["text"])
                
        return evidence_list

# Singleton instance
rag = None
def get_rag_engine():
    global rag
    if rag is None:
        rag = RAGEngine()
    return rag
