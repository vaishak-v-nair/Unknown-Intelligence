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

  const navItemClass = (tabId) => `p-4 flex items-center gap-3 cursor-pointer text-sm font-mono uppercase tracking-widest transition-all duration-200 border border-transparent ${
    activeTab === tabId 
      ? 'bg-accent-primary text-black font-bold' 
      : 'text-text-secondary hover:border-white/10 hover:text-text-primary'
  }`;

  return (
    <div className="flex h-[calc(100vh-73px)] w-full overflow-hidden mx-auto bg-space-black">
      {/* Sidebar */}
      <aside className="w-80 flex flex-col p-8 brutal-border-r relative overflow-hidden bg-[#020202]">
        <div className="flex items-center mb-12 gap-4 relative z-10">
          <div className="bg-accent-primary p-3 border border-white/20 flex items-center justify-center">
            <Database size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-widest text-text-primary uppercase">Unknown</h1>
            <div className="text-xs text-text-secondary font-mono tracking-widest uppercase">Intelligence</div>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2 relative z-10">
          <div onClick={() => setActiveTab('anomalies')} className={navItemClass('anomalies')}>
            <ShieldAlert size={18} /> [ Anomalies ]
          </div>
          <div onClick={() => setActiveTab('telemetry')} className={navItemClass('telemetry')}>
            <Activity size={18} /> [ Telemetry ]
          </div>
          <div onClick={() => setActiveTab('agent')} className={navItemClass('agent')}>
            <Cpu size={18} /> [ Node_Status ]
          </div>
        </nav>

        {sysStatus && (
          <div className="mt-auto relative z-10 brutal-border-t pt-8">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-4">
              <span className="uppercase tracking-widest font-mono">System Health</span>
              <span className="flex items-center gap-2 text-accent-primary font-mono"><span className="w-2 h-2 bg-accent-primary animate-pulse"></span> OK</span>
            </div>
            <div className="font-mono text-xs text-text-secondary space-y-2 uppercase tracking-wide flex flex-col">
              <div className="flex justify-between"><span>DB_SIZE:</span> <span className="text-white">{sysStatus.db_size_mb} MB</span></div>
              <div className="flex justify-between"><span>ENTITIES:</span> <span className="text-white">{sysStatus.total_entities}</span></div>
              <div className="flex justify-between"><span>FINDINGS:</span> <span className="text-accent-secondary">{sysStatus.total_findings}</span></div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-10 relative overflow-hidden bg-[#050505]">
        
        <header className="flex justify-between items-end mb-10 relative z-10 brutal-border-b pb-6">
          <div>
            <h2 className="text-4xl font-display font-bold mb-3 uppercase tracking-tight">
              {activeTab === 'anomalies' && "Intelligence Overview"}
              {activeTab === 'telemetry' && "Live Telemetry Feed"}
              {activeTab === 'agent' && "Orchestrator Status"}
            </h2>
            <p className="text-text-secondary text-sm font-mono uppercase tracking-wide">
              {activeTab === 'anomalies' && "Cross-author convergence and anomaly detection feed."}
              {activeTab === 'telemetry' && "Raw event stream directly from the MongoDB backend."}
              {activeTab === 'agent' && "System metrics and background polling diagnostic."}
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={loadAllData} className="flex items-center justify-center p-3 border border-white/20 hover:bg-white hover:text-black transition-colors text-white">
              <RefreshCw size={18} className={loading ? "animate-spin text-accent-primary" : ""} />
            </button>
            <div className="border border-white/20 px-4 py-3 text-sm flex items-center gap-3 bg-black">
              <Clock size={16} className="text-accent-primary animate-pulse" />
              <span className="font-mono tracking-widest text-text-primary uppercase font-bold">Live_Feed</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative z-10">
          
          {/* TAB: ANOMALIES */}
          {activeTab === 'anomalies' && (
            <div className="overflow-y-auto flex-1 pr-2">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-[#050505] z-20">
                  <tr>
                    <th className="text-text-secondary font-mono font-bold text-xs uppercase tracking-widest p-4 brutal-border-b">Timestamp</th>
                    <th className="text-text-secondary font-mono font-bold text-xs uppercase tracking-widest p-4 brutal-border-b">ID</th>
                    <th className="text-text-secondary font-mono font-bold text-xs uppercase tracking-widest p-4 brutal-border-b">Claim</th>
                    <th className="text-text-secondary font-mono font-bold text-xs uppercase tracking-widest p-4 brutal-border-b">Confidence</th>
                    <th className="text-text-secondary font-mono font-bold text-xs uppercase tracking-widest p-4 brutal-border-b">Status</th>
                    <th className="brutal-border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({length: 8}).map((_, i) => (
                      <tr key={i}><td colSpan="6" className="p-4 brutal-border-b"><div className="bg-white/5 h-10 w-full animate-pulse"></div></td></tr>
                    ))
                  ) : findings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center">
                        <div className="inline-flex flex-col items-center justify-center p-12 border border-white/10 mt-12 bg-black">
                          <Eye size={48} className="text-white/20 mb-6" />
                          <h3 className="text-2xl font-display font-bold mb-3 uppercase tracking-widest">No Anomalies Found</h3>
                          <p className="text-text-secondary max-w-md font-mono text-sm uppercase">The background orchestration loop is continuously searching the vector database.</p>
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
                        className="cursor-pointer transition-colors duration-200 hover:bg-white hover:text-black group text-white"
                        onClick={() => handleRowClick(finding)}
                      >
                        <td className="p-4 brutal-border-b font-mono text-sm group-hover:text-black text-text-secondary">{finding.created_at.replace('T', ' ').substring(0, 19)}</td>
                        <td className="p-4 brutal-border-b font-mono text-sm">{finding.id.split('-')[0]}</td>
                        <td className="p-4 brutal-border-b font-medium max-w-[400px] whitespace-nowrap overflow-hidden text-ellipsis text-sm">{finding.claim}</td>
                        <td className="p-4 brutal-border-b text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-black border border-white/20 overflow-hidden relative">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${finding.significance_score * 100}%` }}
                                transition={{ duration: 1, delay: 0.2 + (i * 0.05) }}
                                className="h-full bg-accent-primary absolute left-0 top-0"
                              />
                            </div>
                            <span className="font-mono text-xs font-bold">{(finding.significance_score * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="p-4 brutal-border-b text-sm">{getStatusBadge(finding.status)}</td>
                        <td className="p-4 brutal-border-b text-sm"><ChevronRight size={18} className="text-text-secondary group-hover:text-black transition-colors group-hover:translate-x-1" /></td>
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
              <div className="flex flex-col gap-1">
                {telemetry.length === 0 && !loading && (
                  <div className="text-center py-20 text-text-secondary font-mono uppercase">No telemetry data available.</div>
                )}
                {telemetry.map((evt, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    key={evt.id} 
                    className="flex gap-4 p-5 bg-black border border-white/10 hover:border-white/30 transition-colors"
                  >
                    <div className="mt-1">
                      <Terminal size={18} className="text-accent-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black bg-accent-primary px-2 py-1">{evt.event_type}</span>
                          <span className="text-sm font-bold text-text-primary uppercase tracking-wider">{evt.entity_name || 'System Entity'}</span>
                        </div>
                        <span className="font-mono text-xs text-text-secondary">{evt.timestamp}</span>
                      </div>
                      <div className="text-sm text-text-secondary mt-3 font-mono">
                        <span className="font-bold text-white mr-2">@{evt.actor}</span>
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
                
                <div className="bg-black border border-white/10 p-8 hover:border-white/30 transition-colors">
                  <div className="flex items-center gap-4 mb-8 brutal-border-b pb-6">
                    <Server className="text-accent-primary" size={28} />
                    <h3 className="text-2xl font-display font-bold uppercase tracking-wide">Orchestrator_Node</h3>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <div className="text-xs uppercase font-mono tracking-widest text-text-secondary mb-2">Status</div>
                      <div className="flex items-center gap-3 font-mono text-xl text-accent-primary font-bold">
                        <div className="w-3 h-3 bg-accent-primary animate-pulse"></div>
                        RUNNING_POLLING
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-mono tracking-widest text-text-secondary mb-2">Mode</div>
                      <div className="text-white font-mono uppercase">Continuous Background Investigation</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-mono tracking-widest text-text-secondary mb-2">Last Sync</div>
                      <div className="font-mono text-sm text-text-secondary">{new Date().toISOString().replace('T', ' ').substring(0, 19)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-white/10 p-8 hover:border-white/30 transition-colors">
                  <div className="flex items-center gap-4 mb-8 brutal-border-b pb-6">
                    <HardDrive className="text-accent-secondary" size={28} />
                    <h3 className="text-2xl font-display font-bold uppercase tracking-wide">Database_Metrics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-xs uppercase font-mono tracking-widest text-text-secondary mb-3">Total Events</div>
                      <div className="font-display text-5xl text-white font-bold">{sysStatus?.total_events || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-mono tracking-widest text-text-secondary mb-3">Total Entities</div>
                      <div className="font-display text-5xl text-white font-bold">{sysStatus?.total_entities || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-mono tracking-widest text-text-secondary mb-3">Total Findings</div>
                      <div className="font-display text-5xl text-accent-secondary font-bold">{sysStatus?.total_findings || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-mono tracking-widest text-text-secondary mb-3">DB Size</div>
                      <div className="font-display text-5xl text-white font-bold">{sysStatus?.db_size_mb || 0}<span className="text-xl text-text-secondary ml-2 font-mono">MB</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 bg-accent-primary border border-accent-primary p-8 flex flex-col md:flex-row items-start md:items-center justify-between text-black">
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <Zap className="text-black" size={32} />
                    <div>
                      <div className="font-display font-bold text-2xl uppercase tracking-wide">Model RAG Verification Active</div>
                      <div className="text-sm font-mono mt-2 font-medium">LLM queries are correctly routed to the Milvus vector database representations.</div>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-black text-accent-primary font-mono text-sm font-bold tracking-widest uppercase">
                    Hybrid Search Engine
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
            className="fixed inset-0 bg-black/80 z-40" 
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
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 w-[700px] max-w-full z-50 border-l border-white/20 p-10 flex flex-col bg-[#050505] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10 brutal-border-b pb-6">
              <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Investigation_Report</h3>
              <button onClick={closePane} className="border border-white/20 text-white p-3 hover:bg-white hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>

            {selectedFinding && (
              <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-4">
                <div className="border border-white/10 p-6 bg-black">
                  <div className="text-xs font-mono uppercase text-accent-primary tracking-widest mb-4 font-bold">System Hypothesis</div>
                  <div className="text-2xl font-display font-bold leading-tight text-white uppercase">{selectedFinding.claim}</div>
                </div>

                {selectedFinding.why_surfaced && (
                  <div className="border border-white/10 p-6 bg-black">
                    <div className="text-xs font-mono uppercase text-text-secondary tracking-widest mb-4 font-bold">Why it surfaced</div>
                    <div className="text-sm font-mono leading-relaxed text-white">{selectedFinding.why_surfaced}</div>
                  </div>
                )}

                {selectedFinding.evidence_summary && (
                  <div className="border border-white/10 p-6 bg-black">
                    <div className="text-xs font-mono uppercase text-accent-secondary tracking-widest mb-4 font-bold">Evidence Summary</div>
                    <div className="text-sm font-mono leading-relaxed text-white">{selectedFinding.evidence_summary}</div>
                  </div>
                )}

                {selectedFinding.alternative_explanations && (
                  <div className="border border-white/10 p-6 bg-black">
                    <div className="text-xs font-mono uppercase text-text-secondary tracking-widest mb-4 font-bold">Alternative Explanations</div>
                    <div className="text-sm font-mono leading-relaxed text-white">{selectedFinding.alternative_explanations}</div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-white/10 p-6 bg-black text-center">
                    <div className="text-xs font-mono uppercase text-text-secondary tracking-widest mb-3 font-bold">Confidence</div>
                    <div className="font-display font-bold text-3xl text-accent-primary">{(selectedFinding.significance_score * 100).toFixed(1)}%</div>
                  </div>
                  <div className="border border-white/10 p-6 bg-black text-center flex flex-col justify-center items-center">
                    <div className="text-xs font-mono uppercase text-text-secondary tracking-widest mb-3 font-bold">Status</div>
                    <div>{getStatusBadge(selectedFinding.status)}</div>
                  </div>
                  <div className="border border-white/10 p-6 bg-black text-center flex flex-col justify-center items-center">
                    <div className="text-xs font-mono uppercase text-text-secondary tracking-widest mb-3 font-bold">Signature</div>
                    <div className="font-mono text-sm text-white font-bold">{selectedFinding.hash_key.substring(0, 12)}</div>
                  </div>
                </div>

                <div className="relative flex items-center py-6">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-6 text-white text-sm uppercase tracking-widest font-mono font-bold">Evidence_Context</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-6">
                    <div className="text-sm font-mono uppercase tracking-widest text-text-secondary">Extracted from <strong className="text-accent-primary">{evidence.length}</strong> vector matches</div>
                  </div>
                  
                  {evidenceLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                      <div key={i} className="border border-white/10 bg-black h-40 w-full mb-4 animate-pulse"></div>
                    ))
                  ) : (
                    <div className="flex flex-col gap-4">
                      {evidence.map((ev, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="border border-white/10 p-6 bg-black group hover:border-white/30 transition-colors"
                        >
                          <div className="flex justify-between mb-4 pb-4 brutal-border-b">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white flex items-center justify-center text-sm font-bold text-black font-display uppercase">
                                {ev.author.charAt(0)}
                              </div>
                              <span className="text-white font-mono font-bold text-sm tracking-widest uppercase">@{ev.author}</span>
                            </div>
                            <span className="font-mono text-xs text-text-secondary">{ev.timestamp.replace('T', ' ').replace('Z', '')}</span>
                          </div>
                          <div className="font-mono text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {ev.content}
                          </div>
                          <div className="mt-6 flex justify-end">
                             <a href={ev.url} target="_blank" rel="noreferrer" className="text-xs px-4 py-2 bg-white text-black font-mono font-bold uppercase tracking-widest hover:bg-accent-primary transition-colors flex items-center gap-2">
                               [Source] <ChevronRight size={14}/>
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
