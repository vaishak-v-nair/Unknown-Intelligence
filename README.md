# UNKNOWN INTELLIGENCE
> **Reveal the Unseen.**

Unknown Intelligence is a proactive data intelligence platform built to eliminate blind spots. It is not just another dashboard; it is an autonomous orchestration engine that constantly monitors your data, vectorizes observations, tracks cross-author convergence, and surfaces anomalies before they become catastrophic failures.

Stop guessing. The data is already there. You just need the right engine to piece it together.

---

## ⚡ CORE PIPELINE

The platform operates autonomously in three distinct phases:

1. **INGESTION**: Live parallel streams of unstructured data are scraped, normalized, and stored seamlessly into our backend.
2. **VECTORIZATION**: Textual observations are instantly translated into high-dimensional vector embeddings, allowing for rapid semantic similarity search across massive datasets.
3. **SYNTHESIS**: Background agents autonomously cross-reference these vectors, formulate hypotheses, demand evidence, and brutally reject hallucinations before anything reaches your dashboard.

---

## 🛠 ARCHITECTURE (System v2.0)

Built for infinite scale with zero downtime. 

- **Frontend**: React + Vite + TailwindCSS. A bespoke, brutalist-inspired UI maximizing data density and high-contrast telemetry. No soft edges. No AI-slop glassmorphism.
- **Backend API**: Python + FastAPI. A high-performance, strictly-typed REST interface.
- **Data & Intelligence**: Powered by a robust Hybrid Search Engine, integrating standard document databases with lightning-fast vector search for RAG provenance.
- **Orchestrator**: An asynchronous infinite loop running autonomously in the background, continuously driving discovery without manual triggers.

---

## 🚀 LAUNCH PROTOCOL

### Prerequisites
- Python 3.10+
- Node.js & npm

### Initial Configuration
1. Initialize your environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Prepare the frontend:
   ```powershell
   cd frontend
   npm install
   cd ..
   ```
3. Inject your API keys into a `.env` file at the root:
   ```env
   GROQ_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ```

### Execution
Start the entire stack (Database Bootstrapping, Backend API, Frontend UI, and Proactive Orchestrator) in a single command. 

```powershell
.\start.ps1
```

Once initialized, the system will output telemetry directly to your browser at **http://localhost:5173**. 

---

> **WARNING**: The background orchestrator never sleeps. Once `start.ps1` is executed, the agent will continuously scan the vector database for newly ingested anomalies until the process is explicitly terminated.
