import os
import requests
import uuid
import time
from datetime import datetime
from dotenv import load_dotenv

from .db import get_sync_db, init_db
from .rag_engine import get_rag_engine

load_dotenv()

GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Accept": "application/vnd.github.v3+json"
}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_TOKEN}"

# List of repositories for our first empirical experiment
TARGET_REPOS = [
    "facebook/react",
    "vercel/next.js",
    "tiangolo/fastapi"
]

def fetch_issues_and_prs(repo, state="all", per_page=100, pages=1):
    """Fetches issues and PRs (GitHub API treats PRs as issues initially)."""
    items = []
    for page in range(1, pages + 1):
        url = f"{GITHUB_API_URL}/repos/{repo}/issues"
        params = {
            "state": state,
            "per_page": per_page,
            "page": page,
            "sort": "updated",
            "direction": "desc"
        }
        
        response = requests.get(url, headers=HEADERS, params=params)
        if response.status_code != 200:
            print(f"[{repo}] Failed to fetch issues (Page {page}): {response.status_code} - {response.text}")
            break
            
        page_items = response.json()
        if not page_items:
            break
            
        items.extend(page_items)
        time.sleep(0.5) # rate limit protection
    return items

def fetch_comments(repo, issue_number):
    """Fetches comments for a specific issue or PR."""
    url = f"{GITHUB_API_URL}/repos/{repo}/issues/{issue_number}/comments"
    params = {"per_page": 100}
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        return []
    return response.json()

def ingest_repo(db, repo, pages=2):
    print(f"Ingesting {repo}...")
    items = fetch_issues_and_prs(repo, pages=pages)
    print(f"Fetched {len(items)} issues/PRs from {repo}.")
    
    events_inserted = 0
    obs_inserted = 0
    
    for item in items:
        # 1. Create Entity
        entity_id = f"github_{repo.replace('/', '_')}_{item['number']}"
        entity_type = "pull_request" if "pull_request" in item else "issue"
        
        db.entities.update_one(
            {"id": entity_id},
            {"$set": {
                "type": entity_type,
                "name": item.get('title', ''),
                "url": item.get('html_url', ''),
                "repository": repo,
                "created_at": item.get('created_at'),
                "updated_at": item.get('updated_at'),
                "state": item.get('state')
            }},
            upsert=True
        )
        
        # 2. Issue/PR Body as first event
        body = item.get('body')
        if body:
            event_id = f"event_{uuid.uuid4()}"
            timestamp = item.get('created_at')
            actor = item.get('user', {}).get('login', 'unknown')
            
            db.events.insert_one({
                "id": event_id,
                "entity_id": entity_id,
                "event_type": f"{entity_type}_opened",
                "timestamp": timestamp,
                "actor": actor
            })
            
            # Simple keyword matching for initial extracted claims
            extracted_claims = "[]"
            lower_body = body.lower()
            if "error" in lower_body or "bug" in lower_body or "fail" in lower_body:
                extracted_claims = '["Potential Bug/Error reported"]'
            
            db.observations.insert_one({
                "id": f"obs_{uuid.uuid4()}",
                "event_id": event_id,
                "content": body,
                "extracted_claims": extracted_claims
            })
            events_inserted += 1
            obs_inserted += 1
            
        # 3. Comments as subsequent events
        if item.get('comments', 0) > 0:
            comments = fetch_comments(repo, item['number'])
            for c in comments:
                c_body = c.get('body')
                if not c_body:
                    continue
                    
                c_event_id = f"event_{uuid.uuid4()}"
                c_timestamp = c.get('created_at')
                c_actor = c.get('user', {}).get('login', 'unknown')
                
                db.events.insert_one({
                    "id": c_event_id,
                    "entity_id": entity_id,
                    "event_type": "comment",
                    "timestamp": c_timestamp,
                    "actor": c_actor,
                    "url": c.get('html_url', '')
                })
                
                c_extracted_claims = "[]"
                lower_c_body = c_body.lower()
                if "workaround" in lower_c_body or "fix" in lower_c_body:
                    c_extracted_claims = '["Potential Workaround/Fix suggested"]'
                    
                db.observations.insert_one({
                    "id": f"obs_{uuid.uuid4()}",
                    "event_id": c_event_id,
                    "content": c_body,
                    "extracted_claims": c_extracted_claims
                })
                events_inserted += 1
                obs_inserted += 1
                
            time.sleep(0.5) # rate limit protection for comments
            
    print(f"[{repo}] Ingestion complete: {events_inserted} events, {obs_inserted} observations.")

def ingest_data():
    init_db()
    db = get_sync_db()
    
    for repo in TARGET_REPOS:
        ingest_repo(db, repo, pages=2) # 2 pages = 200 items per repo
        
    print("All ingestion complete. Re-indexing RAG engine...")
    try:
        rag = get_rag_engine()
        rag.index_all_raw_data()
        print("RAG index updated.")
    except Exception as exc:
        print(f"Failed to update RAG index: {exc}")

if __name__ == "__main__":
    ingest_data()
