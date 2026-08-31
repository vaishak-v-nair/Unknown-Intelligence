# Testing & Usage Guide

## The "Empty Dashboard" Problem
If you start the project and the dashboard shows **0 MB, 0 Entities, 0 Findings**, this simply means the backend database is empty. The platform is designed to process data, but it needs data to be fed into it first!

## How to Populate the Dashboard (Testing)

To test the system at peak level and see the dashboard come alive with data, you must run the ingestion script. This simulates data coming into the platform.

### Step 1: Open a new terminal
Make sure you are in the project root directory (`e:\BrosKi\unknown`).

### Step 2: Run the Ingestion Script
Execute the following command to ingest live GitHub issues into the MongoDB database:

```powershell
.\.venv\Scripts\python -m backend.ingest
```

*(Note: Ensure you run this while the `.venv` is active, or use the exact path above.)*

### Step 3: Watch the Dashboard
As soon as the script completes, flip back to your running dashboard (http://localhost:5173). You will immediately see:
1. The **Live Telemetry** tab populate with incoming events.
2. The **Agent Status** tab reflect a growth in DB Size and Entities.
3. If the background orchestrator (`start.ps1`) is running, it will automatically detect the new data and start processing RAG vectors and LLM investigations. Soon, anomalies will appear in the **Discovered Anomalies** tab!

## Peak Level Start-up Configuration
This project is currently optimized for production-grade testing:
- **MongoDB** is handling robust document storage.
- **Milvus Lite** is processing vector similarity for RAG context.
- **React/Vite** is rendering a high-density, minimal, and premium UI.
- **FastAPI** is bridging the gap with low latency.

You do not need to perform complex manual tests. The platform is designed to be autonomous. Once you feed it data (Step 2), it operates on its own.
