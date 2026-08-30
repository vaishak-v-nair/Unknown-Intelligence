# Aurora Intelligence (Unknown-Unknowns)

A full-stack, proactive data intelligence platform designed to discover important anomalies you didn't know to ask about. Built strictly with Zero-Budget architecture (SQLite, Python, React, FastAPI).

## 1. Architecture Overview
This system operates in three decoupled layers:
1. **The Intelligence Engine (Python + SQLite):** Continuously ingests data, surfaces candidates via "Cross-Author Convergence" algorithms, and investigates them using a live LLM via a rigorous system prompt.
2. **The Backend API (FastAPI):** A high-performance, strictly-typed REST API serving the discovery feed and raw evidence RAG provenance. 
3. **The Dashboard (React + Vite):** A premium, minimal, glassmorphism UI designed for high data density and decision-first architecture.

## 2. Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js & npm

### Installation
1. Install Python backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
2. Install React frontend dependencies:
   ```powershell
   cd frontend
   npm install
   cd ..
   ```
3. Configure your `.env` file with your LLM API keys:
   ```env
   GROQ_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ```

## 3. Running the Platform
To launch the entire platform (Frontend, Backend, and Proactive Background Orchestrator) with a single command, run the included PowerShell script:

```powershell
.\start.ps1
```

Once running, access the dashboard at: **http://localhost:5173**

## 4. The Proactive Orchestrator
When you run `start.ps1`, it spins up `src/orchestrator.py` in the background. This is an infinite loop that constantly monitors the SQLite database for new data, groups anomalous behavior, and automatically fires off LLM investigations without any human intervention.
