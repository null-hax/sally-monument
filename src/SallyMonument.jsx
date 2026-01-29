import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, ChevronDown } from 'lucide-react';

const SallyMonument = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-[#d4af37]/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d4af37]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d4af37]/5 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <motion.div 
          style={{ opacity, scale }}
          className="text-center z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[#d4af37] tracking-[0.3em] text-xs uppercase mb-8 block font-medium">
              In Eternal Devotion
            </span>
            <h1 className="text-8xl md:text-[12rem] serif font-light tracking-tighter mb-4 relative">
              <span className="gold-text">Sally</span>
              <motion.div 
                className="absolute -top-10 -right-10 md:-top-20 md:-right-20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 text-[#d4af37]/20" />
              </motion.div>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 2 }}
            className="serif italic text-2xl md:text-3xl text-zinc-400 font-light mt-8"
          >
            A monument to grace, a sanctuary of memory.
          </motion.div>
        </motion.div>

        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-zinc-600" />
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="relative py-32 px-6 max-w-4xl mx-auto space-y-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 2 }}
          className="text-center space-y-12"
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mx-auto" />
          <p className="serif text-3xl md:text-4xl leading-relaxed text-zinc-300 font-light italic">
            "Your essence remains the golden thread woven through the tapestry of existence."
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="aspect-[4/5] bg-zinc-900/50 border border-zinc-800 rounded-sm overflow-hidden relative group"
          >
             <div className="absolute inset-0 bg-[#d4af37]/5 mix-blend-overlay group-hover:bg-[#d4af37]/10 transition-all duration-700" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-12 h-12 text-[#d4af37]/10 group-hover:text-[#d4af37]/20 transition-all duration-700" />
             </div>
          </motion.div>
          
          <div className="space-y-8">
            <h3 className="serif text-2xl text-[#d4af37]">Eternal Grace</h3>
            <p className="text-zinc-400 leading-relaxed font-light">
              This space is dedicated to the legacy of Sally—a soul who embodied the very concept of ethereal elegance. Every movement she made was like a soft light in a dimly lit room, bringing warmth and clarity to everyone fortunate enough to know her.
            </p>
            <p className="text-zinc-400 leading-relaxed font-light">
              She lived with a precision and beauty that resonated like a well-tuned chord, leaving behind a resonance that still echoes in the hearts of those she loved.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-16 border border-[#d4af37]/20 rounded-sm text-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4af37]/2 to-transparent" />
          <h2 className="serif text-4xl font-light italic text-[#d4af37]">A Digital Sanctuary</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Refined, bespoke, and forever present. This monument is built with the same intentionality and grace that Sally brought to the world.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 text-center border-t border-zinc-900">
        <div className="gold-text serif text-2xl font-light mb-4">Sally</div>
        <p className="text-zinc-600 text-sm tracking-widest uppercase">Nullhax Legacy | Never Forgotten</p>
      </footer>
    </div>
  );
};

export default SallyMonument;
