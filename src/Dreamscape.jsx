// Enhanced floating titles with responsive sizing
const FloatingTitles = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const titles = [
    { text: "SALLY", color: "#ff1493" },
    { text: "MONUMENT", color: "#ff69b4" },
    { text: "DREAMSCAPE", color: "#ffb6c1" },
    { text: "INTERNAL", color: "#ff0080" }
  ];

  return titles.map((title, i) => (
    <Float key={i} speed={isMobile ? 0.5 : 1} rotationIntensity={isMobile ? 0.2 : 0.5} floatIntensity={isMobile ? 0.2 : 0.5}>
      <Text
        position={[(i - 1.5) * 8, -3 + i * 0.5, (i - 2) * 5]}
        fontSize={isMobile ? 1.2 : 2}
        color={title.color}
        font="/fonts/inter-bold.woff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={isMobile ? 0.03 : 0.05}
        outlineColor="#ffffff"
        outlineOpacity={0.5}
      >
        {title.text}
      </Text>
    </Float>
  ));
};

// Improved liquid nexus - hide on mobile
const LiquidNexus = ({ position }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y += 0.005;
    mesh.current.rotation.x = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <Float rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        <tetrahedronGeometry args={[1.2, 0]} />
        <MeshDistortMaterial
          color="#ff0000"
          speed={2}
          distort={0.3}
          radius={1.5}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
};

export default function Dreamscape() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    // Throttle resize checks for performance
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const flowers = useMemo(() => {
    const colors = ["#ff1493", "#ff69b4", "#ffb6c1", "#ff0080", "#ff4500", "#ff6347"];
    const flowerCount = isMobile ? 15 : 60; // Even fewer on mobile
    
    return Array.from({ length: flowerCount }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * (isMobile ? 20 : 30),
        (Math.random() - 0.5) * (isMobile ? 15 : 20) - 5,
        (Math.random() - 0.5) * (isMobile ? 20 : 30),
      ],
      color: colors[i % colors.length],
      speed: Math.random() * (isMobile ? 1 : 2) + 0.8,
      factor: Math.random() * 0.4 + 0.4
    }));
  }, [isMobile]);

  const nexusPositions = useMemo(() => {
    if (isMobile) return []; // No nexus objects on mobile
    
    return Array.from({ length: 8 }).map((_, i) => [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 15 + 2,
      (Math.random() - 0.5) * 20,
    ]);
  }, [isMobile]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-red-900 overflow-hidden relative touch-none">
      <Canvas
        shadows={false} // Never shadows on mobile for performance
        camera={{ position: [5, 5, 15], fov: isMobile ? 60 : 45 }}
        dpr={isMobile ? [0.8, 1] : [1, 1.5]} // Lower DPR on mobile
        gl={{ 
          antialias: !isMobile, // Disable antialias on mobile
          alpha: false,
          powerPreference: isMobile ? "low-power" : "default", // Battery optimization
          depth: true,
          stencil: false,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false
        }}
        frameloop="demand" // Save battery life
        dpr={isMobile ? [0.75, 1] : [1, 1.5]}
        gl={{ 
          antialias: false, // Completely disable on mobile
          alpha: false,
          powerPreference: "low-power",
          depth: true,
          stencil: false,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false
        }}
        frameloop="demand"
        onCreated={({ gl, camera }) => {
          // Mobile-specific optimization
          if (isMobile) {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap DPR
            gl.shadowMap.enabled = false; // No shadows on mobile
          }
        }}
      >
        <color attach="background" args={['#1a0a1e']} />
        <fog attach="fog" args={['#ff0080', 8, isMobile ? 25 : 50]} />
        
        {/* Optimized lighting */}
        <ambientLight intensity={isMobile ? 0.4 : 0.3} color="#ff1493" />
        <directionalLight position={[0, 10, 5]} intensity={isMobile ? 1 : 0.8} color="#ff69b4" castShadow={!isMobile} />
        
        {/* No stars on mobile - too expensive */}
        {!isMobile && <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />}

        <LiquidBlob />
        <VividLandscape />
        
        {!isMobile && <FloatingTitles />}

        {flowers.map((f, i) => (
          <CrystalFlower key={i} {...f} />
        ))}

        {nexusPositions.map((pos, i) => (
          <LiquidNexus key={`nexus-${i}`} position={pos} />
        ))}

        {/* Fewer audio-reactive elements on mobile */}
        <AudioReactiveCrystal position={[3, 2, 8]} color="#ff1493" intensity={1.2} />
        {!isMobile && <AudioReactiveCrystal position={[-4, 1, 6]} color="#ff69b4" intensity={0.8} />}

        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={isMobile ? 0.1 : 0.3} 
          scale={isMobile ? 15 : 30} 
          blur={isMobile ? 1 : 3} 
          far={isMobile ? 3 : 6}
          resolution={isMobile ? 256 : 512}
        />
        
        <OrbitControls 
          makeDefault 
          autoRotate={!isMobile} // No auto-rotate on mobile
          autoRotateSpeed={0.3} 
          enablePan={false} // Disable annoying pan on mobile
          maxPolarAngle={Math.PI / 1.8} 
          minDistance={isMobile ? 12 : 8} 
          maxDistance={isMobile ? 20 : 30} 
          enableZoom={false} // Disable zoom entirely on mobile for simplicity
          enableDamping={!isMobile} // Performance optimization
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>

      {/* Enhanced UI Overlay - Mobile optimized */}
      <div className={`absolute inset-0 pointer-events-none flex flex-col ${isMobile ? 'justify-between px-4 py-6' : 'justify-between p-8'}`}>
        {/* Simplified header on mobile */}
        {!isMobile && (
          <motion.div 
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 0.9 }}
            className="text-white text-center self-center"
          >
            <motion.h2 
              className="text-8xl font-black italic tracking-tighter drop-shadow-2xl uppercase bg-gradient-to-r from-pink-300 via-purple-300 to-red-300 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              The Dreamscape
            </motion.h2>
            <motion.p 
              className="text-purple-200 font-bold tracking-[0.4em] uppercase text-sm mt-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm inline-block"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              Sally&#39;s Quantum Reservoir
            </motion.p>
          </motion.div>
        )}

        {/* Mobile header */}
        {isMobile && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 0.9 }}
            className="text-white text-center"
          >
            <motion.h2 
              className="text-3xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-pink-300 via-purple-300 to-red-300 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              Dreamscape
            </motion.h2>
          </motion.div>
        )}

        {/* Audio Controls - Mobile First */}
        <motion.div
           initial={{ y: 80, opacity: 0 }}
           animate={{ y: 0, opacity: 0.9 }}
           className="self-center pointer-events-auto"
        >
          <div className={`flex items-center gap-3 ${isMobile ? 'gap-2 p-4' : 'gap-3 bg-black/20 backdrop-blur-xl border border-white/20 p-6 rounded-3xl'}`}>
            <button className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white ${isMobile ? 'p-2' : ''}`}>
              <SkipBack className={`w-5 h-5 ${isMobile ? 'w-4 h-4' : ''}`} />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all text-white font-bold shadow-lg ${isMobile ? 'p-3' : 'p-4'} rounded-full`}
            >
              {isPlaying ? <Pause className={`w-6 h-6 ${isMobile ? 'w-5 h-5' : ''}`} /> : <Play className={`w-6 h-6 ml-1 ${isMobile ? 'w-5 h-5 ml-0' : ''}`} />}
            </button>
            
            <button className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white ${isMobile ? 'p-2' : ''}`}>
              <SkipForward className={`w-5 h-5 ${isMobile ? 'w-4 h-4' : ''}`} />
            </button>
            
            {/* Volume control simplified on mobile */}
            {!isMobile && (
              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 accent-pink-500"
                  style={{ filter: 'hue-rotate(270deg)' }}
                />
              </div>
            )}

            {/* Mobile volume control */}
            {isMobile && (
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white ml-2"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </motion.div>

        {/* Navigation Back - Mobile optimized */}
        <motion.div
           initial={{ y: 80, opacity: 0 }}
           animate={{ y: 0, opacity: 0.9 }}
           className="self-center pointer-events-auto"
        >
          <NavLink 
            to="/" 
            className={`flex items-center gap-6 bg-gradient-to-r from-black/20 to-purple-900/20 backdrop-blur-2xl border border-white/30 px-12 py-6 rounded-full hover:bg-white/30 transition-all duration-300 group overflow-hidden relative ${isMobile ? 'gap-4 px-8 py-4' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <ArrowLeft className={`text-white relative z-10 group-hover:-translate-x-2 transition-transform ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            <span className={`text-white font-black italic tracking-tighter relative z-10 group-hover:translate-x-2 transition-transform ${isMobile ? 'text-lg' : 'text-2xl'}`}>RETURN TO SURFACE</span>
          </NavLink>
        </motion.div>
      </div>

      {/* Enhanced Frutiger Gloss Effect with Parallax - Simplified on mobile */}
      <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10" />
          {!isMobile && (
            <div className="absolute top-8 left-8 right-8 h-[40%] bg-white/5 rounded-[4rem] blur-2xl animate-pulse" />
          )}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 bg-pink-500/5 animate-[pulse_2s_infinite] ${isMobile ? 'animate-[pulse_3s_infinite]' : ''}`}
              />
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}