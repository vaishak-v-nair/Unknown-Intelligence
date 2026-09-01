import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFindings, fetchEvidence, fetchTelemetry, fetchSystemStatus } from '../api';

export default function DashboardPage() {
  const [findings, setFindings] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [sysStatus, setSysStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Focus State: null = observing the field; finding object = investigating a specific discovery
  const [focusedDiscovery, setFocusedDiscovery] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
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

  const handleInvestigate = async (finding) => {
    setFocusedDiscovery(finding);
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

  const handleClose = () => {
    setFocusedDiscovery(null);
    setEvidence([]);
  };

  // The Signal Canvas Background
  const BackgroundNoise = () => (
    <>
      <div className="fixed inset-0 grid-bg opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed inset-0 noise-bg z-0"></div>
    </>
  );

  // Top Nav (Minimalistic, data-focused)
  const TopNav = () => (
    <nav className="absolute top-0 left-0 w-full p-6 flex justify-between z-50">
      <div className="flex flex-col">
        <span className="font-mono text-sm tracking-widest text-signal">workspace.intelligence</span>
        <span className="text-[10px] font-mono text-signal-dim uppercase mt-1">Status: {sysStatus ? 'Active' : 'Syncing'} | Nodes: {sysStatus?.total_events || 0}</span>
      </div>
      <div className="flex gap-4">
        <div className="px-3 py-1 hairline-border text-data flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-tritium animate-pulse"></div> Live
        </div>
      </div>
    </nav>
  );

  return (
    <div className="canvas-container relative text-signal h-screen overflow-hidden">
      <BackgroundNoise />
      <TopNav />

      {/* Main Workspace Area */}
      <main className="absolute inset-0 pt-24 pb-6 px-6 flex flex-col md:flex-row gap-6 z-10">
        
        {/* Left Column: The Central Field (70%) */}
        <div className="flex-[3] relative border border-transparent">
          <AnimatePresence mode="wait">
            
            {/* STATE 1: Observational Field (List of emerging patterns) */}
            {!focusedDiscovery && (
              <motion.div 
                key="observational-field"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full flex flex-col justify-center max-w-4xl mx-auto"
              >
                <div className="text-data mb-6 border-b border-noise pb-4">Emerging System Patterns</div>
                <div className="flex flex-col gap-1">
                  {loading ? (
                    <div className="text-data animate-pulse">Scanning topology...</div>
                  ) : findings.length === 0 ? (
                    <div className="font-serif text-3xl text-signal-dim">No anomalies detected in current timeline.</div>
                  ) : (
                    findings.map((finding) => (
                      <div 
                        key={finding.id} 
                        onClick={() => handleInvestigate(finding)}
                        className="group flex flex-col py-6 hairline-border-b cursor-pointer transition-all hover:bg-noise/20 px-4 -mx-4"
                      >
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="font-mono text-xs text-laser tracking-widest">{finding.id}</span>
                          <span className="font-mono text-xs text-signal-dim">{(finding.significance_score * 100).toFixed(0)}% Confidence</span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl leading-tight text-signal group-hover:text-white transition-colors">
                          {finding.claim}
                        </h2>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* STATE 2: Investigation View (Discovery at center, shattering into evidence) */}
            {focusedDiscovery && (
              <motion.div 
                key="investigation-field"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full relative flex flex-col"
              >
                <button 
                  onClick={handleClose}
                  className="absolute -top-12 left-0 text-data hover:text-white flex items-center gap-2 z-50 uppercase tracking-widest"
                >
                  [Esc] Return to Field
                </button>

                {/* The Claim (Pushed back into Z-space via scale and dimming) */}
                <motion.div 
                  initial={{ scale: 1.2, opacity: 0, y: 50 }}
                  animate={{ scale: 0.85, opacity: 0.4, y: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center mt-12 mb-20 relative z-0"
                >
                  <div className="font-mono text-xs text-laser tracking-widest mb-4">VERIFIED CLAIM</div>
                  <h2 className="font-serif text-5xl md:text-6xl leading-[1.1] text-signal max-w-4xl mx-auto">
                    {focusedDiscovery.claim}
                  </h2>
                </motion.div>

                {/* The Evidence Constellation (Orbits forward) */}
                <div className="flex-1 relative z-10 w-full max-w-5xl mx-auto">
                  <div className="text-data border-b border-noise pb-2 mb-8">Constellation / Evidence Graph</div>
                  
                  {evidenceLoading ? (
                    <div className="text-data animate-pulse flex h-64 items-center justify-center">Decrypting evidence nodes...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                      {/* Connecting lines SVG background */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: -1 }}>
                        <line x1="20%" y1="0%" x2="50%" y2="100%" stroke="var(--color-signal)" strokeWidth="0.5" />
                        <line x1="80%" y1="0%" x2="50%" y2="100%" stroke="var(--color-signal)" strokeWidth="0.5" />
                      </svg>

                      {evidence.map((ev, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1), duration: 0.6 }}
                          className="instrument-panel backdrop-blur-md bg-void/80 hover:bg-void"
                        >
                          <div className="flex justify-between mb-4 border-b border-noise pb-2">
                            <span className="font-mono text-xs text-signal-dim uppercase">{ev.author}</span>
                            <span className="font-mono text-xs text-signal-dim">{ev.timestamp.substring(0, 10)}</span>
                          </div>
                          <div className="font-mono text-sm text-signal leading-relaxed whitespace-pre-wrap">
                            {ev.content}
                          </div>
                        </motion.div>
                      ))}

                      {evidence.length === 0 && (
                        <div className="col-span-2 text-center text-signal-dim font-mono text-sm py-12">
                          Evidence graph is fragmented. Awaiting further telemetry.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Falsification / Alternatives Panel */}
                  {focusedDiscovery.alternative_explanations && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mt-12 instrument-panel border-laser/30 bg-laser/5"
                    >
                      <div className="font-mono text-xs text-laser uppercase mb-4 tracking-widest">Self-Falsification Attempt</div>
                      <div className="font-serif text-xl text-signal/80 leading-relaxed">
                        {focusedDiscovery.alternative_explanations}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Telemetry Ticker (Peripheral observation) */}
        <div className="flex-1 max-w-sm h-full flex flex-col border-l border-noise pl-6 relative z-10 hidden lg:flex">
          <div className="font-mono text-xs text-signal-dim uppercase tracking-widest mb-6 border-b border-noise pb-4">
            Raw Telemetry Stream
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-24" style={{ scrollbarWidth: 'none' }}>
            {loading && <div className="text-data animate-pulse">Connecting to stream...</div>}
            
            <AnimatePresence>
              {telemetry.map((evt, i) => (
                <motion.div 
                  key={evt.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-xs font-mono border-l-2 border-noise pl-3 py-1 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div className="flex justify-between text-signal-dim mb-1">
                    <span>{evt.event_type}</span>
                    <span>{evt.timestamp.substring(11, 19)}</span>
                  </div>
                  <div className="text-signal truncate">{evt.entity_name || 'System Context'}</div>
                  <div className="text-signal-dim truncate mt-1">{evt.content_snippet}</div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Fade out bottom of ticker */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-void to-transparent pointer-events-none"></div>
          </div>
        </div>

      </main>
    </div>
  );
}
