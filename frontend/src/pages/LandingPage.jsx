import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Database, Cpu, Eye } from "lucide-react";

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
    </div>
  );
}
