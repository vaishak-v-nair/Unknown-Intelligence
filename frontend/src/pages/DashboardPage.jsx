import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchFindings, fetchEvidence, fetchTelemetry } from '../api';

export default function DashboardPage() {
  const [findings, setFindings] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [focusedDiscovery, setFocusedDiscovery] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  // Pan and Zoom states for the Forensic Table
  const constraintsRef = useRef(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [fData, tData] = await Promise.all([
        fetchFindings(),
        fetchTelemetry(),
      ]);
      setFindings(fData);
      setTelemetry(tData);
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

  // Background topology SVG for the Forensic Table
  const ForensicGrid = () => (
    <svg className="absolute inset-0 w-[200vw] h-[200vw] -left-[50vw] -top-[50vw] pointer-events-none opacity-5" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="forensicGrid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#111111" strokeWidth="1"/>
          <circle cx="0" cy="0" r="1.5" fill="#111111" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#forensicGrid)" />
    </svg>
  );

  return (
    <div className="canvas-container relative text-graphite h-screen w-screen overflow-hidden cursor-grab active:cursor-grabbing">
      <div className="fixed inset-0 drafting-paper-bg z-0 pointer-events-none"></div>

      {/* Top Bar - Minimalist Data Header */}
      <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <div className="grid-line-all bg-bone px-4 py-2 pointer-events-auto">
          <Link to="/" className="text-data-label font-bold hover:text-ultramarine transition-colors">Unknown Intelligence</Link>
          <div className="text-[10px] font-mono text-graphite-soft mt-1 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-ultramarine rounded-full animate-pulse"></div>
             Workspace Online
          </div>
        </div>
        
        <div className="grid-line-all bg-bone px-4 py-2 text-right pointer-events-auto">
          <div className="text-data-label">Anomalies Detected</div>
          <div className="text-data-value">{findings.length}</div>
        </div>
      </header>

      {/* INFINITE PANNING CANVAS (The Forensic Table) */}
      <div className="absolute inset-0 z-10" ref={constraintsRef}>
        <motion.div 
          drag 
          dragConstraints={constraintsRef}
          className="w-full h-full flex items-center justify-center relative"
        >
          <ForensicGrid />

          <AnimatePresence mode="wait">
            {/* VIEW 1: The Board (List of claims pinned to board) */}
            {!focusedDiscovery && (
              <motion.div 
                key="board"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute flex flex-wrap gap-12 p-20 justify-center items-center max-w-7xl"
              >
                {loading ? (
                  <div className="text-data-label bg-bone p-4 grid-line-all">Scanning system topology...</div>
                ) : findings.map((finding, idx) => (
                  <div 
                    key={finding.id} 
                    onClick={() => handleInvestigate(finding)}
                    className="grid-line-all bg-bone p-10 max-w-xl cursor-pointer hover:border-ultramarine transition-colors relative group"
                    style={{
                       // Slight scatter effect to feel like paper on a desk
                       transform: `rotate(${idx % 2 === 0 ? '-1deg' : '1.5deg'}) translateY(${idx * 10}px)`
                    }}
                  >
                    <div className="absolute -left-2 -top-2 w-4 h-4 bg-bone border border-graphite-faint group-hover:bg-ultramarine transition-colors"></div>
                    <div className="flex justify-between items-baseline mb-6 border-b border-graphite-faint pb-4">
                      <span className="text-data-label text-graphite-soft tracking-widest">{finding.id}</span>
                      <span className="text-data-label text-ultramarine">{(finding.significance_score * 100).toFixed(1)}% Confidence</span>
                    </div>
                    <h2 className="text-editorial-sub text-graphite mb-4 group-hover:text-ultramarine transition-colors">
                      {finding.claim}
                    </h2>
                    <div className="text-data-label text-graphite-soft mt-8 flex items-center gap-2">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                       Click to view evidence graph
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* VIEW 2: The Constellation (Evidence Graph) */}
            {focusedDiscovery && (
              <motion.div 
                key="evidence"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* SVG Connections (The Topographical Snap) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                  {evidence.map((_, i) => {
                     // Calculate radial positions for evidence nodes to draw rigid geometric lines
                     const angle = (i / evidence.length) * Math.PI * 2;
                     const radius = window.innerWidth > 768 ? 350 : 200;
                     const x2 = `calc(50% + ${Math.cos(angle) * radius}px)`;
                     const y2 = `calc(50% + ${Math.sin(angle) * radius}px)`;
                     
                     return (
                        <motion.line 
                          key={`line-${i}`}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                          x1="50%" y1="50%" x2={x2} y2={y2} 
                          stroke="var(--color-ultramarine)" strokeWidth="1" strokeDasharray="4 4"
                        />
                     )
                  })}
                </svg>

                {/* Central Claim */}
                <div className="grid-line-all bg-bone p-12 max-w-2xl relative z-10 text-center shadow-2xl shadow-bone/50">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ultramarine text-bone px-4 py-1 text-[10px] font-mono uppercase tracking-widest">
                     Verified Discovery
                  </div>
                  <h2 className="text-editorial text-graphite leading-tight mb-8">
                    {focusedDiscovery.claim}
                  </h2>
                  <div className="flex justify-center gap-8 border-t border-graphite-faint pt-6">
                    <div>
                      <div className="text-data-label">Status</div>
                      <div className="text-data-value">{focusedDiscovery.status}</div>
                    </div>
                    <div>
                      <div className="text-data-label">Detection</div>
                      <div className="text-data-value">{focusedDiscovery.created_at.substring(0, 10)}</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="mt-8 font-mono text-xs text-graphite-soft hover:text-ultramarine transition-colors uppercase tracking-widest border-b border-transparent hover:border-ultramarine"
                  >
                    ← Return to Desk
                  </button>
                </div>

                {/* Orbiting Evidence Nodes */}
                {evidence.map((ev, i) => {
                   const angle = (i / evidence.length) * Math.PI * 2;
                   const radius = window.innerWidth > 768 ? 350 : 200;
                   const x = Math.cos(angle) * radius;
                   const y = Math.sin(angle) * radius;

                   return (
                     <motion.div 
                       key={`ev-${i}`}
                       initial={{ opacity: 0, x: 0, y: 0 }}
                       animate={{ opacity: 1, x, y }}
                       transition={{ delay: 0.2 + (i * 0.1), duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                       className="evidence-node max-w-xs z-10 flex flex-col"
                       style={{ position: 'absolute' }}
                     >
                       <div className="flex justify-between items-center mb-3 border-b border-graphite-faint pb-2">
                         <span className="text-[10px] font-mono uppercase font-bold">{ev.author}</span>
                         <span className="text-[10px] font-mono text-graphite-soft">{ev.timestamp.substring(0, 10)}</span>
                       </div>
                       <div className="text-xs font-mono text-graphite leading-relaxed whitespace-pre-wrap">
                         {ev.content}
                       </div>
                     </motion.div>
                   )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Telemetry Ticker (Fixed) */}
      <footer className="fixed bottom-0 left-0 w-full bg-bone grid-line-x border-t z-50 pointer-events-none flex h-10 overflow-hidden">
         <div className="bg-graphite text-bone text-data-label px-6 flex items-center pointer-events-auto shrink-0 whitespace-nowrap z-10 shadow-[10px_0_10px_rgba(247,247,245,1)]">
           LIVE TELEMETRY
         </div>
         <div className="flex items-center gap-12 animate-[marquee_30s_linear_infinite] px-12 opacity-60">
            {telemetry.map(t => (
              <div key={t.id} className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-[10px] font-mono bg-graphite-faint px-1 text-graphite">{t.event_type}</span>
                <span className="text-xs font-mono">{t.entity_name}</span>
                <span className="text-[10px] font-mono text-graphite-soft truncate max-w-[200px]">{t.content_snippet}</span>
              </div>
            ))}
            {telemetry.length === 0 && <span className="text-xs font-mono">Awaiting telemetry streams...</span>}
         </div>
      </footer>
      
      {/* CSS for marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}
