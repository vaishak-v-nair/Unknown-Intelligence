import asyncio
import httpx
import time
import uuid
import json
from .db import get_connection

API_URL = "http://localhost:8000/api"
NUM_MOCK_FINDINGS = 10000
CONCURRENT_REQUESTS = 500

def seed_database():
    print(f"Injecting {NUM_MOCK_FINDINGS} mock findings into the database...")
    conn = get_connection()
    conn.execute("BEGIN IMMEDIATE")
    cursor = conn.cursor()
    
    # We create a dummy evidence record first so RAG works
    dummy_ev_id = str(uuid.uuid4())
    cursor.execute("INSERT OR IGNORE INTO entities (id, type, name, url) VALUES (?, ?, ?, ?)",
                   (dummy_ev_id, 'ISSUE', dummy_ev_id, "https://github.com/mock/mock/issues/1"))
    cursor.execute("INSERT INTO events (id, entity_id, event_type, timestamp, actor) VALUES (?, ?, ?, ?, ?)",
                   (dummy_ev_id, dummy_ev_id, 'created', '2026-08-30T10:00:00Z', 'load_tester'))
    cursor.execute("INSERT INTO observations (id, event_id, content, extracted_claims) VALUES (?, ?, ?, ?)",
                   (str(uuid.uuid4()), dummy_ev_id, "Memory leak detected.", json.dumps(["leak"])))

    # Bulk insert findings
    findings = []
    for i in range(NUM_MOCK_FINDINGS):
        findings.append((
            f"cand_{uuid.uuid4()}",
            f"hash_{uuid.uuid4()}",
            f"Load Test Discovery #{i}",
            json.dumps([dummy_ev_id]),
            0.99,
            "VERIFIED_DISCOVERY"
        ))
        
    cursor.executemany("""
        INSERT INTO findings (id, hash_key, claim, evidence_ids, significance_score, status) 
        VALUES (?, ?, ?, ?, ?, ?)
    """, findings)
    
    conn.commit()
    conn.close()
    print("Database seeded.")

async def fetch_endpoint(client, url):
    try:
        response = await client.get(url)
        return response.status_code
    except Exception as e:
        return str(e)

async def run_pressure_test():
    print(f"Firing {CONCURRENT_REQUESTS} concurrent requests at FastAPI...")
    
    # We will query the main feed and the evidence endpoint simultaneously
    endpoints = [
        f"{API_URL}/findings?limit=100&offset=0",
        f"{API_URL}/findings?limit=100&offset=500",
    ]
    
    start_time = time.time()
    
    async with httpx.AsyncClient(limits=httpx.Limits(max_connections=1000)) as client:
        tasks = []
        for i in range(CONCURRENT_REQUESTS):
            url = endpoints[i % len(endpoints)]
            tasks.append(fetch_endpoint(client, url))
            
        results = await asyncio.gather(*tasks)
        
    duration = time.time() - start_time
    
    success_count = sum(1 for r in results if r == 200)
    error_count = len(results) - success_count
    
    print("=" * 50)
    print("PRESSURE TEST RESULTS")
    print("=" * 50)
    print(f"Total Requests: {CONCURRENT_REQUESTS}")
    print(f"Time Taken:     {duration:.2f} seconds")
    print(f"Success (200):  {success_count}")
    print(f"Errors:         {error_count}")
    
    if error_count > 0:
        print("Sample errors:", [r for r in results if r != 200][:5])
        
    if success_count == CONCURRENT_REQUESTS:
        print("\nSUCCESS: FastAPI and SQLite WAL mode handled the load perfectly.")

if __name__ == "__main__":
    seed_database()
    asyncio.run(run_pressure_test())
