import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, OrbitControls, Environment, ContactShadows, Text, Stars, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const CrystalFlower = ({ position, color, speed = 1, factor = 0.6 }) => {
  const mesh = useRef();
  const geometry = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    mesh.current.position.y += Math.sin(t) * 0.002;
    mesh.current.rotation.x += 0.01;
    mesh.current.rotation.z += 0.005;
    
    // Pulse effect
    const pulse = 1 + Math.sin(t * 2) * 0.1;
    mesh.current.scale.setScalar(pulse);
  });

  return (
    <Float rotationIntensity={2} floatIntensity={2}>
      <mesh ref={mesh} position={position}>
        <octahedronGeometry ref={geometry} args={[0.8, 1]} /> {/* More complex geometry */}
        <MeshWobbleMaterial 
          color={color} 
          factor={factor} 
          speed={speed * 1.5} 
          transparent 
          opacity={0.9}
          roughness={0.1}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
};

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

const LiquidBlob = () => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.scale.setScalar(2.5 + Math.sin(t) * 0.1);
    mesh.current.rotation.y += 0.002;
  });

  return (
    <mesh ref={mesh} scale={3} position={[0, -2, -10]}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color="#881337"
        speed={4}
        distort={0.3}
        radius={2}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
};

const VividLandscape = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[150, 150]} />
      <MeshDistortMaterial
        color="#ff1493"
        speed={0.8}
        distort={0.15}
        radius={1}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
};

// Audio-reactive elements
const AudioReactiveCrystal = ({ position, color, intensity = 1 }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const audioReact = Math.sin(t * 8) * 0.1 * intensity; // Simulate audio reactivity
    mesh.current.scale.setScalar(1 + audioReact);
    mesh.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={mesh} position={position}>
      <icosahedronGeometry args={[0.6, 1]} />
      <MeshWobbleMaterial
        color={color}
        factor={0.3}
        speed={2}
        transparent
        opacity={0.8}
        metalness={0.9}
        roughness={0.1}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

const FloatingTitles = () => {
  const titles = [
    { text: "SALLY", color: "#ff1493" },
    { text: "MONUMENT", color: "#ff69b4" },
    { text: "DREAMSCAPE", color: "#ffb6c1" },
    { text: "INTERNAL", color: "#ff0080" }
  ];

  return titles.map((title, i) => (
    <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        position={[(i - 1.5) * 8, -3 + i * 0.5, (i - 2) * 5]}
        fontSize={2}
        color={title.color}
        font="/fonts/inter-bold.woff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
        outlineOpacity={0.5}
      >
        {title.text}
      </Text>
    </Float>
  ));
};

export default function Dreamscape() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const flowers = useMemo(() => {
    const colors = ["#ff1493", "#ff69b4", "#ffb6c1", "#ff0080", "#ff4500", "#ff6347"];
    return Array.from({ length: 60 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20 - 5,
        (Math.random() - 0.5) * 30,
      ],
      color: colors[i % colors.length],
      speed: Math.random() * 2 + 0.8,
      factor: Math.random() * 0.4 + 0.4
    }));
  }, []);

  const nexusPositions = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 15 + 2,
      (Math.random() - 0.5) * 20,
    ]);
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-red-900 overflow-hidden relative">
      <Canvas
        shadows
        camera={{ position: [5, 5, 15], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1a0a1e']} />
        <fog attach="fog" args={['#ff0080', 8, 50]} />
        
        <ambientLight intensity={0.3} color="#ff1493" />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ff69b4" castShadow />
        <pointLight position={[-10, 15, 10]} intensity={1.5} color="#ff0080" castShadow />
        <directionalLight position={[0, 20, 5]} intensity={1} color="#ffffff" castShadow />

        <Environment preset="studio" background={false} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

        <LiquidBlob />
        <VividLandscape />
        
        <FloatingTitles />

        {flowers.map((f, i) => (
          <CrystalFlower key={i} {...f} />
        ))}

        {nexusPositions.map((pos, i) => (
          <LiquidNexus key={`nexus-${i}`} position={pos} />
        ))}

        {/* Audio-reactive elements */}
        <AudioReactiveCrystal position={[3, 2, 8]} color="#ff1493" intensity={1.2} />
        <AudioReactiveCrystal position={[-4, 1, 6]} color="#ff69b4" intensity={0.8} />
        <AudioReactiveCrystal position={[0, -1, 12]} color="#ffb6c1" intensity={1.5} />

        <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={30} blur={3} far={6} />
        
        <OrbitControls 
          makeDefault 
          autoRotate 
          autoRotateSpeed={0.3} 
          enablePan={true} 
          maxPolarAngle={Math.PI / 1.8} 
          minDistance={8} 
          maxDistance={30} 
          enableZoom={true}
        />
      </Canvas>

      {/* Enhanced UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
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

        {/* Audio Controls - Modern UI */}
        <motion.div
           initial={{ y: 80, opacity: 0 }}
           animate={{ y: 0, opacity: 0.9 }}
           className="self-center pointer-events-auto"
        >
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-xl border border-white/20 p-6 rounded-3xl">
            {/* Back Button */}
            <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
              <SkipBack className="w-5 h-5" />
            </button>
            
            {/* Play/Pause */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all text-white text-xl font-bold shadow-lg"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            
            {/* Forward Button */}
            <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
              <SkipForward className="w-5 h-5" />
            </button>
            
            {/* Volume Control */}
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
          </div>
        </motion.div>

        {/* Navigation Back */}
        <motion.div
           initial={{ y: 80, opacity: 0 }}
           animate={{ y: 0, opacity: 0.9 }}
           className="self-center pointer-events-auto"
        >
          <NavLink 
            to="/" 
            className="flex items-center gap-6 bg-gradient-to-r from-black/20 to-purple-900/20 backdrop-blur-2xl border border-white/30 px-12 py-6 rounded-full hover:bg-white/30 transition-all duration-300 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <ArrowLeft className="text-white w-8 h-8 relative z-10 group-hover:-translate-x-2 transition-transform" />
            <span className="text-white font-black italic tracking-tighter text-2xl relative z-10 group-hover:translate-x-2 transition-transform">RETURN TO SURFACE</span>
          </NavLink>
        </motion.div>
      </div>

      {/* Enhanced Frutiger Gloss Effect with Parallax */}
      <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10" />
          <div className="absolute top-8 left-8 right-8 h-[40%] bg-white/5 rounded-[4rem] blur-2xl animate-pulse" />
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-pink-500/5 animate-[pulse_2s_infinite]"
              />
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}