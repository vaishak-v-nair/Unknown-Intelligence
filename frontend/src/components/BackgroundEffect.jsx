import React from 'react';
import { motion } from 'framer-motion';

const BackgroundEffect = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-space-black pointer-events-none">
      {/* Animated Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-primary opacity-[0.08] blur-[120px]"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent-secondary opacity-[0.06] blur-[140px]"
      />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-50" 
           style={{
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
             backgroundSize: '3rem 3rem',
             maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
             WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
           }}
      />
      
      {/* Gradient vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505] opacity-80" />
    </div>
  );
};

export default BackgroundEffect;
