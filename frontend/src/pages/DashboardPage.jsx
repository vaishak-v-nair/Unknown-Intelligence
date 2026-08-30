import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, ChevronRight, X, Clock, Database } from 'lucide-react';
import { fetchFindings, fetchEvidence } from '../api';

export default function DashboardPage() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const data = await fetchFindings();
      setFindings(data);
    } catch (error) {
      console.error("Failed to load findings", error);
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
    }, 300); // Wait for transition
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED_DISCOVERY':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium badge-success"><CheckCircle2 size={12} className="mr-1"/> VERIFIED</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium badge-danger"><X size={12} className="mr-1"/> REJECTED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium badge-warning"><Activity size={12} className="mr-1"/> CANDIDATE</span>;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-indigo-500/15 flex flex-col p-6 glass-panel rounded-none border-y-0 border-l-0">
        <div className="flex items-center mb-10 gap-3">
          <div className="bg-accent-primary p-2 rounded-lg">
            <Database size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-wider">AURORA</h1>
            <div className="text-xs text-text-secondary">INTELLIGENCE</div>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-accent-primary flex items-center gap-3 cursor-pointer font-medium text-sm">
            <ShieldAlert size={18} /> Discovered Anomalies
          </div>
          <div className="p-3 text-text-secondary flex items-center gap-3 cursor-pointer text-sm transition-colors hover:text-text-primary">
            <Activity size={18} /> Live Telemetry
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Intelligence Overview</h2>
            <p className="text-text-secondary text-sm mt-1">Cross-author convergence and anomaly detection feed.</p>
          </div>
          <div className="glass-panel px-4 py-2 text-sm flex items-center gap-2">
            <Clock size={16} className="text-accent-primary" />
            <span className="font-mono">LIVE</span>
          </div>
        </header>

        <div className="glass-panel flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-space-black z-10">
                <tr>
                  <th className="text-text-secondary font-medium text-xs uppercase tracking-wider p-4 border-b border-white/5">Timestamp</th>
                  <th className="text-text-secondary font-medium text-xs uppercase tracking-wider p-4 border-b border-white/5">ID</th>
                  <th className="text-text-secondary font-medium text-xs uppercase tracking-wider p-4 border-b border-white/5">Claim</th>
                  <th className="text-text-secondary font-medium text-xs uppercase tracking-wider p-4 border-b border-white/5">Confidence</th>
                  <th className="text-text-secondary font-medium text-xs uppercase tracking-wider p-4 border-b border-white/5">Status</th>
                  <th className="border-b border-white/5"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length: 10}).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="6" className="p-4 border-b border-white/5">
                        <div className="bg-white/5 rounded h-6 w-full animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : findings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-text-secondary">
                      No findings yet. The background orchestration loop is searching for anomalies.
                    </td>
                  </tr>
                ) : (
                  findings.map(finding => (
                    <tr key={finding.id} className="cursor-pointer transition-all duration-200 hover:-translate-y-[1px] hover:bg-indigo-500/5" onClick={() => handleRowClick(finding)}>
                      <td className="p-4 border-b border-white/5 font-mono text-text-secondary text-sm">{finding.created_at.replace('T', ' ').substring(0, 19)}</td>
                      <td className="p-4 border-b border-white/5 font-mono text-sm">{finding.id.split('-')[0]}</td>
                      <td className="p-4 border-b border-white/5 font-medium max-w-[400px] whitespace-nowrap overflow-hidden text-ellipsis text-sm">{finding.claim}</td>
                      <td className="p-4 border-b border-white/5 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-primary" style={{width: `${finding.significance_score * 100}%`}}></div>
                          </div>
                          <span className="font-mono text-xs">{(finding.significance_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-4 border-b border-white/5 text-sm">{getStatusBadge(finding.status)}</td>
                      <td className="p-4 border-b border-white/5 text-sm"><ChevronRight size={16} className="text-text-secondary" /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Evidence Side Pane overlay */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isPaneOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closePane}></div>
      
      {/* Evidence Side Pane */}
      <aside className={`fixed right-0 top-0 bottom-0 w-[600px] max-w-full z-50 transition-transform duration-300 border-l border-indigo-500/15 p-8 flex flex-col glass-panel rounded-none border-y-0 border-r-0 ${isPaneOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold">Investigation Report</h3>
          <button onClick={closePane} className="bg-transparent border-none text-text-secondary cursor-pointer p-1 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {selectedFinding && (
          <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2">
            
            {/* Finding Details */}
            <div>
              <div className="text-xs uppercase text-text-secondary tracking-wider mb-2">System Hypothesis</div>
              <div className="text-lg font-medium leading-relaxed">{selectedFinding.claim}</div>
            </div>

            <div className="flex gap-6">
              <div>
                <div className="text-xs uppercase text-text-secondary tracking-wider mb-1">Confidence</div>
                <div className="font-mono text-xl text-accent-primary">{(selectedFinding.significance_score * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs uppercase text-text-secondary tracking-wider mb-1">Status</div>
                <div>{getStatusBadge(selectedFinding.status)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-text-secondary tracking-wider mb-1">Hash Signature</div>
                <div className="font-mono text-sm text-text-secondary mt-1">{selectedFinding.hash_key.substring(0, 12)}</div>
              </div>
            </div>

            <hr className="border-0 border-b border-indigo-500/15" />

            {/* Evidence RAG Viewer */}
            <div>
              <div className="text-xs uppercase text-text-secondary tracking-wider mb-4">Raw Evidence Provenance ({evidence.length})</div>
              
              {evidenceLoading ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-lg h-24 w-full mb-3 animate-pulse"></div>
                ))
              ) : (
                <div className="flex flex-col gap-3">
                  {evidence.map((ev, i) => (
                    <div key={i} className="bg-black/20 border border-white/5 rounded-lg p-4">
                      <div className="flex justify-between mb-3 text-xs">
                        <span className="text-accent-secondary font-medium">@{ev.author}</span>
                        <span className="font-mono text-text-secondary">{ev.timestamp.replace('T', ' ').replace('Z', '')}</span>
                      </div>
                      <div className="font-mono text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {ev.content}
                      </div>
                      <div className="mt-3 flex justify-end">
                         <a href={ev.url} target="_blank" rel="noreferrer" className="text-accent-primary text-xs no-underline flex items-center gap-1 hover:text-indigo-400 transition-colors">
                           View Source <ChevronRight size={12}/>
                         </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </aside>
    </div>
  );
}
