import sys
import json
from .db import get_connection

def query_evidence(keyword, limit=5):
    """
    RAG Semantic/Lexical Retrieval Layer.
    Uses SQLite FTS5 to find exact matches for evidence gathering.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # FTS5 match query
    query = """
        SELECT o.content, ev.timestamp, ev.actor, e.url, e.name
        FROM observations_fts fts
        JOIN observations o ON fts.rowid = o.rowid
        JOIN events ev ON o.event_id = ev.id
        JOIN entities e ON ev.entity_id = e.id
        WHERE observations_fts MATCH ?
        ORDER BY ev.timestamp DESC
        LIMIT ?
    """
    
    try:
        cursor.execute(query, (keyword, limit))
        results = cursor.fetchall()
        return results
    except Exception as e:
        print(f"RAG Retrieval Error: {e}")
        return []

def print_evidence_viewer(keyword):
    print(f"\n{'='*50}")
    print(f"RAG EVIDENCE VIEWER: Query -> '{keyword}'")
    print(f"{'='*50}\n")
    
    results = query_evidence(keyword)
    
    if not results:
        print("No evidence found matching the query in the local state.")
        return
        
    for i, (content, timestamp, actor, url, title) in enumerate(results):
        print(f"--- Evidence #{i+1} ---")
        print(f"Title:      {title}")
        print(f"Source URL: {url}")
        print(f"Timestamp:  {timestamp}")
        print(f"Author:     {actor}")
        print(f"Snippet:    {content[:150]}...\n")

if __name__ == "__main__":
    keyword = sys.argv[1] if len(sys.argv) > 1 else "React"
    print_evidence_viewer(keyword)
