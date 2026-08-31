<#
.SYNOPSIS
Launches the full-stack Aurora Intelligence Platform.

.DESCRIPTION
This script starts the FastAPI backend, the Vite/React frontend, and the Proactive Orchestrator in parallel.
It manages all child processes and ensures they are cleanly terminated when the script is stopped via Ctrl+C.
#>

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " STARTING AURORA INTELLIGENCE (FULL STACK)        " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Store job objects
$Jobs = @()

try {
    # 0. Run Initial Data Ingestion (Peak Startup Setup)
    Write-Host "[*] Bootstrapping Data Ingestion (fetching live events)..." -ForegroundColor Green
    .\.venv\Scripts\python -m backend.ingest

    # 1. Start FastAPI Backend
    Write-Host "[*] Starting FastAPI Backend on port 8000..." -ForegroundColor Green
    $backendJob = Start-Job -ScriptBlock {
        cd $using:PWD
        .\.venv\Scripts\python -m uvicorn backend.api:app --port 8000
    }
    $Jobs += $backendJob

    # 2. Start Vite Frontend
    Write-Host "[*] Starting Vite React Frontend on port 5173..." -ForegroundColor Green
    $frontendJob = Start-Job -ScriptBlock {
        cd "$using:PWD\frontend"
        npm run dev
    }
    $Jobs += $frontendJob

    # 3. Start Proactive Orchestrator (Background Loop)
    Write-Host "[*] Starting Proactive Orchestrator..." -ForegroundColor Green
    $orchestratorJob = Start-Job -ScriptBlock {
        cd $using:PWD
        .\.venv\Scripts\python -m backend.orchestrator
    }
    $Jobs += $orchestratorJob

    Write-Host "`n[SUCCESS] All services launched!" -ForegroundColor Yellow
    Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor White
    Write-Host "Backend API:  http://localhost:8000/docs" -ForegroundColor White
    Write-Host "`nPress Ctrl+C to shut down all services.`n" -ForegroundColor Gray

    # Keep the script running to keep jobs alive and receive Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Display output from the orchestrator so the user can see proactive discoveries
        Receive-Job -Job $orchestratorJob | ForEach-Object { Write-Host "  [ORCHESTRATOR] $_" -ForegroundColor DarkGray }
    }

}
finally {
    Write-Host "`n[*] Shutting down services..." -ForegroundColor Red
    foreach ($job in $Jobs) {
        Stop-Job $job
        Remove-Job $job
    }
    Write-Host "[*] Shutdown complete." -ForegroundColor Red
}
