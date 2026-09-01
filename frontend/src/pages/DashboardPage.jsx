import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, ChevronRight, X, Clock, Database, RefreshCw, Cpu, Eye, Terminal, Server, HardDrive, Zap, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFindings, fetchEvidence, fetchTelemetry, fetchSystemStatus } from '../api';
import { Share2 } from 'lucide-react';

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
    if (score && score > 0.85) return <span className="badge-danger">HIGH</span>;
    if (score && score > 0.5) return <span className="badge-warning">MEDIUM</span>;
    
    switch (status) {
      case 'VERIFIED_DISCOVERY':
        return <span className="badge-success">VERIFIED</span>;
      case 'REJECTED':
        return <span className="badge-danger">REJECTED</span>;
      default:
        return <span className="badge-warning">CANDIDATE</span>;
    }
  };

  const navItemClass = (tabId) => `px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer text-sm font-medium transition-all duration-200 ${
    activeTab === tabId 
      ? 'bg-brand-light text-brand-primary' 
      : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
  }`;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-gray font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col p-6 bg-white border-r border-slate-100 relative z-20">
        <div className="flex items-center mb-10 gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold font-sans">
            U
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">UnknownUnknowns</h1>
          </div>
        </div>
        
        <div className="mb-4 text-xs font-semibold text-text-muted uppercase tracking-wider px-4">Overview</div>
        <nav className="flex flex-col gap-1 mb-8">
          <div onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
            <BarChart2 size={18} /> Dashboard
          </div>
          <div onClick={() => setActiveTab('discoveries')} className={navItemClass('discoveries')}>
            <ShieldAlert size={18} /> Discoveries
          </div>
          <div onClick={() => setActiveTab('telemetry')} className={navItemClass('telemetry')}>
            <Activity size={18} /> Signals
          </div>
        </nav>

        <div className="mb-4 text-xs font-semibold text-text-muted uppercase tracking-wider px-4">Data</div>
        <nav className="flex flex-col gap-1">
          <div onClick={() => setActiveTab('agent')} className={navItemClass('agent')}>
            <Database size={18} /> Node Status
          </div>
        </nav>

        {sysStatus && (
          <div className="mt-auto saas-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-semibold text-text-primary">Connected</span>
            </div>
            <div className="text-xs text-text-secondary">Last sync: Just now</div>
            <div className="mt-4 h-10 flex items-end gap-1 opacity-50">
               {/* Mock tiny sparkline */}
               <div className="w-full h-1/3 bg-brand-primary/20 rounded-t-sm"></div>
               <div className="w-full h-2/3 bg-brand-primary/40 rounded-t-sm"></div>
               <div className="w-full h-1/2 bg-brand-primary/30 rounded-t-sm"></div>
               <div className="w-full h-full bg-brand-primary/60 rounded-t-sm"></div>
               <div className="w-full h-3/4 bg-brand-primary/50 rounded-t-sm"></div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 lg:p-12 relative overflow-hidden overflow-y-auto">
        <header className="flex justify-between items-end mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-display font-semibold text-text-primary mb-1">
              {activeTab === 'dashboard' && "Dashboard"}
              {activeTab === 'discoveries' && "Systemic Discoveries"}
              {activeTab === 'telemetry' && "Live Signals"}
              {activeTab === 'agent' && "Orchestrator Status"}
            </h2>
            <p className="text-text-secondary text-sm">
              {activeTab === 'dashboard' && "Systemic health overview"}
              {activeTab === 'discoveries' && "Cross-author convergence and anomaly detection."}
              {activeTab === 'telemetry' && "Raw event stream directly from the integration backend."}
              {activeTab === 'agent' && "System metrics and background polling diagnostic."}
            </p>
          </div>
          <div className="flex items-center gap-3">
             {activeTab === 'dashboard' && (
               <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm text-sm">
                 <button className="px-4 py-1.5 rounded-md text-text-secondary hover:text-text-primary font-medium">7D</button>
                 <button className="px-4 py-1.5 rounded-md bg-brand-light text-brand-primary font-medium">30D</button>
                 <button className="px-4 py-1.5 rounded-md text-text-secondary hover:text-text-primary font-medium">90D</button>
               </div>
             )}
            <button onClick={loadAllData} className="p-2.5 rounded-lg border border-slate-200 bg-white text-text-secondary hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={18} className={loading ? "animate-spin text-brand-primary" : ""} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          
          {/* TAB: DASHBOARD (Overview) */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-8">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="saas-card p-6 flex flex-col justify-between">
                  <div className="text-sm font-semibold text-text-primary mb-4">Active discoveries</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-display font-bold text-text-primary mb-2">{sysStatus?.total_findings || 0}</div>
                      <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><ArrowRight size={12} className="-rotate-45"/> 2 this week</div>
                    </div>
                    {/* Mock sparkline */}
                    <svg width="60" height="30" className="opacity-70 text-brand-primary stroke-current">
                      <path d="M0 25 L10 20 L20 28 L30 15 L40 18 L50 5 L60 10" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <div className="saas-card p-6 flex flex-col justify-between">
                  <div className="text-sm font-semibold text-text-primary mb-4">New signals</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-display font-bold text-text-primary mb-2">{sysStatus?.total_events || 0}</div>
                      <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><ArrowRight size={12} className="-rotate-45"/> 15 this week</div>
                    </div>
                    {/* Mock sparkline */}
                    <svg width="60" height="30" className="opacity-70 text-brand-secondary stroke-current">
                      <path d="M0 20 L15 15 L25 25 L35 10 L45 20 L60 5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <div className="saas-card p-6 flex flex-col justify-between">
                  <div className="text-sm font-semibold text-text-primary mb-4">Repositories analyzed</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-display font-bold text-text-primary mb-2">1</div>
                      <div className="text-xs text-text-secondary">active connection</div>
                    </div>
                  </div>
                </div>

                <div className="saas-card p-6 flex flex-col justify-between">
                  <div className="text-sm font-semibold text-text-primary mb-4">Health score</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-display font-bold text-text-primary mb-1">72<span className="text-lg text-text-muted">/100</span></div>
                      <div className="text-xs font-semibold text-emerald-600">Good</div>
                    </div>
                    <svg width="60" height="30" className="opacity-70 text-emerald-500 stroke-current">
                      <path d="M0 28 L15 25 L30 20 L45 10 L60 5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Main Split: Top Discoveries & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-2 saas-card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-semibold text-text-primary">Emerging Patterns</h3>
                    <button className="text-sm text-brand-primary font-medium hover:underline">View all</button>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    {loading ? (
                       <div className="animate-pulse space-y-4">
                         <div className="h-20 bg-slate-100 rounded-lg w-full"></div>
                         <div className="h-20 bg-slate-100 rounded-lg w-full"></div>
                       </div>
                    ) : findings.slice(0, 3).map((finding, i) => (
                      <div key={finding.id} onClick={() => handleRowClick(finding)} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                        <div className="mt-1">{getStatusBadge(finding.status, finding.significance_score)}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-text-primary mb-1">{finding.claim}</h4>
                          <p className="text-sm text-text-secondary line-clamp-2 mb-3">{finding.why_surfaced || "Discovered via semantic clustering."}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-slate-100 text-text-secondary text-xs rounded-md">Memory Leaks</span>
                            <span className="px-2 py-1 bg-slate-100 text-text-secondary text-xs rounded-md">Inconsistency</span>
                            <span className="text-xs text-text-muted ml-2">Detected 2 days ago</span>
                          </div>
                        </div>
                        <div className="text-right pl-4 border-l border-slate-100">
                           <div className="text-xs text-text-secondary mb-1">Confidence</div>
                           <div className="text-2xl font-display font-bold text-text-primary mb-2">{(finding.significance_score * 100).toFixed(0)}%</div>
                           <ArrowRight size={16} className="text-text-muted ml-auto"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="saas-card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-semibold text-text-primary">Temporal State (What changed?)</h3>
                    <button className="text-sm text-brand-primary font-medium hover:underline">View all</button>
                  </div>
                  
                  <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-4">
                    <div className="relative pl-6">
                      <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-primary ring-4 ring-white"></div>
                      <div className="text-sm font-semibold text-text-primary">New discovery detected</div>
                      <div className="text-xs text-text-secondary mt-1">2m ago</div>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                      <div className="text-sm font-semibold text-text-primary">Investigation completed</div>
                      <div className="text-xs text-text-secondary mt-1">18m ago</div>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white"></div>
                      <div className="text-sm font-semibold text-text-primary">New signal identified</div>
                      <div className="text-xs text-text-secondary mt-1">1h ago</div>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                      <div className="text-sm font-semibold text-text-primary">Baseline updated</div>
                      <div className="text-xs text-text-secondary mt-1">3h ago</div>
                    </div>
                  </div>

                  <div className="mt-8 bg-brand-light p-5 rounded-xl">
                    <div className="text-sm font-semibold text-text-primary mb-1">Want deeper insights?</div>
                    <div className="text-xs text-text-secondary mb-3">Book a demo to see how it works.</div>
                    <button className="text-sm text-brand-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Book a demo <ArrowRight size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DISCOVERIES (All) */}
          {activeTab === 'discoveries' && (
            <div className="saas-card overflow-hidden flex-1 flex flex-col">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Discovery</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Confidence</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Detected</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 overflow-y-auto">
                  {loading ? (
                    Array.from({length: 5}).map((_, i) => (
                      <tr key={i}><td colSpan="5" className="p-6"><div className="bg-slate-100 h-10 w-full animate-pulse rounded-lg"></div></td></tr>
                    ))
                  ) : findings.map((finding) => (
                    <tr key={finding.id} onClick={() => handleRowClick(finding)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-text-primary max-w-md truncate">{finding.claim}</div>
                        <div className="text-xs text-text-secondary mt-1 max-w-md truncate">{finding.why_surfaced}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-primary" style={{width: `${finding.significance_score * 100}%`}}></div>
                          </div>
                          <span className="text-sm font-semibold text-text-primary">{(finding.significance_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(finding.status, finding.significance_score)}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{finding.created_at.substring(0, 10)}</td>
                      <td className="px-6 py-4 text-right"><ChevronRight size={18} className="text-text-muted inline" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
                {telemetry.length === 0 && !loading && (
                  <div className="text-center py-20 text-text-secondary">No telemetry data available.</div>
                )}
                {telemetry.map((evt, i) => (
                  <div key={evt.id} className="saas-card p-5 flex gap-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Terminal size={18} className="text-brand-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm font-semibold text-text-primary block">{evt.entity_name || 'System Entity'}</span>
                          <span className="text-xs text-text-secondary">@{evt.actor} • {evt.event_type}</span>
                        </div>
                        <span className="text-xs text-text-muted">{evt.timestamp}</span>
                      </div>
                      <div className="text-sm text-text-secondary bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono mt-2">
                        {evt.content_snippet}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB: AGENT STATUS */}
          {activeTab === 'agent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="saas-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
                      <Server className="text-brand-primary" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">Orchestrator Node</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Status</div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        RUNNING
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Mode</div>
                      <div className="text-sm text-text-primary">Continuous Background Investigation</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Last Sync</div>
                      <div className="text-sm text-text-secondary">{new Date().toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="saas-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Database className="text-amber-600" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">Database Metrics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Events</div>
                      <div className="text-3xl font-display font-bold text-text-primary">{sysStatus?.total_events || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Entities</div>
                      <div className="text-3xl font-display font-bold text-text-primary">{sysStatus?.total_entities || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Findings</div>
                      <div className="text-3xl font-display font-bold text-brand-primary">{sysStatus?.total_findings || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Size</div>
                      <div className="text-3xl font-display font-bold text-text-primary">{sysStatus?.db_size_mb || 0}<span className="text-sm text-text-muted ml-1">MB</span></div>
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" 
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
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl z-50 bg-white flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-display font-semibold text-text-primary">Investigation Report</h3>
              <button onClick={closePane} className="p-2 rounded-lg text-text-secondary hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {selectedFinding && (
              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand-primary text-xs font-semibold mb-4">
                    The Claim (What is emerging?)
                  </div>
                  <div className="text-2xl font-display font-semibold text-text-primary leading-tight">
                    {selectedFinding.claim}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Confidence</div>
                    <div className="text-2xl font-display font-bold text-text-primary">{(selectedFinding.significance_score * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Status</div>
                    <div className="mt-1">{getStatusBadge(selectedFinding.status, selectedFinding.significance_score)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Detected</div>
                    <div className="text-sm font-medium text-text-secondary mt-1">{selectedFinding.created_at.substring(0, 10)}</div>
                  </div>
                </div>

                {selectedFinding.why_surfaced && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Why it surfaced</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{selectedFinding.why_surfaced}</p>
                  </div>
                )}

                {selectedFinding.evidence_summary && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Why should I care?</h4>
                    <p className="text-sm text-text-secondary leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-100">
                      {selectedFinding.evidence_summary}
                    </p>
                  </div>
                )}

                {selectedFinding.alternative_explanations && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Self-Falsification & Alternatives</h4>
                    <p className="text-sm text-text-secondary leading-relaxed p-4 bg-red-50 text-red-900 rounded-xl border border-red-100">
                      {selectedFinding.alternative_explanations}
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-base font-semibold text-text-primary">Show me the evidence</h4>
                    <span className="text-xs font-semibold text-brand-primary bg-brand-light px-2 py-1 rounded-md">{evidence.length} sources</span>
                  </div>
                  
                  {evidenceLoading ? (
                    <div className="space-y-4">
                      <div className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>
                      <div className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {evidence.map((ev, i) => (
                        <div key={i} className="saas-card p-5 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
                                {ev.author.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold text-text-primary">{ev.author}</span>
                            </div>
                            <span className="text-xs text-text-muted">{ev.timestamp.substring(0, 10)}</span>
                          </div>
                          <div className="text-sm text-text-secondary leading-relaxed bg-slate-50 p-3 rounded-lg font-mono">
                            {ev.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
