import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Database, Cpu, ArrowRight, Eye } from "lucide-react";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const fadeUp = {
    hidden: { y: 40, opacity: 0, filter: 'blur(10px)' },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { type: "spring", stiffness: 80, damping: 20 } }
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-8 pt-20">
        <motion.div 
          className="flex flex-col items-center z-10 w-full max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ y: y1, opacity }}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center px-4 py-1.5 mb-12 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent-secondary mr-3 animate-pulse"></span>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-text-secondary">Intelligence System v2.0</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="font-display text-7xl md:text-[9rem] font-bold tracking-tighter leading-[0.85] mb-8 text-text-primary">
            REVEAL THE <br/>
            <span className="text-gradient">UNSEEN.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-16 leading-relaxed font-light">
            Proactive data intelligence powered by <strong className="text-white font-medium">Cross-Author Convergence</strong> and <strong className="text-white font-medium">Vector DBs</strong>. We find the anomalies you didn't know to look for.
          </motion.p>
          
          <motion.div variants={fadeUp} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
            <Link to="/dashboard" className="relative flex items-center px-8 py-4 bg-[#050505] border border-white/10 rounded-xl font-medium text-lg text-white transition-all hover:bg-white/[0.02]">
              Launch Intelligence <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform"/>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="relative max-w-7xl mx-auto px-8 py-32 z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ y: y2 }}
        >
          <motion.div variants={fadeUp} className="glass-panel p-10 group hover:bg-white/[0.05] transition-colors duration-500">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-transparent flex items-center justify-center mb-8 border border-accent-primary/20">
              <Database className="text-accent-primary" size={28} />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-4 text-text-primary">Pure RAG Grounding</h3>
            <p className="text-text-secondary leading-relaxed">Powered by local vector search. Zero AI hallucinations, purely evidence-based intelligence derived strictly from your data.</p>
          </motion.div>
          
          <motion.div variants={fadeUp} className="glass-panel p-10 group hover:bg-white/[0.05] transition-colors duration-500">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-secondary/20 to-transparent flex items-center justify-center mb-8 border border-accent-secondary/20">
              <Cpu className="text-accent-secondary" size={28} />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-4 text-text-primary">Autonomous Agents</h3>
            <p className="text-text-secondary leading-relaxed">The system never sleeps. Background orchestration loops continuously investigate, synthesize, and categorize your datasets.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-panel p-10 group hover:bg-white/[0.05] transition-colors duration-500">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-transparent flex items-center justify-center mb-8 border border-emerald-500/20">
              <Eye className="text-emerald-400" size={28} />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-4 text-text-primary">Uncover Blindspots</h3>
            <p className="text-text-secondary leading-relaxed">By tracking distinct author convergence, we identify critical 'Unknowns' before they become catastrophic failures.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
