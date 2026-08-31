import asyncio
import httpx
import time

API_BASE_URL = "http://localhost:8000/api"

async def fetch_endpoint(client, endpoint):
    try:
        response = await client.get(f"{API_BASE_URL}{endpoint}")
        return response.status_code == 200
    except Exception as e:
        return False

async def run_pressure_test(num_requests=500):
    print(f"Starting pressure test: {num_requests} concurrent requests to API endpoints...")
    start_time = time.time()
    
    endpoints = ["/telemetry", "/status", "/findings"]
    
    async with httpx.AsyncClient() as client:
        tasks = []
        for i in range(num_requests):
            # cycle through endpoints
            ep = endpoints[i % len(endpoints)]
            tasks.append(fetch_endpoint(client, ep))
            
        results = await asyncio.gather(*tasks)
        
    duration = time.time() - start_time
    success_count = sum(results)
    fail_count = len(results) - success_count
    
    print("\n--- PRESSURE TEST RESULTS ---")
    print(f"Total Requests: {num_requests}")
    print(f"Successful:   {success_count}")
    print(f"Failed:       {fail_count}")
    print(f"Time Taken:   {duration:.2f} seconds")
    print(f"Reqs/Sec:     {(num_requests/duration):.2f}")
    
    if fail_count > 0:
        print("[!] Warning: Some requests failed under load. Check MongoDB connections and FastAPI concurrency limits.")
    else:
        print("[*] PASS: API handles concurrency seamlessly.")

if __name__ == "__main__":
    asyncio.run(run_pressure_test(200))
