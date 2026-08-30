import requests
import json
import uuid
import datetime
from .db import get_connection

GITHUB_API_URL = "https://api.github.com/repos"
# For MVP, we'll use a specific repo to test with, let's use a popular one like facebook/react
TARGET_REPO = "facebook/react"

def fetch_recent_issues(repo=TARGET_REPO, limit=30):
    """Fetch recent issues and PRs from GitHub API."""
    url = f"{GITHUB_API_URL}/{repo}/issues"
    params = {
        "state": "all",
        "per_page": limit,
        "sort": "updated",
        "direction": "desc"
    }
    
    # In a real environment, we'd use a GITHUB_TOKEN to avoid rate limits
    response = requests.get(url, params=params)
    if response.status_code != 200:
        print(f"Failed to fetch issues: {response.status_code}")
        return []
        
    return response.json()

def ingest_data():
    issues = fetch_recent_issues()
    print(f"Fetched {len(issues)} issues/PRs.")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    for item in issues:
        # 1. Normalize Entity
        entity_id = f"github_{item['id']}"
        entity_type = "pull_request" if "pull_request" in item else "issue"
        
        cursor.execute(
            "INSERT OR IGNORE INTO entities (id, type, name, url) VALUES (?, ?, ?, ?)",
            (entity_id, entity_type, item['title'], item['html_url'])
        )
        
        # 2. Normalize Event (Creation/Update)
        event_id = f"event_{uuid.uuid4()}"
        timestamp = item.get('updated_at', item.get('created_at'))
        actor = item['user']['login']
        
        cursor.execute(
            "INSERT INTO events (id, entity_id, event_type, timestamp, actor) VALUES (?, ?, ?, ?, ?)",
            (event_id, entity_id, "updated", timestamp, actor)
        )
        
        # 3. Normalize Observation (The body text)
        obs_id = f"obs_{uuid.uuid4()}"
        body = item.get('body', '') or ''
        
        # Lightweight heuristic: extracting potential code references or component names
        extracted_claims = "[]"
        if "React" in body or "Hook" in body or "Error" in body:
            extracted_claims = '["Contains potentially systemic keyword"]'
            
        cursor.execute(
            "INSERT INTO observations (id, event_id, content, extracted_claims) VALUES (?, ?, ?, ?)",
            (obs_id, event_id, body, extracted_claims)
        )
        
    conn.commit()
    conn.close()
    print("Ingestion complete.")

if __name__ == "__main__":
    ingest_data()
