import requests
import uuid
from datetime import datetime
from .db import get_sync_db

GITHUB_API_URL = "https://api.github.com/repos"
TARGET_REPO = "facebook/react"

def fetch_recent_issues(repo=TARGET_REPO, limit=30):
    url = f"{GITHUB_API_URL}/{repo}/issues"
    params = {
        "state": "all",
        "per_page": limit,
        "sort": "updated",
        "direction": "desc"
    }
    
    response = requests.get(url, params=params)
    if response.status_code != 200:
        print(f"Failed to fetch issues: {response.status_code}")
        return []
        
    return response.json()

def ingest_data():
    issues = fetch_recent_issues()
    print(f"Fetched {len(issues)} issues/PRs.")
    
    db = get_sync_db()
    
    for item in issues:
        entity_id = f"github_{item['id']}"
        entity_type = "pull_request" if "pull_request" in item else "issue"
        
        # Upsert Entity
        db.entities.update_one(
            {"id": entity_id},
            {"$set": {
                "type": entity_type,
                "name": item['title'],
                "url": item['html_url']
            }},
            upsert=True
        )
        
        event_id = f"event_{uuid.uuid4()}"
        timestamp = item.get('updated_at', item.get('created_at'))
        actor = item['user']['login']
        
        # Insert Event
        db.events.insert_one({
            "id": event_id,
            "entity_id": entity_id,
            "event_type": "updated",
            "timestamp": timestamp,
            "actor": actor
        })
        
        obs_id = f"obs_{uuid.uuid4()}"
        body = item.get('body', '') or ''
        
        extracted_claims = "[]"
        if "React" in body or "Hook" in body or "Error" in body:
            extracted_claims = '["Contains potentially systemic keyword"]'
            
        # Insert Observation
        db.observations.insert_one({
            "id": obs_id,
            "event_id": event_id,
            "content": body,
            "extracted_claims": extracted_claims
        })
        
    print("Ingestion complete.")

if __name__ == "__main__":
    ingest_data()
