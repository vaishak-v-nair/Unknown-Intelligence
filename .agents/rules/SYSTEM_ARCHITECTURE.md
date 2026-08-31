# SYSTEM_ARCHITECTURE.md
# File: .agents/rules/SYSTEM_ARCHITECTURE.md
# Target Audience: AI Agents, Gemini, Antigravity Models
# Purpose: Deep, fast, machine-readable understanding of UNKNOWN_INTELLIGENCE core logic.

---

## 1. Core Logic & Architecture Paradigm

**UNKNOWN_INTELLIGENCE** is a proactive data intelligence platform.
It uses a **Three-Tier Startup Architecture (Peak Level)**:
1. **Frontend**: React + Vite + TailwindCSS. High-density, glassmorphism design. Live dashboard polling for real-time telemetry.
2. **Backend API (FastAPI)**: RESTful stateless layer in Python. Exposes MongoDB data (Entities, Events, Observations, Findings) to the frontend.
3. **Proactive Background Orchestrator**: An infinite loop (`backend/orchestrator.py`) running independently to scan the DB for new events, run cross-author convergence checks, and utilize LLMs (Gemini/Groq) for candidate generation and investigation.

## 2. Data Flow & Ingestion (Crucial for Testing)

To see the dashboard actually work, **data must be ingested**.
- **Ingestion Script**: `python -m backend.ingest`
- **What it does**: Hits the GitHub API (e.g., `facebook/react`), fetches 30 recent issues/PRs, and translates them into native Entities, Events, and Observations in MongoDB.
- **Why this matters**: Without running the ingest script, the MongoDB instance remains empty, resulting in a blank dashboard (0 MB, 0 Entities).

## 3. Storage Layer

- **MongoDB**: Used for storing standard relational data structure documents:
  - `entities`: Users, repos, items.
  - `events`: Specific occurrences (e.g., issue created).
  - `observations`: Deep data (e.g., text content, claims).
  - `findings`: LLM-generated discoveries/anomalies (the final product).
- **Milvus Lite**: Used exclusively for RAG (Retrieval-Augmented Generation) vector embeddings within `backend/rag_engine.py`. This gives the LLM high-context search capabilities over the ingested observations.

## 4. How to Develop & Test (Agent Guidelines)

**DO NOT** do frame-by-frame saving or overly complex discovery loops unless requested. The architecture is straightforward.
When testing:
1. Ensure the Python environment (`.venv`) is activated.
2. Run `backend.api` via Uvicorn for the backend.
3. Run `npm run dev` for the frontend.
4. Run `backend.orchestrator` to simulate the AI agent working in the background.
5. **Critically:** Run `python -m backend.ingest` to feed the beast and populate the dashboard.

## 5. System Health & Monitoring

The system health indicators on the dashboard are driven by actual DB metrics. The orchestrator checks MongoDB periodically and outputs its status, which the frontend polls via `/api/status`. The RAG status reflects the Milvus vector database state.

---
**Agent Directive:** When working on this project, immediately reference this file. Do not wander through the codebase guessing how things connect. The orchestrator generates findings, the API serves them, and the frontend beautifully visualizes them.
