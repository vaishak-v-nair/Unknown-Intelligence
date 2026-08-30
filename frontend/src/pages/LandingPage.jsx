import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldAlert, Database, Cpu, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col items-center text-center">
      <motion.div 
        className="flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center px-3 py-1 mb-8 text-xs font-medium border rounded-full text-emerald-500 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <ShieldAlert size={16} className="mr-2"/> System Active
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-6xl font-bold leading-tight mb-6 text-text-primary">
          Discover the <br/><span className="text-gradient">Unknown-Unknowns</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-xl text-text-secondary max-w-2xl mb-12 leading-relaxed">
          Proactive data intelligence powered by Cross-Author Convergence, 
          Vector Databases (RAG), and Agentic LLMs. We find the anomalies 
          you didn't know to look for.
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <Link to="/dashboard" className="inline-flex items-center px-6 py-3 bg-accent-primary text-white rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)]">
            Launch Dashboard <ArrowRight size={18} className="ml-2"/>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="glass-panel p-8 text-left">
          <Database className="text-accent-primary mb-6" size={32} />
          <h3 className="text-xl font-medium mb-3 text-text-primary">100% RAG Grounded</h3>
          <p className="text-text-secondary leading-relaxed">Powered by Milvus Vector Database. Zero AI hallucinations, purely evidence-based intelligence.</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-8 text-left">
          <Cpu className="text-accent-primary mb-6" size={32} />
          <h3 className="text-xl font-medium mb-3 text-text-primary">Proactive Orchestration</h3>
          <p className="text-text-secondary leading-relaxed">The system never sleeps. Autonomous background loops continuously investigate your data.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
