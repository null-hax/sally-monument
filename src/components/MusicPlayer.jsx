import React from 'react';
import { motion } from 'framer-motion';
import { Music, Rewind, Play, Pause, FastForward } from 'lucide-react';

export default function MusicPlayer({ isPlaying, setIsPlaying }) {
  return (
    <div className="bg-black/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 shadow-inner">
      <div className="flex items-center gap-6 mb-8 text-white">
        <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center animate-spin-slow shadow-lg">
          <Music size={32} />
        </div>
        <div className="flex-1">
          <div className="h-1.5 w-full bg-white/20 rounded-full mb-3 overflow-hidden">
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-1/3 h-full bg-gradient-to-r from-transparent via-white to-transparent"
            />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-black italic">Pure Optimism.wav</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Sally // Eternal Echoes</p>
            </div>
            <span className="text-xs font-mono opacity-60">04:20 / ♾️</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-8">
        <Rewind className="text-white/60 hover:text-white cursor-pointer transition" />
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-pink-500 hover:scale-110 transition relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white to-pink-100 rounded-full pointer-events-none" />
          {isPlaying ? <Pause size={28} className="relative z-10 fill-pink-500" /> : <Play size={28} className="relative z-10 ml-1 fill-pink-500" />}
        </motion.button>
        <FastForward className="text-white/60 hover:text-white cursor-pointer transition" />
      </div>
    </div >
  );
}
