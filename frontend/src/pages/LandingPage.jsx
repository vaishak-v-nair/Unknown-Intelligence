import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Typography Opacities for storytelling
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const noiseOpacity = useTransform(scrollYProgress, [0.15, 0.3, 0.45], [0, 1, 0]);
  const relationshipsOpacity = useTransform(scrollYProgress, [0.45, 0.6, 0.75], [0, 1, 0]);
  const discoveryOpacity = useTransform(scrollYProgress, [0.75, 0.85, 1], [0, 1, 1]);

  // Topology SVG Warping (simulated via scale and rotation for performance)
  const topoScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const topoRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const topoOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [0.1, 0.1, 0.02]);
  
  // The 'Ultramarine' Snap
  const snapOpacity = useTransform(scrollYProgress, [0.8, 0.85], [0, 1]);

  return (
    <div ref={containerRef} className="canvas-container h-[400vh] relative">
      <div className="fixed inset-0 drafting-paper-bg opacity-50 z-0 pointer-events-none"></div>

      {/* Top Nav */}
      <nav className="fixed top-0 left-0 w-full p-8 flex items-center justify-between z-50 border-b border-graphite-faint bg-bone/80 backdrop-blur-sm">
        <div className="font-mono text-xs tracking-widest uppercase text-graphite font-bold">
          Unknown Intelligence
        </div>
        <div className="flex gap-12 text-data-label items-center">
          <a href="#" className="hover:text-graphite transition-colors">Thesis</a>
          <a href="#" className="hover:text-graphite transition-colors">Architecture</a>
          <Link to="/dashboard" className="text-ultramarine font-bold hover:text-graphite transition-colors">Access Workspace</Link>
        </div>
      </nav>

      {/* Fluid Topographical Background */}
      <motion.div 
        style={{ scale: topoScale, rotate: topoRotate, opacity: topoOpacity }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <svg width="200%" height="200%" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M10,50 Q25,20 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="0.1" />
           <path d="M10,60 Q25,30 50,60 T90,60" fill="none" stroke="currentColor" strokeWidth="0.1" />
           <path d="M10,40 Q25,10 50,40 T90,40" fill="none" stroke="currentColor" strokeWidth="0.1" />
           <path d="M20,50 Q40,80 60,50 T90,50" fill="none" stroke="currentColor" strokeWidth="0.1" />
           <path d="M0,30 Q30,60 70,30 T100,30" fill="none" stroke="currentColor" strokeWidth="0.1" />
        </svg>
      </motion.div>

      {/* Foreground Interactive Content */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-20 pointer-events-none">
        
        {/* STAGE 0: HERO */}
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <div className="text-data-label mb-12 border border-graphite px-4 py-2">Forensic Observation Active</div>
          <h1 className="text-editorial text-graphite max-w-5xl mx-auto mb-10">
            Find what your system is becoming <br/>
            <span className="italic text-graphite-soft">before it becomes obvious.</span>
          </h1>
          <div className="w-px h-24 bg-graphite-faint mt-8"></div>
        </motion.div>

        {/* STAGE 1: NOISE */}
        <motion.div 
          style={{ opacity: noiseOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <div className="font-serif text-8xl text-graphite-faint tracking-tighter mb-8 italic">Noise.</div>
          <p className="text-data-value max-w-lg mx-auto text-graphite-soft leading-relaxed">
            14,203 disparate events. The raw, unstructured topology of your engineering effort before synthesis.
          </p>
          <div className="absolute inset-0 flex flex-wrap justify-center items-center opacity-10 pointer-events-none">
             {Array.from({length: 60}).map((_, i) => (
                <div key={i} className="font-mono text-[8px] absolute" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>
                  {Math.random().toString(36).substring(7)}
                </div>
             ))}
          </div>
        </motion.div>

        {/* STAGE 2: RELATIONSHIPS */}
        <motion.div 
          style={{ opacity: relationshipsOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center bg-bone/50 backdrop-blur-sm"
        >
          <div className="grid-line-all p-12 bg-bone relative">
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-graphite"></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-graphite"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-graphite"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-graphite"></div>
             <div className="font-serif text-6xl text-graphite tracking-tight mb-6">Emergence.</div>
             <p className="text-editorial-sub max-w-xl mx-auto">
               Temporal drift detected. Isolated authors are mathematically converging on the same unseen problem.
             </p>
          </div>
        </motion.div>

        {/* STAGE 3: DISCOVERY (The Blueprint Snap) */}
        <motion.div 
          style={{ opacity: discoveryOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-bone pointer-events-auto"
        >
          {/* Background Structural Grid snaps into place */}
          <motion.div style={{ opacity: snapOpacity }} className="absolute inset-0 z-0">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute top-1/2 left-0 w-full h-px bg-ultramarine opacity-20"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-ultramarine opacity-20"></div>
          </motion.div>
          
          <div className="z-10 text-center flex flex-col items-center">
            <div className="text-data-label text-ultramarine mb-8 border border-ultramarine px-4 py-2 bg-ultramarine/5">
              Structural Reality Revealed
            </div>
            <h2 className="text-editorial text-graphite mb-16">See the invisible.</h2>
            <div className="flex gap-6">
              <Link to="/dashboard" className="forensic-button-primary">
                Open Forensic Workspace
              </Link>
              <button className="forensic-button">
                Read the Architecture
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
