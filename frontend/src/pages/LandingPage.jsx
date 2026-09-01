import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Shield, Zap, Lock } from "lucide-react";

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
    <div className="relative w-full min-h-screen bg-surface-gray overflow-hidden">
      
      {/* Background Graphic / Mountains (Abstract) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-brand-light to-pink-50 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-brand-secondary/10 to-transparent rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold font-sans">
            U
          </div>
          <span className="font-sans font-semibold text-text-primary text-xl tracking-tight">UnknownUnknowns</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <a href="#product" className="hover:text-text-primary transition-colors">Product</a>
          <a href="#solutions" className="hover:text-text-primary transition-colors">Solutions</a>
          <a href="#resources" className="hover:text-text-primary transition-colors">Resources</a>
          <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm font-medium text-text-secondary hover:text-text-primary hidden sm:block">Sign in</a>
          <Link to="/dashboard" className="saas-button">
            Book a demo <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="z-10 w-full max-w-3xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand-primary text-xs font-semibold mb-8 border border-brand-primary/10">
            <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
            AI-NATIVE ENGINEERING INTELLIGENCE
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-7xl font-bold tracking-tight text-text-primary leading-[1.1] mb-6">
            Find what your<br />
            team <span className="italic text-brand-primary font-normal">can't see.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg text-text-secondary max-w-xl mb-10 leading-relaxed">
            UnknownUnknowns surfaces hidden patterns, contradictions, and emerging issues across your engineering data—before they become costly problems.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard" className="saas-button text-base px-8 py-4">
              Analyze a repository <ArrowRight size={18} className="ml-2" />
            </Link>
            <button className="saas-button-outline text-base px-8 py-4">
              See how it works
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Abstract Cards (Representing the mountain/nodes graphic) */}
        <div className="absolute right-0 top-32 w-1/2 h-full hidden lg:block pointer-events-none">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="absolute top-10 right-40 glass-card p-4 flex items-start gap-3 max-w-xs"
           >
             <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-primary shrink-0 mt-1">
               <Search size={14} />
             </div>
             <div>
               <div className="text-sm font-semibold text-text-primary">Architecture drift</div>
               <div className="text-xs text-text-secondary mt-1">Multiple subsystems changing in isolation.</div>
             </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.7, duration: 0.8 }}
             className="absolute top-48 -right-10 glass-card p-4 flex items-start gap-3 max-w-xs"
           >
             <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 mt-1">
               <Zap size={14} />
             </div>
             <div>
               <div className="text-sm font-semibold text-text-primary">Contradictory patterns</div>
               <div className="text-xs text-text-secondary mt-1">Developers solving the same problem differently.</div>
             </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.9, duration: 0.8 }}
             className="absolute top-72 right-52 glass-card p-4 flex items-start gap-3 max-w-xs"
           >
             <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 mt-1">
               <Shield size={14} />
             </div>
             <div>
               <div className="text-sm font-semibold text-text-primary">Unseen dependencies</div>
               <div className="text-xs text-text-secondary mt-1">Hidden coupling between distant components.</div>
             </div>
           </motion.div>
        </div>
      </div>

      {/* Trusted By */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-8">Trusted by engineering teams</div>
        <div className="flex flex-wrap items-center gap-12 opacity-60 grayscale">
          {/* Mock Logos */}
          <div className="font-display font-bold text-2xl flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-black"></div> Linear</div>
          <div className="font-display font-bold text-2xl flex items-center gap-2"><div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-black"></div> Vercel</div>
          <div className="font-sans font-bold text-2xl flex items-center gap-2">Retool</div>
          <div className="font-sans font-bold text-2xl flex items-center gap-2 text-emerald-600">Supabase</div>
        </div>
      </div>

      {/* Why Teams Choose Section */}
      <div className="bg-white py-32 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Why teams choose UnknownUnknowns</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center mb-6">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Proactive Discovery</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                We don't wait for alerts. We analyze continuously to surface what matters before it impacts your users.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Evidence-First</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Every finding is backed by verifiable evidence, timeline, and impact analysis via pure RAG grounding.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Contextual & Accurate</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Understand the full context across code, issues, PRs, and discussions with minimal noise.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center mb-6">
                <Lock size={24} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Private & Secure</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Your data stays yours. We never use your repositories to train our foundational models.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-surface-gray py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Trusted by Engineering Leaders</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="saas-card p-8">
              <div className="text-brand-primary text-4xl font-display mb-4">"</div>
              <p className="text-text-primary text-sm leading-relaxed mb-8">
                UnknownUnknowns helped us catch a systemic issue in our state management that would have taken weeks to diagnose manually.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">Alex Chen</div>
                  <div className="text-xs text-text-secondary">Staff Engineer, Vercel</div>
                </div>
              </div>
            </div>
            
            <div className="saas-card p-8">
              <div className="text-brand-primary text-4xl font-display mb-4">"</div>
              <p className="text-text-primary text-sm leading-relaxed mb-8">
                It's like having a senior engineer reading every discussion, PR and commit across the entire codebase, 24/7.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">Sarah Martinez</div>
                  <div className="text-xs text-text-secondary">Engineering Manager, Linear</div>
                </div>
              </div>
            </div>
            
            <div className="saas-card p-8">
              <div className="text-brand-primary text-4xl font-display mb-4">"</div>
              <p className="text-text-primary text-sm leading-relaxed mb-8">
                We found architectural drift across 6 services before it turned into production incidents. Game changer.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">Robbie Singh</div>
                  <div className="text-xs text-text-secondary">Tech Lead, Retool</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-32 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Stop reacting. Start uncovering.
          </h2>
          <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
            Join the teams who find what others miss. Connect your repositories in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="saas-button text-base px-8 py-4">
              Analyze a repository <ArrowRight size={18} className="ml-2" />
            </Link>
            <button className="saas-button-outline text-base px-8 py-4 border-transparent shadow-none hover:bg-transparent hover:text-brand-primary">
              Book a demo &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
