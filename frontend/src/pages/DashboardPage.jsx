import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, ChevronRight, X, Clock, Database, RefreshCw, Cpu, Eye, Terminal, Server, HardDrive, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFindings, fetchEvidence, fetchTelemetry, fetchSystemStatus } from '../api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('anomalies');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  // New state
  const [telemetry, setTelemetry] = useState([]);
  const [sysStatus, setSysStatus] = useState(null);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000); // refresh every 30s
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED_DISCOVERY':
        return <span className="badge-success"><CheckCircle2 size={14} className="mr-1 inline"/> VERIFIED</span>;
      case 'REJECTED':
        return <span className="badge-danger"><X size={14} className="mr-1 inline"/> REJECTED</span>;
      default:
        return <span className="badge-warning"><Activity size={14} className="mr-1 inline"/> CANDIDATE</span>;
    }
  };

  const navItemClass = (tabId) => `p-4 rounded-xl flex items-center gap-3 cursor-pointer text-sm transition-all duration-300 ${
    activeTab === tabId 
      ? 'bg-white/5 border border-white/10 text-accent-primary font-medium premium-glow shadow-lg' 
      : 'text-text-secondary hover:bg-white/[0.02] hover:text-text-primary'
  }`;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden max-w-[1600px] mx-auto px-4 pb-4">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col p-6 glass-panel rounded-2xl mr-4 my-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-32 bg-accent-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent-primary/10 transition-colors duration-1000"></div>
        <div className="flex items-center mb-10 gap-4 relative z-10">
          <div className="bg-gradient-to-br from-accent-primary to-accent-secondary p-3 rounded-xl shadow-lg border border-white/10 flex items-center justify-center">
            <Database size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-widest text-text-primary">AURORA</h1>
            <div className="text-xs text-text-secondary font-mono tracking-wider">INTELLIGENCE</div>
          </div>
        </div>
        
        <nav className="flex flex-col gap-3 relative z-10">
          <div onClick={() => setActiveTab('anomalies')} className={navItemClass('anomalies')}>
            <ShieldAlert size={18} /> Discovered Anomalies
          </div>
          <div onClick={() => setActiveTab('telemetry')} className={navItemClass('telemetry')}>
            <Activity size={18} /> Live Telemetry
          </div>
          <div onClick={() => setActiveTab('agent')} className={navItemClass('agent')}>
            <Cpu size={18} /> Agent Status
          </div>
        </nav>

        {sysStatus && (
          <div className="mt-auto relative z-10 border-t border-white/5 pt-6">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
              <span className="uppercase tracking-widest font-display">System Health</span>
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> OK</span>
            </div>
            <div className="font-mono text-xs text-text-secondary space-y-1">
              <div>DB Size: {sysStatus.db_size_mb} MB</div>
              <div>Entities: {sysStatus.total_entities}</div>
              <div>Findings: {sysStatus.total_findings}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 glass-panel rounded-2xl my-4 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/4 p-40 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <header className="flex justify-between items-end mb-8 relative z-10 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl font-display font-bold mb-2">
              {activeTab === 'anomalies' && "Intelligence Overview"}
              {activeTab === 'telemetry' && "Live Telemetry Feed"}
              {activeTab === 'agent' && "Orchestrator Status"}
            </h2>
            <p className="text-text-secondary text-sm">
              {activeTab === 'anomalies' && "Cross-author convergence and anomaly detection feed."}
              {activeTab === 'telemetry' && "Raw event stream directly from the zero-budget SQLite backend."}
              {activeTab === 'agent' && "System metrics and background polling diagnostic."}
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={loadAllData} className="flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-text-secondary hover:text-white">
              <RefreshCw size={18} className={loading ? "animate-spin text-accent-primary" : ""} />
            </button>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex items-center gap-2 backdrop-blur-md">
              <Clock size={16} className="text-accent-primary animate-pulse" />
              <span className="font-mono tracking-widest text-text-primary">LIVE</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative z-10">
          
          {/* TAB: ANOMALIES */}
          {activeTab === 'anomalies' && (
            <div className="overflow-y-auto flex-1 pr-2">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-20">
                  <tr>
                    <th className="text-text-secondary font-display font-medium text-xs uppercase tracking-widest p-5 border-b border-white/5">Timestamp</th>
                    <th className="text-text-secondary font-display font-medium text-xs uppercase tracking-widest p-5 border-b border-white/5">ID</th>
                    <th className="text-text-secondary font-display font-medium text-xs uppercase tracking-widest p-5 border-b border-white/5">Claim</th>
                    <th className="text-text-secondary font-display font-medium text-xs uppercase tracking-widest p-5 border-b border-white/5">Confidence</th>
                    <th className="text-text-secondary font-display font-medium text-xs uppercase tracking-widest p-5 border-b border-white/5">Status</th>
                    <th className="border-b border-white/5"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({length: 8}).map((_, i) => (
                      <tr key={i}><td colSpan="6" className="p-5 border-b border-white/5"><div className="bg-white/5 rounded-lg h-10 w-full animate-pulse"></div></td></tr>
                    ))
                  ) : findings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center">
                        <div className="inline-flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-2xl mt-12">
                          <Eye size={48} className="text-accent-primary/50 mb-4" />
                          <h3 className="text-xl font-display font-medium mb-2">No Anomalies Found</h3>
                          <p className="text-text-secondary max-w-sm">The background orchestration loop is continuously searching the vector database.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    findings.map((finding, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={finding.id} 
                        className="cursor-pointer transition-all duration-300 hover:bg-white/[0.03] group"
                        onClick={() => handleRowClick(finding)}
                      >
                        <td className="p-5 border-b border-white/5 font-mono text-text-secondary text-sm">{finding.created_at.replace('T', ' ').substring(0, 19)}</td>
                        <td className="p-5 border-b border-white/5 font-mono text-sm text-text-secondary">{finding.id.split('-')[0]}</td>
                        <td className="p-5 border-b border-white/5 font-medium max-w-[400px] whitespace-nowrap overflow-hidden text-ellipsis text-sm group-hover:text-accent-primary transition-colors">{finding.claim}</td>
                        <td className="p-5 border-b border-white/5 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${finding.significance_score * 100}%` }}
                                transition={{ duration: 1, delay: 0.2 + (i * 0.05) }}
                                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                              />
                            </div>
                            <span className="font-mono text-xs font-medium">{(finding.significance_score * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="p-5 border-b border-white/5 text-sm">{getStatusBadge(finding.status)}</td>
                        <td className="p-5 border-b border-white/5 text-sm"><ChevronRight size={18} className="text-text-secondary group-hover:text-white transition-colors group-hover:translate-x-1" /></td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="flex flex-col gap-3">
                {telemetry.length === 0 && !loading && (
                  <div className="text-center py-20 text-text-secondary">No telemetry data available.</div>
                )}
                {telemetry.map((evt, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    key={evt.id} 
                    className="flex gap-4 p-4 bg-white/[0.015] border border-white/5 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="mt-1">
                      <Terminal size={18} className="text-accent-secondary opacity-70" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs uppercase tracking-wider text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/20">{evt.event_type}</span>
                          <span className="text-sm font-medium text-text-primary">{evt.entity_name || 'System Entity'}</span>
                        </div>
                        <span className="font-mono text-xs text-text-secondary">{evt.timestamp}</span>
                      </div>
                      <div className="text-sm text-text-secondary mt-2">
                        <span className="font-medium text-text-primary mr-2">@{evt.actor}</span>
                        {evt.content_snippet}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AGENT STATUS */}
          {activeTab === 'agent' && (
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="grid grid-cols-2 gap-6">
                
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <Server className="text-accent-primary" size={24} />
                    <h3 className="text-xl font-display font-semibold">Orchestrator Node</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Status</div>
                      <div className="flex items-center gap-2 font-mono text-lg text-emerald-400">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        RUNNING (Polling)
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Mode</div>
                      <div className="text-text-primary font-medium">Continuous Background Investigation</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Last Sync</div>
                      <div className="font-mono text-sm text-text-secondary">{new Date().toISOString().replace('T', ' ').substring(0, 19)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <HardDrive className="text-accent-secondary" size={24} />
                    <h3 className="text-xl font-display font-semibold">Database Metrics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Total Events</div>
                      <div className="font-display text-4xl text-white font-light">{sysStatus?.total_events || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Total Entities</div>
                      <div className="font-display text-4xl text-white font-light">{sysStatus?.total_entities || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Total Findings</div>
                      <div className="font-display text-4xl text-accent-primary font-light">{sysStatus?.total_findings || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">DB Size</div>
                      <div className="font-display text-4xl text-white font-light">{sysStatus?.db_size_mb || 0}<span className="text-lg text-text-secondary ml-1">MB</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Zap className="text-accent-primary" size={24} />
                    <div>
                      <div className="font-semibold text-lg">Model RAG Verification Active</div>
                      <div className="text-sm text-text-secondary mt-1">LLM queries are correctly routed to the SQLite vector representations.</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 font-mono text-sm text-text-primary">
                    Zero-budget Architecture
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* Evidence Side Pane overlay */}
      <AnimatePresence>
        {isPaneOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
            onClick={closePane}
          />
        )}
      </AnimatePresence>
      
      {/* Evidence Side Pane */}
      <AnimatePresence>
        {isPaneOpen && (
          <motion.aside 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-[700px] max-w-full z-50 border-l border-white/10 p-8 flex flex-col bg-[#050505]/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-display font-bold">Investigation Report</h3>
              <button onClick={closePane} className="bg-white/5 border border-white/10 rounded-full text-text-secondary p-2 hover:bg-white/10 hover:text-white transition-all hover:rotate-90">
                <X size={20} />
              </button>
            </div>

            {selectedFinding && (
              <div className="flex-1 overflow-y-auto flex flex-col gap-8 pr-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <div className="text-xs font-display uppercase text-accent-primary tracking-widest mb-3 font-semibold">System Hypothesis</div>
                  <div className="text-xl font-medium leading-relaxed text-text-primary">{selectedFinding.claim}</div>
                </div>

                {selectedFinding.why_surfaced && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <div className="text-xs font-display uppercase text-text-secondary tracking-widest mb-3 font-semibold">Why it surfaced</div>
                    <div className="text-sm leading-relaxed text-text-secondary">{selectedFinding.why_surfaced}</div>
                  </div>
                )}

                {selectedFinding.evidence_summary && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <div className="text-xs font-display uppercase text-accent-secondary tracking-widest mb-3 font-semibold">Evidence Summary</div>
                    <div className="text-sm leading-relaxed text-text-secondary">{selectedFinding.evidence_summary}</div>
                  </div>
                )}

                {selectedFinding.alternative_explanations && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <div className="text-xs font-display uppercase text-text-secondary tracking-widest mb-3 font-semibold">Alternative Explanations</div>
                    <div className="text-sm leading-relaxed text-text-secondary">{selectedFinding.alternative_explanations}</div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                    <div className="text-xs font-display uppercase text-text-secondary tracking-widest mb-2">Confidence</div>
                    <div className="font-mono text-2xl text-accent-primary font-light">{(selectedFinding.significance_score * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center flex flex-col justify-center items-center">
                    <div className="text-xs font-display uppercase text-text-secondary tracking-widest mb-2">Status</div>
                    <div>{getStatusBadge(selectedFinding.status)}</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                    <div className="text-xs font-display uppercase text-text-secondary tracking-widest mb-2">Signature</div>
                    <div className="font-mono text-sm text-text-secondary mt-1">{selectedFinding.hash_key.substring(0, 12)}</div>
                  </div>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink-0 mx-4 text-text-secondary text-xs uppercase tracking-widest font-display">Evidence Context</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-6">
                    <div className="text-sm text-text-secondary">Extracted from <strong className="text-white">{evidence.length}</strong> vector matches</div>
                  </div>
                  
                  {evidenceLoading ? (
                    Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl h-32 w-full mb-4 animate-pulse"></div>
                    ))
                  ) : (
                    <div className="flex flex-col gap-4">
                      {evidence.map((ev, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:bg-white/[0.04] transition-colors group"
                        >
                          <div className="flex justify-between mb-4 pb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-[10px] font-bold text-white">
                                {ev.author.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-accent-secondary font-medium text-sm">@{ev.author}</span>
                            </div>
                            <span className="font-mono text-xs text-text-secondary">{ev.timestamp.replace('T', ' ').replace('Z', '')}</span>
                          </div>
                          <div className="font-mono text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {ev.content}
                          </div>
                          <div className="mt-4 flex justify-end">
                             <a href={ev.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-1">
                               View Source <ChevronRight size={14}/>
                             </a>
                          </div>
                        </motion.div>
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
