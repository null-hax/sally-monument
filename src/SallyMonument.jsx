  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FFB6C2] via-[#FF69B4] to-[#7BC9FF] overflow-hidden flex items-center justify-center p-4 font-sans selection:bg-white selection:text-pink-500 relative">
      
      {/* Frutiger Aero Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-300/30 rounded-full blur-[120px] md:block hidden" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-pink-300/20 rounded-full blur-[100px] md:block hidden" />
        
        {/* Animated Bubbles - mobile friendly count */}
        {[...Array(window.innerWidth < 768 ? 8 : 12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: `${Math.random() * 100}vw`, scale: Math.random() * 0.5 + 0.5 }}
            animate={{ y: '-20vh', x: `${(Math.random() * 100) + (Math.sin(i) * 50)}vw` }}
            transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: i * 2 }}
            className="absolute rounded-full bg-white/20 backdrop-blur-[2px] border border-white/30 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] md:block hidden"
            style={{ width: `${Math.random() * 80 + 20}px`, height: `${Math.random() * 80 + 20}px` }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-2xl bg-white/20 backdrop-blur-2xl border border-white/50 rounded-[4rem] p-12 shadow-[0_32px_64px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        {/* Gloss Overlay */}
        <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        
        <header className="text-center mb-12">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-white to-pink-200 rounded-[2rem] flex items-center justify-center shadow-2xl skew-x-3 rotate-3">
              <Star className="text-pink-500 w-12 h-12 fill-pink-500" />
            </div>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_4px_rgba(255,105,180,0.5)] mb-2">
            SALLY
          </h1>
          <div className="flex items-center justify-center gap-2 opacity-60">
            <Sparkles size={14} className="text-white" />
            <span className="text-[10px] uppercase font-bold tracking-[0.5em] text-white">Digital Grace Manifest v4.1</span>
            <Sparkles size={14} className="text-white" />
          </div>
        </header>

        <MusicPlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} />

        <footer className="mt-12 flex justify-between items-center text-white/40">
           <div className="flex gap-2">
             <Heart size={16} className="hidden md:inline" />
             <Heart size={16} />
             <Heart size={16} />
           </div>
           <NavLink to="/dreamscape">
             <GlossyButton className="text-[10px] uppercase tracking-[0.3em] font-black italic px-4 py-2 md:px-6 md:py-2">
               Enter Dreamscape
             </GlossyButton>
           </NavLink>
        </footer>
      </motion.div>

      <div className="fixed bottom-8 right-8 text-white/20 text-[10px] font-black uppercase tracking-[0.6em] vertical-text hidden md:block">
        nullhax_manifest_0xFF
      </div>
    </div>
  );
}