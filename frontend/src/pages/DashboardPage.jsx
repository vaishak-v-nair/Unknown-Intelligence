import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ChevronRight, X, Database, RefreshCw, Terminal, Server, Command, CheckCircle2, FileCode2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFindings, fetchEvidence, fetchTelemetry, fetchSystemStatus } from '../api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  const [telemetry, setTelemetry] = useState([]);
  const [sysStatus, setSysStatus] = useState(null);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [fData, tData, sData] = await Promise.all([
        fetchFindings(),
        fetchTelemetry(),
        fetchSystemStatus()
      ]);
      setFindings(fData);
      setTelemetry(tData);
      setSysStatus(sData);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (finding) => {
    setSelectedFinding(finding);
    setIsPaneOpen(true);
    setEvidenceLoading(true);
    try {
      const data = await fetchEvidence(finding.id);
      setEvidence(data);
    } catch (error) {
      console.error("Failed to load evidence", error);
    } finally {
      setEvidenceLoading(false);
    }
  };

  const closePane = () => {
    setIsPaneOpen(false);
    setTimeout(() => {
      setSelectedFinding(null);
      setEvidence([]);
    }, 300);
  };

  const getStatusBadge = (status, score) => {
    if (score && score > 0.85) return <span className="badge badge-danger">HIGH CONF</span>;
    if (score && score > 0.5) return <span className="badge badge-warning">MED CONF</span>;
    
    switch (status) {
      case 'VERIFIED_DISCOVERY':
        return <span className="badge badge-success">VERIFIED</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">REJECTED</span>;
      default:
        return <span className="badge badge-neutral">CANDIDATE</span>;
    }
  };

  const navItemClass = (tabId) => `px-4 py-2 rounded-lg flex items-center gap-3 cursor-pointer text-sm transition-all duration-200 ${
    activeTab === tabId 
      ? 'bg-muted font-medium text-foreground border border-border' 
      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
  }`;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col p-4 bg-background border-r border-border relative z-20">
        <div className="flex items-center mb-8 gap-3 px-2 mt-2">
          <Command size={20} className="text-foreground" />
          <h1 className="text-sm font-semibold tracking-tight">UnknownUnknowns</h1>
        </div>
        
        <div className="mb-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider px-4">Workspace</div>
        <nav className="flex flex-col gap-1 mb-8">
          <div onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
            <Activity size={16} /> Overview
          </div>
          <div onClick={() => setActiveTab('discoveries')} className={navItemClass('discoveries')}>
            <ShieldAlert size={16} /> Discoveries
          </div>
          <div onClick={() => setActiveTab('telemetry')} className={navItemClass('telemetry')}>
            <Terminal size={16} /> Telemetry
          </div>
        </nav>

        <div className="mb-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider px-4">System</div>
        <nav className="flex flex-col gap-1">
          <div onClick={() => setActiveTab('agent')} className={navItemClass('agent')}>
            <Server size={16} /> Orchestrator
          </div>
        </nav>

        {sysStatus && (
          <div className="mt-auto structural-card p-4 mx-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-xs font-semibold">Engine Online</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">LATENCY: 42ms</div>
            <div className="mt-4 h-8 flex items-end gap-[2px] opacity-70">
               {/* Minimalist technical sparkline */}
               <div className="w-full h-1/3 bg-muted-foreground rounded-t-[1px]"></div>
               <div className="w-full h-2/3 bg-muted-foreground rounded-t-[1px]"></div>
               <div className="w-full h-1/2 bg-muted-foreground rounded-t-[1px]"></div>
               <div className="w-full h-full bg-foreground rounded-t-[1px]"></div>
               <div className="w-full h-3/4 bg-muted-foreground rounded-t-[1px]"></div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 lg:p-12 relative overflow-hidden overflow-y-auto">
        <header className="flex justify-between items-end mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-semibold mb-1 tracking-tight">
              {activeTab === 'dashboard' && "Systemic Overview"}
              {activeTab === 'discoveries' && "Verified Discoveries"}
              {activeTab === 'telemetry' && "Live Telemetry Stream"}
              {activeTab === 'agent' && "Orchestrator Diagnostics"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'dashboard' && "High-level baseline anomalies and convergence."}
              {activeTab === 'discoveries' && "Cross-author convergence and anomaly detection."}
              {activeTab === 'telemetry' && "Raw event stream directly from the integration backend."}
              {activeTab === 'agent' && "System metrics and background polling diagnostic."}
            </p>
          </div>
          <div className="flex items-center gap-3">
             {activeTab === 'dashboard' && (
               <div className="flex bg-white rounded-md p-0.5 border border-border shadow-sm text-xs font-medium">
                 <button className="px-3 py-1 rounded-[4px] text-muted-foreground hover:text-foreground">7D</button>
                 <button className="px-3 py-1 rounded-[4px] bg-muted text-foreground border border-border shadow-sm">30D</button>
                 <button className="px-3 py-1 rounded-[4px] text-muted-foreground hover:text-foreground">90D</button>
               </div>
             )}
            <button onClick={loadAllData} className="p-2 rounded-md border border-border bg-white text-muted-foreground hover:bg-muted transition-colors shadow-sm">
              <RefreshCw size={16} className={loading ? "animate-spin text-foreground" : ""} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          
          {/* TAB: DASHBOARD (Overview) */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="structural-card p-5 flex flex-col justify-between">
                  <div className="text-xs font-mono font-medium text-muted-foreground mb-4 uppercase">Active Anomalies</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold tracking-tight mb-1">{sysStatus?.total_findings || 0}</div>
                      <div className="text-[10px] font-mono font-medium text-success">↗ +2 DETECTED</div>
                    </div>
                  </div>
                </div>
                
                <div className="structural-card p-5 flex flex-col justify-between">
                  <div className="text-xs font-mono font-medium text-muted-foreground mb-4 uppercase">Telemetry Signals</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold tracking-tight mb-1">{sysStatus?.total_events || 0}</div>
                      <div className="text-[10px] font-mono font-medium text-muted-foreground">↗ +15 EVENTS</div>
                    </div>
                  </div>
                </div>
                
                <div className="structural-card p-5 flex flex-col justify-between">
                  <div className="text-xs font-mono font-medium text-muted-foreground mb-4 uppercase">Connected Repos</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold tracking-tight mb-1">1</div>
                      <div className="text-[10px] font-mono font-medium text-muted-foreground">facebook/react</div>
                    </div>
                  </div>
                </div>

                <div className="structural-card p-5 flex flex-col justify-between">
                  <div className="text-xs font-mono font-medium text-muted-foreground mb-4 uppercase">System Health</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold tracking-tight mb-1">72<span className="text-base text-muted-foreground">/100</span></div>
                      <div className="text-[10px] font-mono font-medium text-warning">DRIFT DETECTED</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Split: Top Discoveries & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 structural-card p-0 flex flex-col">
                  <div className="flex justify-between items-center p-5 border-b border-border">
                    <h3 className="text-sm font-semibold">Emerging Patterns (What is emerging?)</h3>
                    <button className="text-xs text-muted-foreground font-medium hover:text-foreground transition-colors">View all</button>
                  </div>
                  
                  <div className="flex flex-col p-2">
                    {loading ? (
                       <div className="animate-pulse space-y-2 p-3">
                         <div className="h-16 bg-muted rounded-md w-full"></div>
                         <div className="h-16 bg-muted rounded-md w-full"></div>
                       </div>
                    ) : findings.slice(0, 3).map((finding, i) => (
                      <div key={finding.id} onClick={() => handleRowClick(finding)} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border group">
                        <div className="shrink-0">{getStatusBadge(finding.status, finding.significance_score)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate mb-1">{finding.claim}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 border border-border rounded bg-white">ID: {finding.id.substring(0, 8)}</span>
                            <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 border border-border rounded bg-white">{(finding.significance_score * 100).toFixed(0)}% CONF</span>
                          </div>
                        </div>
                        <div className="text-right pl-4">
                           <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="structural-card p-0 flex flex-col">
                  <div className="flex justify-between items-center p-5 border-b border-border">
                    <h3 className="text-sm font-semibold">Temporal State (What changed?)</h3>
                  </div>
                  
                  <div className="relative p-6 pt-5">
                    <div className="absolute left-6 top-5 bottom-5 w-px bg-border"></div>
                    <div className="space-y-6 relative">
                      <div className="relative pl-6">
                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-foreground ring-4 ring-white"></div>
                        <div className="text-sm font-medium">New discovery detected</div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">2m ago</div>
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-success ring-4 ring-white"></div>
                        <div className="text-sm font-medium">Investigation completed</div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">18m ago</div>
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-warning ring-4 ring-white"></div>
                        <div className="text-sm font-medium">Convergence threshold met</div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">1h ago</div>
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-border ring-4 ring-white"></div>
                        <div className="text-sm font-medium">Baseline updated</div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">3h ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DISCOVERIES (All) */}
          {activeTab === 'discoveries' && (
            <div className="structural-card overflow-hidden flex-1 flex flex-col border-border rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Discovery ID / Claim</th>
                      <th className="px-5 py-3 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
                      <th className="px-5 py-3 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Detected</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      Array.from({length: 5}).map((_, i) => (
                        <tr key={i}><td colSpan="5" className="p-5"><div className="bg-muted h-8 w-full animate-pulse rounded"></div></td></tr>
                      ))
                    ) : findings.map((finding) => (
                      <tr key={finding.id} onClick={() => handleRowClick(finding)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-foreground max-w-lg truncate mb-1">{finding.claim}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">ID: {finding.id}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-medium">{(finding.significance_score * 100).toFixed(0)}%</span>
                            <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                              <div className="h-full bg-foreground" style={{width: `${finding.significance_score * 100}%`}}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(finding.status, finding.significance_score)}</td>
                        <td className="px-5 py-4 text-sm font-mono text-muted-foreground">{finding.created_at.substring(0, 10)}</td>
                        <td className="px-5 py-4 text-right"><ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity inline" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-10">
                {telemetry.length === 0 && !loading && (
                  <div className="text-center py-20 text-muted-foreground text-sm font-mono">No telemetry data available in current time window.</div>
                )}
                {telemetry.map((evt, i) => (
                  <div key={evt.id} className="structural-card p-4 flex gap-4 hover:border-border-hover transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium px-2 py-0.5 bg-muted border border-border rounded">{evt.event_type}</span>
                          <span className="text-sm font-medium">{evt.entity_name || 'System Entity'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{evt.timestamp}</span>
                      </div>
                      <div className="text-xs text-muted-foreground bg-foreground text-white p-3 rounded-md font-mono mt-2 overflow-x-auto">
                        {evt.content_snippet}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB: AGENT STATUS */}
          {activeTab === 'agent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="structural-card p-6">
                  <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                    <Server className="text-foreground" size={20} />
                    <h3 className="text-sm font-semibold">Orchestrator Node</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase">Status</div>
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-success bg-success-bg px-2 py-1 rounded border border-success/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                        ONLINE
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase">Mode</div>
                      <div className="text-sm font-medium">Autonomous Investigation</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase">Last Sync</div>
                      <div className="text-sm font-mono text-muted-foreground">{new Date().toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="structural-card p-6">
                  <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                    <Database className="text-foreground" size={20} />
                    <h3 className="text-sm font-semibold">Database Metrics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase mb-1">Total Events</div>
                      <div className="text-2xl font-bold font-mono">{sysStatus?.total_events || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase mb-1">Entities Tracked</div>
                      <div className="text-2xl font-bold font-mono">{sysStatus?.total_entities || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase mb-1">Anomalies</div>
                      <div className="text-2xl font-bold font-mono text-foreground">{sysStatus?.total_findings || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase mb-1">Storage Volume</div>
                      <div className="text-2xl font-bold font-mono">{sysStatus?.db_size_mb || 0}<span className="text-xs text-muted-foreground ml-1">MB</span></div>
                    </div>
                  </div>
                </div>
            </div>
          )}

        </div>
      </main>

      {/* Side Pane Overlay */}
      <AnimatePresence>
        {isPaneOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-[2px] z-40" 
            onClick={closePane}
          />
        )}
      </AnimatePresence>
      
      {/* Evidence Side Pane */}
      <AnimatePresence>
        {isPaneOpen && (
          <motion.aside 
            initial={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
            animate={{ x: 0, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)" }}
            exit={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl z-50 bg-background border-l border-border flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-5 border-b border-border bg-white">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-muted-foreground" />
                <h3 className="text-sm font-semibold">Investigation Report</h3>
              </div>
              <button onClick={closePane} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                <X size={16} />
              </button>
            </div>

            {selectedFinding && (
              <div className="flex-1 overflow-y-auto bg-background">
                
                <div className="p-6 md:p-8 bg-white border-b border-border">
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-muted border border-border text-foreground text-[10px] font-mono font-semibold mb-4 uppercase">
                    The Claim (What is emerging?)
                  </div>
                  <div className="text-xl md:text-2xl font-semibold leading-tight tracking-tight mb-6">
                    {selectedFinding.claim}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase mb-1">Confidence</div>
                      <div className="text-lg font-mono font-bold">{(selectedFinding.significance_score * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase mb-1">Status</div>
                      <div className="mt-1">{getStatusBadge(selectedFinding.status, selectedFinding.significance_score)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase mb-1">Detected</div>
                      <div className="text-sm font-mono font-medium text-foreground mt-1.5">{selectedFinding.created_at.substring(0, 10)}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                  {selectedFinding.why_surfaced && (
                    <div className="structural-card p-5">
                      <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                        <Activity size={14}/> Why it surfaced
                      </h4>
                      <p className="text-sm leading-relaxed">{selectedFinding.why_surfaced}</p>
                    </div>
                  )}

                  {selectedFinding.evidence_summary && (
                    <div className="structural-card p-5 bg-white">
                      <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                        <FileCode2 size={14}/> Why should I care?
                      </h4>
                      <p className="text-sm leading-relaxed font-medium">
                        {selectedFinding.evidence_summary}
                      </p>
                    </div>
                  )}

                  {selectedFinding.alternative_explanations && (
                    <div className="structural-card p-5 border-danger/30 bg-danger-bg/50">
                      <h4 className="text-xs font-mono font-semibold text-danger uppercase mb-3 flex items-center gap-2">
                        <ShieldAlert size={14}/> Self-Falsification & Alternatives
                      </h4>
                      <p className="text-sm leading-relaxed text-danger/90">
                        {selectedFinding.alternative_explanations}
                      </p>
                    </div>
                  )}

                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Database size={16} className="text-muted-foreground" />
                        Show me the evidence
                      </h4>
                      <span className="badge badge-neutral font-mono">{evidence.length} sources</span>
                    </div>
                    
                    {evidenceLoading ? (
                      <div className="space-y-3">
                        <div className="h-20 bg-muted rounded-lg animate-pulse"></div>
                        <div className="h-20 bg-muted rounded-lg animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {evidence.map((ev, i) => (
                          <div key={i} className="structural-card p-4 overflow-hidden">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-foreground text-white flex items-center justify-center text-[10px] font-mono font-bold uppercase">
                                  {ev.author.charAt(0)}
                                </div>
                                <span className="text-xs font-medium">{ev.author}</span>
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground">{ev.timestamp.substring(0, 10)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground bg-foreground text-white p-3 rounded font-mono overflow-x-auto">
                              {ev.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
