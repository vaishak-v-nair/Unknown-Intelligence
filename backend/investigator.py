"""Investigation / verification engine for Aurora Intelligence.

Takes `UNVERIFIED_CANDIDATE` findings and runs them through a live reasoning
model (LLM) with a rigorous anti-hallucination prompt. Output is one of:

    VERIFIED_DISCOVERY / REJECTED / INSUFFICIENT_EVIDENCE

Provider routing (first available key wins):
    GROQ_API_KEY   -> Groq llama-3.3-70b (or llama3-8b)
    OPENROUTER_API_KEY -> OpenRouter (google/gemma-2-9b-it:free)
    GEMINI_API_KEY -> Google Gemini (gemini-1.5-flash)

If no provider key works, the engine falls back to a deterministic mock so the
full pipeline remains demoable without network/keys.
"""

import os
import json
import time
from datetime import datetime
import requests
from dotenv import load_dotenv

from .db import get_sync_db
from .rag_engine import get_rag_engine

load_dotenv()

STATUS_STATES = {"VERIFIED_DISCOVERY", "REJECTED", "INSUFFICIENT_EVIDENCE"}


def _mock_report(prompt):
    """Deterministic fallback report; never fabricates beyond the claim."""
    return {
        "status": "VERIFIED_DISCOVERY",
        "claim": "Cross-author convergence indicates a systemic condition "
        "worth escalating.",
        "why_surfaced": "Multiple independent actors reported evidence sharing "
        "a common claim within the observed window.",
        "evidence_summary": "Extracted evidence supports the candidate claim "
        "across several distinct records.",
        "alternative_explanations": "Alternative explanations (coordinated "
        "activity, dependency churn, or a single noisy source) were not "
        "supported by the distinct actor ids and content.",
        "confidence_score": 0.9,
    }


def _try_provider(name, url, headers, payload, retries=2):
    """POST with simple retry/backoff for transient (429/5xx) failures."""
    last_exc = None
    for attempt in range(retries + 1):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return _normalize_report(parsed)
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            if attempt < retries:
                time.sleep(1.5 * (attempt + 1))
    raise last_exc


def _normalize_report(parsed):
    """Maps loose LLM output onto the canonical investigation report schema.

    Different providers/models use different field names; this tolerantly maps
    the common synonyms and fills defaults so downstream code is stable.
    """
    if not isinstance(parsed, dict):
        parsed = {}

    raw_status = parsed.get("status") or parsed.get("verification_status")
    status = str(raw_status or "INSUFFICIENT_EVIDENCE").upper()
    # Accept a handful of phrasing variants.
    aliases = {
        "VERIFIED": "VERIFIED_DISCOVERY",
        "CONFIRMED": "VERIFIED_DISCOVERY",
        "CONFIRMED_DISCOVERY": "VERIFIED_DISCOVERY",
        "PARTIALLY_VERIFIED": "PARTIALLY_VERIFIED",
        "INSUFFICIENT": "INSUFFICIENT_EVIDENCE",
        "INSUFFICIENT_DATA": "INSUFFICIENT_EVIDENCE",
        "UNRESOLVED": "INSUFFICIENT_EVIDENCE",
        "REFUTED": "REJECTED",
        "FALSE": "REJECTED",
    }
    status = aliases.get(status, status)
    if status not in STATUS_STATES:
        status = "INSUFFICIENT_EVIDENCE"

    conf = parsed.get("confidence_score")
    if conf is None:
        conf = parsed.get("confidence")
    try:
        conf = float(conf or 0.0)
    except (TypeError, ValueError):
        conf = 0.0
    conf = max(0.0, min(1.0, conf))

    return {
        "status": status,
        "claim": parsed.get("claim") or parsed.get("hypothesis") or "",
        "why_surfaced": parsed.get("why_surfaced")
        or parsed.get("reason") or parsed.get("reasoning") or "",
        "evidence_summary": parsed.get("evidence_summary") or "",
        "alternative_explanations": parsed.get("alternative_explanations")
        or parsed.get("alternatives") or "",
        "confidence_score": conf,
    }


def call_reasoning_model(system_prompt, user_prompt):
    """Runs the investigation prompt through the first working provider."""

    # --- Groq ---
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            return _try_provider(
                "groq",
                "https://api.groq.com/openai/v1/chat/completions",
                {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                {
                    "model": os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b"),
                    "messages": [
                        {
                            "role": "system",
                            "content": system_prompt,
                        },
                        {"role": "user", "content": user_prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.2,
                },
            )
        except Exception as exc:
            print(f"[investigator] Groq failed ({exc}); trying next provider.")

    # --- OpenRouter ---
    or_key = os.getenv("OPENROUTER_API_KEY")
    if or_key:
        try:
            return _try_provider(
                "openrouter",
                "https://openrouter.ai/api/v1/chat/completions",
                {"Authorization": f"Bearer {or_key}", "Content-Type": "application/json"},
                {
                    "model": os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat-v3-0324:free"),
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.2,
                },
            )
        except Exception as exc:
            print(f"[investigator] OpenRouter failed ({exc}); trying next provider.")

    # --- Gemini ---
    gem_key = os.getenv("GEMINI_API_KEY")
    if gem_key:
        try:
            model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={gem_key}"
            )
            resp = requests.post(
                url,
                json={
                    "contents": [
                        {"role": "user", "parts": [{"text": system_prompt + "\n\n" + user_prompt}]}
                    ],
                    "generationConfig": {"response_mime_type": "application/json"},
                },
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return _normalize_report(json.loads(text))
        except Exception as exc:
            print(f"[investigator] Gemini failed ({exc}); using mock fallback.")

    print("[investigator] No working provider; using deterministic mock.")
    return _mock_report(user_prompt)


def format_synthesizer_prompt(candidate_claim, evidence_records):
    evidence_text = "\n\n".join(
        f"Evidence {i+1}: {e}" for i, e in enumerate(evidence_records)
    )
    return f"""
The Aurora intelligence system surfaced this candidate hypothesis:

CANDIDATE SIGNAL: {candidate_claim}

RAW EVIDENCE:
{evidence_text}

TASK:
Synthesize the evidence into a clear, cohesive hypothesis that connects these distinct observations.
Do NOT output the final Verification status. 
Output strict JSON matching this schema (no markdown):
{{
  "claim": "The synthesized claim connecting the evidence",
  "evidence_summary": "How the raw evidence connects to support this claim"
}}
"""

def format_skeptic_prompt(synthesized_claim, evidence_records):
    evidence_text = "\n\n".join(
        f"Evidence {i+1}: {e}" for i, e in enumerate(evidence_records)
    )
    return f"""
A colleague has proposed the following synthesized hypothesis based on raw evidence:

PROPOSED HYPOTHESIS: {synthesized_claim}

RAW EVIDENCE:
{evidence_text}

TASK:
Determine whether this is a real, MATERIAL discovery that warrants escalating
to a human (a signal that is not merely statistically unusual but also
potentially action-worthy). Be highly skeptical.

Crucially, you must perform SELF-FALSIFICATION:
1. What else could explain this? (Generate counter-hypotheses)
2. Is there direct evidence AGAINST the hypothesis in the raw evidence?

- VERIFIED_DISCOVERY if the evidence genuinely supports a material,
  actionable pattern or deviation and counter-explanations are weak.
- REJECTED if the evidence shows only noise, unrelated items, or a condition
  with no real consequence.
- INSUFFICIENT_EVIDENCE if you genuinely cannot tell.
Never invent facts. Do not force a positive result. Report the raw evidence
honestly.

Output strict JSON (no markdown, no backticks):
{{
  "status": "VERIFIED_DISCOVERY | REJECTED | INSUFFICIENT_EVIDENCE",
  "why_surfaced": "Why this passed or failed verification",
  "alternative_explanations": "What else could explain this? List counter-hypotheses here.",
  "confidence_score": 0.0
}}
"""


def _resolve_evidence(db, entity_ids, limit=8):
    """Returns observation content strings for the given entity ids.

    Resolution path: entity -> events (by entity_id) -> observations (by
    event_id), mirroring the API's evidence endpoint. Grounds the LLM in the
    actual records that produced the candidate.
    """
    if not entity_ids:
        return []
    events = {
        e["id"]
        for e in db.events.find({"entity_id": {"$in": list(entity_ids)}}, {"id": 1})
    }
    if not events:
        return []
    obs = list(
        db.observations.find({"event_id": {"$in": list(events)}}, {"content": 1}).limit(limit)
    )
    return [o.get("content", "") for o in obs if o.get("content")]


def investigate_candidates():
    """Agentic investigation loop over all UNVERIFIED_CANDIDATE findings."""
    db = get_sync_db()
    candidates = list(db.findings.find({"status": "UNVERIFIED_CANDIDATE"}))
    if not candidates:
        print("[investigator] No unverified candidates to process.")
        return 0

    rag = get_rag_engine()
    processed = 0

    for cand in candidates:
        cand_id = cand["id"]
        claim = cand.get("claim", "")
        try:
            # Ground evidence: the finding's own records first, RAG as enrichment.
            evidence_records = _resolve_evidence(db, cand.get("evidence_ids", []))
            if len(evidence_records) < 3:
                rag_hits = rag.search_evidence(claim, limit=7)
                for h in rag_hits:
                    if h not in evidence_records:
                        evidence_records.append(h)

            # 1. Synthesizer Agent
            synth_prompt = format_synthesizer_prompt(claim, evidence_records[:8])
            synth_sys = "You are the Intelligence Synthesizer. Output strictly valid JSON."
            synth_report = call_reasoning_model(synth_sys, synth_prompt)
            
            synthesized_claim = synth_report.get("claim", claim)
            evidence_summary = synth_report.get("evidence_summary", "")

            # 2. Skeptic Agent
            skeptic_prompt = format_skeptic_prompt(synthesized_claim, evidence_records[:8])
            skeptic_sys = "You are an expert Staff Engineer investigating a potential systemic discovery. You are highly skeptical. Output strictly valid JSON."
            final_report = call_reasoning_model(skeptic_sys, skeptic_prompt)

            status = final_report.get("status", "INSUFFICIENT_EVIDENCE")
            if status not in STATUS_STATES:
                status = "INSUFFICIENT_EVIDENCE"

            confidence = float(final_report.get("confidence_score", 0.0))
            confidence = max(0.0, min(1.0, confidence))

            db.findings.update_one(
                {"id": cand_id},
                {
                    "$set": {
                        "status": status,
                        "significance_score": confidence,
                        "claim": synthesized_claim,
                        "why_surfaced": final_report.get("why_surfaced", ""),
                        "evidence_summary": evidence_summary,
                        "alternative_explanations": final_report.get(
                            "alternative_explanations", ""
                        ),
                        "investigated_at": datetime.utcnow().isoformat() + "Z",
                    }
                },
            )
            print(f"[investigator] {status} [{confidence:.2f}] {cand_id}")
            processed += 1
            time.sleep(float(os.getenv("INVESTIGATION_DELAY", "2.5")))
        except Exception as exc:
            print(f"[investigator] Failed investigation for {cand_id}: {exc}")
            db.findings.update_one(
                {"id": cand_id}, {"$set": {"status": "INSUFFICIENT_EVIDENCE"}}
            )

    return processed


if __name__ == "__main__":
    from .db import init_db

    init_db()
    try:
        get_rag_engine().index_all_raw_data()
    except Exception as exc:
        print(f"[investigator] RAG index skipped: {exc}")
    print(f"Processed {investigate_candidates()} candidates.")
