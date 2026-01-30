import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Preload } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

/**
 * DREAMSCAPE - Frutiger Aero Interactive Experience
 * Bright, vibrant, fully interactive 3D environment
 */

// ============ INTERACTIVE GLOSSY SPHERE ============
function GlossySphere({ position, color, size = 1, speed = 0.3 }) {
  const meshRef = useRef();
  const highlightRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const t = clock.getElapsedTime() * speed;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.5;
    meshRef.current.rotation.x += 0.003;
    meshRef.current.rotation.y += 0.006;
    
    if (highlightRef.current) {
      highlightRef.current.rotation.x -= 0.01;
      highlightRef.current.rotation.y -= 0.015;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
      >
        <sphereGeometry args={[size, 128, 128]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.95}
          roughness={0.05}
          transmission={0.2}
          thickness={1}
          ior={1.6}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.6 : 0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Bright glossy overlay */}
      <mesh ref={highlightRef} scale={1.15}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial
          transparent
          opacity={hovered ? 0.5 : 0.2}
          color="#ffffff"
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ============ CRYSTAL TOROID ============
function CrystalToroid({ position, color, scale = 1, speed = 0.2 }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    meshRef.current.rotation.x = Math.sin(t * 0.6) * 0.8;
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.rotation.z = Math.cos(t * 0.4) * 0.5;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow receiveShadow>
      <torusGeometry args={[3, 0.5, 16, 150]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.98}
        roughness={0.02}
        transmission={0.4}
        thickness={0.8}
        ior={1.7}
        emissive={color}
        emissiveIntensity={0.3}
        clearcoat={1}
        clearcoatRoughness={0.05}
      />
    </mesh>
  );
}

// ============ PARTICLE SYSTEM ============
function Particles() {
  const pointsRef = useRef();
  const particlesRef = useRef([]);
  const COUNT = 1200;

  useMemo(() => {
    const particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        life: Math.random() * 100,
        maxLife: 100
      });
    }
    particlesRef.current = particles;
  }, []);

  useFrame(() => {
    const particles = particlesRef.current;
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.position.add(p.velocity);
      p.life--;
      
      if (p.life <= 0) {
        p.position.set(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60
        );
        p.velocity.set(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        );
        p.life = 100;
      }
    }

    if (pointsRef.current) {
      const positions = new Float32Array(particles.length * 3);
      const sizes = new Float32Array(particles.length);
      
      for (let i = 0; i < particles.length; i++) {
        positions[i * 3] = particles[i].position.x;
        positions[i * 3 + 1] = particles[i].position.y;
        positions[i * 3 + 2] = particles[i].position.z;
        sizes[i] = (particles[i].life / particles[i].maxLife) * 0.3 + 0.05;
      }
      
      pointsRef.current.geometry.attributes.position.array = positions;
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.size.array = sizes;
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  const positions = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    sizes[i] = Math.random() * 0.3 + 0.1;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={COUNT} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="#ff1493" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

// ============ GLOWING GRID ============
function GlowingGrid() {
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.rotation.z = clock.getElapsedTime() * 0.1;
    }
  });

  const gridSize = 40;
  const divisions = 10;
  const points = [];
  
  for (let i = -gridSize / 2; i <= gridSize / 2; i += gridSize / divisions) {
    points.push(new THREE.Vector3(-gridSize / 2, i, 0));
    points.push(new THREE.Vector3(gridSize / 2, i, 0));
    points.push(new THREE.Vector3(i, -gridSize / 2, 0));
    points.push(new THREE.Vector3(i, gridSize / 2, 0));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group ref={lineRef} position={[0, -25, 0]}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#00ffff" linewidth={2} transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}

// ============ SCENE ============
function Scene() {
  return (
    <>
      <color attach="background" args={['#0f1c3f']} />
      <fog attach="fog" args={['#1a2847', 30, 150]} />

      {/* Bright lighting setup */}
      <ambientLight intensity={0.8} color="#ffb3e6" />
      <directionalLight
        position={[30, 40, 30]}
        intensity={1.8}
        color="#ffccff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <pointLight position={[-40, 20, -40]} intensity={1.2} color="#00ffff" />
      <pointLight position={[40, 20, 40]} intensity={1.2} color="#ffff00" />

      {/* Environment */}
      <Stars radius={300} depth={60} count={3000} factor={6} saturation={0.5} />
      <GlowingGrid />

      {/* Main spheres - BRIGHT colors */}
      <GlossySphere position={[25, 15, 0]} color="#ff1493" size={3.5} speed={0.2} />
      <GlossySphere position={[-25, 10, 15]} color="#00ffff" size={3} speed={0.25} />
      <GlossySphere position={[0, 20, -25]} color="#ffff00" size={2.5} speed={0.15} />
      <GlossySphere position={[15, 5, 25]} color="#00ff00" size={2} speed={0.3} />
      <GlossySphere position={[-15, 12, -15]} color="#ff00ff" size={2.2} speed={0.22} />

      {/* Crystal toroids */}
      <CrystalToroid position={[20, 0, -20]} color="#ff1493" scale={1.2} speed={0.2} />\n      <CrystalToroid position={[-20, 0, 20]} color="#00ffff" scale={1} speed={0.25} />\n      <CrystalToroid position={[0, 0, 0]} color="#ffff00" scale={0.8} speed={0.15} />

      {/* Particles */}
      <Particles />

      {/* Shadows */}
      <ContactShadows position={[0, -25.9, 0]} opacity={0.3} scale={100} blur={2} far={40} />

      {/* Camera - MANUAL CONTROL */}
      <OrbitControls
        makeDefault
        autoRotate={false}
        enablePan={true}
        enableZoom={true}
        enableDamping
        dampingFactor={0.08}
        maxDistance={150}
        minDistance={30}
        maxPolarAngle={Math.PI * 0.95}
        minPolarAngle={Math.PI * 0.05}
        autoRotateSpeed={0}
      />

      <Preload all />
    </>
  );
}

// ============ MAIN COMPONENT ============
export default function Dreamscape() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [60, 40, 60], fov: 45 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: true
        }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <Scene />
      </Canvas>

      {/* Minimal UI */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-6 left-6 z-10 text-white pointer-events-none"
      >
        <h1 className="text-5xl font-black italic tracking-tighter">DREAMSCAPE</h1>
        <p className="text-[10px] opacity-60 tracking-[0.2em] mt-1">Drag to rotate • Scroll to zoom</p>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-6 z-10 text-white/40 text-xs pointer-events-none"
      >
        <p>Hover over spheres for interaction</p>
      </motion.div>
    </div>
  );
}
