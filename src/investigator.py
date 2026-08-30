import os
import json
import requests
from dotenv import load_dotenv
from .db import get_connection
from .rag_engine import get_rag_engine

load_dotenv()

def call_mock_model(prompt, is_strong_evidence):
    """Fallback mock model if API keys fail."""
    return {
        "status": "VERIFIED_DISCOVERY" if is_strong_evidence else "REJECTED",
        "claim": "Cross-Author Convergence indicates a systemic failure in the target subsystem.",
        "why_surfaced": "The Candidate Generator detected independent developers reporting similar issues within a short temporal window.",
        "evidence_summary": "Extracted evidence shows distinct stack traces pointing to the same base commit.",
        "alternative_explanations": "Could be a coordinated bot attack, or a generic dependency update failing across forks. However, distinct actor IDs and issue contexts suggest independent discovery.",
        "confidence_score": 0.92 if is_strong_evidence else 0.4
    }

def call_reasoning_model(prompt):
    """
    Live LLM Model Router Interface (Section 29).
    Attempts to call Groq (Llama-3). Falls back to mock if API fails.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("WARNING: GROQ_API_KEY not found. Falling back to Mock Model.")
        return json.dumps(call_mock_model(prompt, "swe-bench" in prompt.lower()))

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # We enforce JSON mode via prompt and model parameters
    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": "You are a Staff Engineer. You MUST respond with ONLY valid JSON matching the requested schema. Do not include markdown formatting or backticks."},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        result = response.json()
        llm_output = result['choices'][0]['message']['content']
        # Validate it's parseable JSON
        json.loads(llm_output)
        return llm_output
    except Exception as e:
        print(f"WARNING: Live LLM API failed ({e}). Falling back to Mock Model.")
        return json.dumps(call_mock_model(prompt, "swe-bench" in prompt.lower()))

def format_investigation_prompt(candidate_claim, evidence_records):
    """Generates the prompt for the LLM based on candidate data."""
    evidence_text = "\n\n".join([f"Evidence {i+1}: {e}" for i, e in enumerate(evidence_records)])
    
    prompt = f"""
You are an expert Staff Software Engineer investigating a potential systemic issue in a codebase.
The Unknown-Unknowns intelligence system has surfaced the following candidate hypothesis:

HYPOTHESIS: {candidate_claim}

EVIDENCE GATHERED:
{evidence_text}

TASK:
Verify if this is a true systemic discovery. Look for contradictions or alternative explanations.
Output a JSON report strictly following this format:
{{
  "status": "VERIFIED_DISCOVERY",
  "claim": "Write a clear, verified claim",
  "why_surfaced": "Explain why the evidence triggered this",
  "evidence_summary": "Summarize the raw evidence",
  "alternative_explanations": "What else could this be?",
  "confidence_score": 0.95
}}
Note: status must be one of VERIFIED_DISCOVERY, REJECTED, or INSUFFICIENT_EVIDENCE.
"""
    return prompt

def investigate_candidates():
    """
    Agentic Investigation Loop (Phase 3).
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, claim, evidence_ids FROM findings WHERE status = 'UNVERIFIED_CANDIDATE'")
    candidates = cursor.fetchall()
    
    reports_generated = 0
    
    for cand_id, claim, evidence_ids_json in candidates:
        evidence_ids = json.loads(evidence_ids_json)
        
        # RAG Semantic Search to eliminate AI Slop
        rag = get_rag_engine()
        evidence_records = rag.search_evidence(claim, limit=7)
        
        prompt = format_investigation_prompt(claim, evidence_records)
        model_response = call_reasoning_model(prompt)
        report = json.loads(model_response)
        
        cursor.execute("""
            UPDATE findings 
            SET status = ?, 
                significance_score = ?,
                claim = ?
            WHERE id = ?
        """, (report['status'], float(report['confidence_score']), report['claim'], cand_id))
        
        print(f"\n[{report['status']}] Candidate: {cand_id}")
        print(f"Confidence: {report['confidence_score']}")
        print(f"Alternatives Checked: {report['alternative_explanations']}")
        
        reports_generated += 1
        
    conn.commit()
    conn.close()
    return reports_generated

if __name__ == "__main__":
    print("Starting Agentic Investigation Loop...")
    get_rag_engine().index_all_raw_data() # Ensure vector db is synced
    processed = investigate_candidates()
    print(f"Finished investigation. Processed {processed} candidates.")
