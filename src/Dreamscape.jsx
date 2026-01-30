import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Preload } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

/**
 * DREAMSCAPE - Interactive 3D Experience
 * Frutiger Aero aesthetic with physics, particles, and buttery-smooth performance
 */

// ============ INTERACTIVE GLOSSY SPHERE ============
function GlossySphere({ position, color, size = 1, speed = 1 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const t = clock.getElapsedTime() * speed;
    // Gentle bobbing
    meshRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.3;
    // Smooth rotation
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.008;
    
    // Pulse on hover
    if (hovered) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          transmission={0.1}
          thickness={0.5}
          ior={1.5}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0.05}
        />
      </mesh>
      
      {/* Glossy highlight */}
      <mesh position={[0, 0, 0]} scale={1.05}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          transparent
          opacity={hovered ? 0.4 : 0.15}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}

// ============ CRYSTAL RING ============
function CrystalRing({ position, color, scale = 1, speed = 1 }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.5;
    meshRef.current.rotation.y = t * 0.4;
    meshRef.current.rotation.z = Math.cos(t * 0.3) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow>
      <torusGeometry args={[2, 0.3, 16, 100]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.95}
        roughness={0.05}
        transmission={0.3}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// ============ PARTICLE SYSTEM ============
function Particles() {
  const pointsRef = useRef();
  const particlesRef = useRef([]);
  const countRef = useRef(800);

  useMemo(() => {
    const particles = [];
    for (let i = 0; i < countRef.current; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          Math.random() * 20,
          (Math.random() - 0.5) * 30
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
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
          (Math.random() - 0.5) * 30,
          Math.random() * 20,
          (Math.random() - 0.5) * 30
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
        sizes[i] = (particles[i].life / particles[i].maxLife) * 0.15;
      }
      
      pointsRef.current.geometry.attributes.position.array = positions;
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.size.array = sizes;
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  const positions = new Float32Array(countRef.current * 3);
  const sizes = new Float32Array(countRef.current);

  for (let i = 0; i < countRef.current; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    sizes[i] = Math.random() * 0.2;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={countRef.current}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={countRef.current}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ff1493"
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  );
}

// ============ WAVE GROUND ============
function WaveGround() {
  const meshRef = useRef();
  const materialRef = useRef();

  const vertexShader = `
    uniform float time;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave1 = sin((pos.x + time) * 0.5) * 0.8;
      float wave2 = cos((pos.z + time * 0.7) * 0.5) * 0.8;
      pos.y += wave1 + wave2;
      vWave = (wave1 + wave2) * 0.5;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform float time;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vec3 col = uColor;
      col += vec3(sin(time) * 0.1, cos(time * 0.7) * 0.1, 0.1);
      col = mix(col, vec3(1.0), vWave * 0.2);
      gl_FragColor = vec4(col, 0.85);
    }
  `;

  useFrame(() => {
    if (materialRef.current?.uniforms) {
      materialRef.current.uniforms.time.value += 0.016;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
      <planeGeometry args={[60, 60, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
          uColor: { value: new THREE.Color('#ff1493') }
        }}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============ SCENE ============
function Scene() {
  const controlsRef = useRef();

  return (
    <>
      <color attach="background" args={['#0a0a1f']} />
      <fog attach="fog" args={['#0f0f2e', 20, 100]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} color="#ff1493" />
      <directionalLight
        position={[20, 30, 20]}
        intensity={1.2}
        color="#ff69b4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-20, 10, -20]} intensity={0.6} color="#00ffff" />

      {/* Stars background */}
      <Stars radius={200} depth={50} count={2000} factor={4} saturation={0.3} />

      {/* Main elements */}
      <GlossySphere position={[10, 8, 0]} color="#ff1493" size={2.5} speed={0.5} />
      <GlossySphere position={[-10, 6, 5]} color="#00ffff" size={2} speed={0.7} />
      <GlossySphere position={[0, 10, -12]} color="#ffff00" size={1.5} speed={0.6} />

      {/* Crystal rings */}
      <CrystalRing position={[8, -2, -8]} color="#00ff00" scale={1.2} speed={0.3} />
      <CrystalRing position={[-8, 0, 8]} color="#ff00ff" scale={1} speed={0.4} />
      <CrystalRing position={[0, 5, 0]} color="#00ffff" scale={0.8} speed={0.5} />

      {/* Particles */}
      <Particles />

      {/* Ground */}
      <WaveGround />

      {/* Shadows */}
      <ContactShadows
        position={[0, -14.9, 0]}
        opacity={0.4}
        scale={60}
        blur={3}
        far={20}
      />

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        autoRotate
        autoRotateSpeed={2}
        enablePan={true}
        enableZoom={true}
        enableDamping
        dampingFactor={0.05}
        maxDistance={80}
        minDistance={20}
        maxPolarAngle={Math.PI * 0.9}
      />

      <Preload all />
    </>
  );
}

// ============ MAIN COMPONENT ============
export default function Dreamscape() {
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        shadows
        camera={{ position: [40, 30, 40], fov: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <Scene />
      </Canvas>

      {/* UI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 left-8 z-10 text-white"
      >
        <h1 className="text-5xl md:text-6xl font-black italic tracking-tight">DREAMSCAPE</h1>
        <p className="text-xs opacity-50 mt-2 tracking-widest">Digital Grace Manifest</p>
      </motion.div>

      {/* Back button */}
      <motion.a
        href="/"
        whileHover={{ scale: 1.05 }}
        className="absolute bottom-8 right-8 z-10 px-6 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-full text-white text-sm font-bold hover:bg-white/30 transition-all"
      >
        ← Back
      </motion.a>
    </div>
  );
}
