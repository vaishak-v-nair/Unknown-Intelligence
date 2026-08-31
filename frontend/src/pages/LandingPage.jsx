import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Database, Cpu, Eye, ArrowRight, Server, Shield, Network } from "lucide-react";

export default function LandingPage() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="relative w-full min-h-screen bg-space-black">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex flex-col justify-center px-8 md:px-16 pt-20 brutal-border-b">
        <motion.div 
          className="z-10 w-full max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center px-4 py-2 mb-8 brutal-border">
            <span className="w-2 h-2 bg-accent-secondary mr-3 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-text-primary">System v2.0 // Active</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="font-display text-7xl md:text-[10rem] font-bold tracking-tighter leading-[0.8] mb-8 text-text-primary uppercase">
            Reveal <br/>
            <span className="text-accent-primary">The Unseen.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12 font-mono uppercase tracking-wide leading-relaxed">
            Proactive data intelligence powered by <strong className="text-white">Cross-Author Convergence</strong> and <strong className="text-white">Vector DBs</strong>. We find the anomalies you didn't know to look for.
          </motion.p>
          
          <motion.div variants={fadeUp}>
            <Link to="/dashboard" className="neo-button text-lg">
              [ Init_Dashboard ]
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="relative w-full z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 brutal-border-b"
        >
          <motion.div variants={fadeUp} className="p-12 hover:bg-white hover:text-black transition-colors duration-200 group">
            <div className="mb-8">
              <Database size={32} className="text-accent-secondary group-hover:text-black" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4 uppercase">Pure RAG<br/>Grounding</h3>
            <p className="font-mono text-sm uppercase tracking-wide leading-relaxed opacity-70 group-hover:opacity-100">Zero AI hallucinations. Purely evidence-based intelligence derived strictly from your local vectors.</p>
          </motion.div>
          
          <motion.div variants={fadeUp} className="p-12 hover:bg-white hover:text-black transition-colors duration-200 group">
            <div className="mb-8">
              <Cpu size={32} className="text-accent-primary group-hover:text-black" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4 uppercase">Autonomous<br/>Agents</h3>
            <p className="font-mono text-sm uppercase tracking-wide leading-relaxed opacity-70 group-hover:opacity-100">The system never sleeps. Background loops continuously investigate, synthesize, and categorize datasets.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="p-12 hover:bg-white hover:text-black transition-colors duration-200 group">
            <div className="mb-8">
              <Eye size={32} className="text-text-primary group-hover:text-black" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4 uppercase">Uncover<br/>Blindspots</h3>
            <p className="font-mono text-sm uppercase tracking-wide leading-relaxed opacity-70 group-hover:opacity-100">By tracking distinct author convergence, we identify critical 'Unknowns' before they become failures.</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Pipeline Section */}
      <div className="relative w-full z-10 bg-black brutal-border-b py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row gap-16"
          >
            <div className="flex-1">
              <motion.h2 variants={fadeUp} className="font-display text-5xl md:text-7xl font-bold uppercase mb-8">
                The <span className="text-accent-secondary">Pipeline.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="font-mono text-sm text-text-secondary uppercase tracking-widest leading-relaxed max-w-md">
                Unknown Intelligence operates via a strict three-phase proactive ingestion loop. Raw data enters, noise is stripped, and highly structured anomalies are discovered entirely in the background.
              </motion.p>
            </div>
            
            <div className="flex-1 flex flex-col gap-8 font-mono">
              <motion.div variants={fadeUp} className="brutal-border p-8 hover:border-accent-primary transition-colors">
                <div className="text-accent-primary font-bold text-2xl mb-2">01. INGESTION</div>
                <div className="text-text-secondary text-sm uppercase">Scraping massive parallel streams of data from raw API events, normalizing structured payloads into a scalable NoSQL backend.</div>
              </motion.div>
              <motion.div variants={fadeUp} className="brutal-border p-8 hover:border-accent-secondary transition-colors">
                <div className="text-accent-secondary font-bold text-2xl mb-2">02. VECTORIZATION</div>
                <div className="text-text-secondary text-sm uppercase">Translating textual observations into high-dimensional vector embeddings, allowing for rapid semantic similarity search across disconnected authors.</div>
              </motion.div>
              <motion.div variants={fadeUp} className="brutal-border p-8 hover:border-white transition-colors">
                <div className="text-white font-bold text-2xl mb-2">03. SYNTHESIS</div>
                <div className="text-text-secondary text-sm uppercase">LLM-powered background agents cross-reference vector clusters, forming hypotheses, demanding evidence, and rejecting hallucinations before hitting your dashboard.</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dark Metrics */}
      <div className="relative w-full z-10 py-24 bg-[#020202]">
        <div className="max-w-7xl mx-auto px-8 md:px-16 text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl font-bold uppercase mb-16"
          >
            Built for <span className="text-accent-primary">Scale.</span>
          </motion.h2>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeUp} className="flex flex-col items-center">
              <Server size={48} className="text-accent-secondary mb-4" />
              <div className="font-display text-5xl font-bold mb-2 text-white">0</div>
              <div className="font-mono text-xs text-text-secondary uppercase tracking-widest">Downtime</div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col items-center">
              <Shield size={48} className="text-accent-primary mb-4" />
              <div className="font-display text-5xl font-bold mb-2 text-white">100%</div>
              <div className="font-mono text-xs text-text-secondary uppercase tracking-widest">Evidence Backed</div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col items-center">
              <Database size={48} className="text-text-secondary mb-4" />
              <div className="font-display text-5xl font-bold mb-2 text-white">Sub-sec</div>
              <div className="font-mono text-xs text-text-secondary uppercase tracking-widest">Vector Search</div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col items-center">
              <Network size={48} className="text-white mb-4" />
              <div className="font-display text-5xl font-bold mb-2 text-white">Infinite</div>
              <div className="font-mono text-xs text-text-secondary uppercase tracking-widest">Scale</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative w-full z-10 bg-accent-primary text-black py-32 brutal-border-t">
        <div className="max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
          <h2 className="font-display text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-8 leading-none">
            Stop <br/> Guessing.
          </h2>
          <p className="font-mono text-sm md:text-base font-bold uppercase tracking-widest mb-12 opacity-80 max-w-xl">
            The data is already there. You just need the right intelligence engine to piece it together.
          </p>
          <Link to="/dashboard" className="px-10 py-5 bg-black text-accent-primary font-display font-bold text-xl uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-4 group">
            Execute <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
