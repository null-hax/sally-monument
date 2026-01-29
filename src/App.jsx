import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SallyMonument from './SallyMonument';
import Dreamscape from './Dreamscape';
import MusicPlayer from './components/MusicPlayer';
import './index.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const location = useLocation();

  return (
    <div className="relative">
      {/* Persisted Music Player in Dreamscape - optional, but let's keep it clean */}
      {/* The prompt says ensure music player persists across the route change */}
      {/* I'll put it in a global way if needed, but the current design has it inside the Monument. */}
      {/* To TRULY persist and be visible/audible, it should be in the layout. */}
      {/* I will add a mini-player that appears in Dreamscape if it was playing. */}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <PageWrapper>
                <SallyMonument isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
              </PageWrapper>
            } 
          />
          <Route 
            path="/dreamscape" 
            element={
              <PageWrapper>
                <Dreamscape />
                {/* Mini persistent player for Dreamscape */}
                <div className="fixed bottom-8 left-8 z-[100] scale-75 origin-bottom-left group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-4">
                    <MusicPlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
                  </div>
                  {!isPlaying && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 text-white cursor-pointer"
                      onClick={() => setIsPlaying(true)}
                    >
                      <span className="text-[8px] font-bold">PLAY</span>
                    </motion.div>
                  )}
                </div>
              </PageWrapper>
            } 
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
