import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Hero Decryption Effect (simulated via opacity/blur)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.1], [0, -100]);

  // Section 1: Noise
  const noiseOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3], [0, 1, 0]);
  const noiseScale = useTransform(scrollYProgress, [0.1, 0.3], [0.8, 1.2]);

  // Section 2: Signals
  const signalsOpacity = useTransform(scrollYProgress, [0.3, 0.4, 0.5], [0, 1, 0]);
  
  // Section 3: Emergence
  const emergenceOpacity = useTransform(scrollYProgress, [0.5, 0.6, 0.7], [0, 1, 0]);
  
  // Section 4: Discovery (Final CTA)
  const discoveryOpacity = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);

  return (
    <div ref={containerRef} className="canvas-container h-[500vh] relative">
      <div className="fixed inset-0 grid-bg opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed inset-0 noise-bg z-10"></div>

      {/* Static Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 flex items-center justify-between z-50 mix-blend-difference">
        <div className="font-mono text-sm tracking-widest uppercase text-signal">
          Unknown Intelligence <span className="text-signal-dim ml-2">[v3.0]</span>
        </div>
        <div className="flex gap-8 text-data">
          <a href="#" className="hover:text-signal transition-colors">Manifesto</a>
          <a href="#" className="hover:text-signal transition-colors">Telemetry</a>
          <Link to="/dashboard" className="text-tritium hover:text-white transition-colors">Initialize</Link>
        </div>
      </nav>

      {/* Canvas Elements (The Sticky Viewport) */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-20 pointer-events-none">
        
        {/* HERO: The Unknown */}
        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <div className="text-data mb-8">System Status: Observational Mode</div>
          <h1 className="text-claim text-white max-w-4xl mx-auto mb-12">
            Find what your system is becoming <br/>
            <span className="italic text-signal-dim">before it becomes obvious.</span>
          </h1>
          <div className="text-data animate-pulse mt-12">Scroll to observe</div>
        </motion.div>

        {/* STAGE 1: NOISE */}
        <motion.div 
          style={{ opacity: noiseOpacity, scale: noiseScale }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="font-mono text-9xl text-noise-light tracking-tighter mb-4">NOISE</div>
            <p className="text-data max-w-md mx-auto text-signal-dim">
              14,203 events. Isolated commits. Unrelated discussions. The raw topology of your engineering effort before synthesis.
            </p>
          </div>
          {/* Simulated noise particles via CSS */}
          <div className="absolute inset-0 flex flex-wrap gap-4 opacity-20 justify-center items-center content-center pointer-events-none">
             {Array.from({length: 40}).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-signal rounded-none" style={{ marginLeft: Math.random() * 100, marginTop: Math.random() * 100 }}></div>
             ))}
          </div>
        </motion.div>

        {/* STAGE 2: SIGNALS */}
        <motion.div 
          style={{ opacity: signalsOpacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center z-10 relative">
            <div className="font-mono text-9xl text-signal-dim tracking-tighter mb-4 blur-[1px]">SIGNALS</div>
            <p className="text-data max-w-md mx-auto text-signal">
              Temporal drift detected. Isolated authors are mathematically converging on the same unseen problem.
            </p>
          </div>
          {/* Simulated signals (lines connecting) */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
             <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="white" strokeWidth="0.5" />
             <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="white" strokeWidth="0.5" />
             <line x1="30%" y1="80%" x2="50%" y2="50%" stroke="white" strokeWidth="0.5" />
          </svg>
        </motion.div>

        {/* STAGE 3: EMERGENCE */}
        <motion.div 
          style={{ opacity: emergenceOpacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center z-10 bg-void/80 p-12 hairline-border backdrop-blur-sm">
            <div className="font-mono text-7xl text-signal tracking-tighter mb-6">EMERGENCE</div>
            <div className="h-px w-full bg-noise mb-6"></div>
            <p className="font-serif text-3xl max-w-lg mx-auto text-signal leading-tight">
              An architectural fracture is forming between the state manager and the routing layer.
            </p>
            <div className="text-data mt-6 text-laser animate-pulse">EVIDENCE FOCUSED. FALSIFICATION FAILED.</div>
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-100">
             <polygon points="50%,20% 80%,50% 50%,80% 20%,50%" fill="none" stroke="#E0E0E0" strokeWidth="1" />
             <polygon points="50%,30% 70%,50% 50%,70% 30%,50%" fill="none" stroke="#FF003C" strokeWidth="1" />
          </svg>
        </motion.div>

        {/* STAGE 4: DISCOVERY (CTA) */}
        <motion.div 
          style={{ opacity: discoveryOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
        >
          <h2 className="text-claim text-white mb-12">See the invisible.</h2>
          <div className="flex gap-4">
            <Link to="/dashboard" className="instrument-button-primary">
              Initialize Workspace
            </Link>
            <button className="instrument-button">
              View Sample Telemetry
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
