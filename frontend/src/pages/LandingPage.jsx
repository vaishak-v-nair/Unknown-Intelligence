import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, GitCommit, GitMerge, FileCode2, Command } from "lucide-react";

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="relative w-full min-h-screen bg-background dot-pattern flex flex-col font-sans text-foreground">
      
      {/* Navigation */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Command size={20} className="text-foreground" />
          <span className="font-semibold tracking-tight text-lg">UnknownUnknowns</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#product" className="hover:text-foreground transition-colors">Platform</a>
          <a href="#solutions" className="hover:text-foreground transition-colors">Engine</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Enterprise</a>
        </div>
        
        <div className="flex items-center gap-3">
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">Log in</a>
          <Link to="/dashboard" className="btn-primary">
            Initialize Engine
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-24 pb-32">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div variants={item} className="mb-6 flex items-center gap-2">
            <span className="badge badge-neutral px-3 py-1 bg-white">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mr-2 animate-pulse"></span>
              Systemic Health Engine v3.0
            </span>
          </motion.div>
          
          <motion.h1 variants={item} className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6">
            Discover what your team <span className="text-muted-foreground">can't see.</span>
          </motion.h1>
          
          <motion.p variants={item} className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl font-medium">
            A proactive data orchestration engine that monitors GitHub repositories. It vectorizes and synthesizes raw telemetry to surface hidden anomalies before they become critical failures.
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard" className="btn-primary text-base px-6 py-3">
              Start analysis <ArrowRight size={16} className="ml-2" />
            </Link>
            <button className="btn-secondary text-base px-6 py-3">
              Read the documentation
            </button>
          </motion.div>
        </motion.div>

        {/* Technical Bento Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Card 1 */}
          <motion.div variants={item} className="bento-card col-span-1 md:col-span-2 p-8 h-80 bg-white relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border mb-4">
                  <Activity size={20} className="text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Temporal Drift Detection</h3>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  We calculate historical baselines for every subsystem. When file modification rates spike beyond normal standard deviations, our engine flags it instantly.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={item} className="bento-card col-span-1 p-8 h-80 bg-foreground text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-white">
              <GitMerge size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 mb-4 text-white">
                  <GitMerge size={20} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Independent Convergence</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Automatically detects when distinct authors mathematically converge on correlated problems without explicit cross-communication.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={item} className="bento-card col-span-1 p-8 h-64 bg-white">
             <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border mb-4">
                <FileCode2 size={20} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Zero Hallucinations</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every generated hypothesis is strictly grounded in verifiable PRs, commits, and issue timestamps. If it can't be cited, it is rejected.
              </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={item} className="bento-card col-span-1 p-8 h-64 bg-white">
             <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border mb-4">
                <Command size={20} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Rigorous Falsification</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our autonomous investigator agent is designed as a skeptic. It deliberately searches for contradictory evidence before verifying any claim.
              </p>
          </motion.div>

          {/* Card 5 */}
          <motion.div variants={item} className="bento-card col-span-1 p-8 h-64 bg-white">
             <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border mb-4">
                <GitCommit size={20} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">High-Density Telemetry</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A highly structured, monospaced-heavy interface designed for deep code inspection and rapid engineering discovery.
              </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-white mt-12 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Command size={16} />
            <span className="font-semibold text-foreground">UnknownUnknowns</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">GitHub</a>
            <a href="#" className="hover:text-foreground">Documentation</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
