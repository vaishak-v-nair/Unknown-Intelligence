from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
from .db import DB_PATH

app = FastAPI(
    title="Unknown-Unknowns Intelligence API",
    description="Proactive discovery backend for systemic code failures.",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For MVP, allow all. In prod, restrict to frontend domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread-safe database connection generator
def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.row_factory = sqlite3.Row
    return conn

# --- Pydantic Models (Strict Contracts) ---
class Finding(BaseModel):
    id: str
    hash_key: str
    claim: str
    evidence_ids: List[str]
    significance_score: float
    status: str
    created_at: str

class Evidence(BaseModel):
    id: str
    url: str
    author: str
    timestamp: str
    content: str

# --- Endpoints ---

@app.get("/api/findings", response_model=List[Finding])
def get_findings(limit: int = Query(50, le=1000), offset: int = 0):
    """Retrieve paginated findings from the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, hash_key, claim, evidence_ids, significance_score, status, created_at 
            FROM findings 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        rows = cursor.fetchall()
        findings = []
        for row in rows:
            findings.append(Finding(
                id=row['id'],
                hash_key=row['hash_key'],
                claim=row['claim'],
                evidence_ids=json.loads(row['evidence_ids']),
                significance_score=row['significance_score'],
                status=row['status'],
                created_at=row['created_at']
            ))
        return findings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/findings/{finding_id}/evidence", response_model=List[Evidence])
def get_evidence(finding_id: str):
    """Retrieve raw provenance evidence for a specific finding."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT evidence_ids FROM findings WHERE id = ?", (finding_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Finding not found")
            
        evidence_ids = json.loads(row['evidence_ids'])
        if not evidence_ids:
            return []
            
        placeholders = ','.join(['?'] * len(evidence_ids))
        cursor.execute(f'''
            SELECT e.id, e.url, ev.actor as author, ev.timestamp, o.content 
            FROM entities e
            JOIN events ev ON e.id = ev.entity_id
            JOIN observations o ON ev.id = o.event_id
            WHERE e.id IN ({placeholders})
            ORDER BY ev.timestamp DESC
        ''', evidence_ids)
        
        results = []
        for r in cursor.fetchall():
            results.append(Evidence(
                id=r['id'],
                url=r['url'],
                author=r['author'],
                timestamp=r['timestamp'],
                content=r['content']
            ))
        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
