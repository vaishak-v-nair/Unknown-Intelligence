import time
from .candidate_generator import generate_candidates
from .investigator import investigate_candidates
from .rag_engine import get_rag_engine

def run_orchestration_loop(interval_seconds=60):
    print("==================================================")
    print(" AURORA PROACTIVE ORCHESTRATOR STARTED ")
    print(f" Polling interval: {interval_seconds}s")
    print("==================================================")
    
    while True:
        try:
            print("\n[*] Starting Discovery Cycle...")
            
            # Step 0: Sync SQLite raw_data into Milvus Vector DB (RAG)
            get_rag_engine().index_all_raw_data()
            
            # Step 1: Look for new candidate anomalies based on Cross-Author Convergence
            candidates = generate_candidates()
            
            # Step 2: Pass new candidates to the LLM agent for rigorous verification
            if candidates > 0:
                print(f"[*] Found {candidates} new candidates. Triggering LLM Investigation...")
                investigate_candidates()
            else:
                # If there are leftovers that haven't been investigated yet, catch them
                investigate_candidates()
                
            print(f"[*] Cycle Complete. Sleeping for {interval_seconds}s...")
        except Exception as e:
            print(f"[!] Orchestrator Error: {e}")
            print(f"[!] Retrying in {interval_seconds}s...")
            
        time.sleep(interval_seconds)

if __name__ == "__main__":
    # Run every 30 seconds for demonstration/MVP purposes
    run_orchestration_loop(30)
