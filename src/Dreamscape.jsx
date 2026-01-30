'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stars, 
  ContactShadows,
  useGLTF,
  Sphere,
  Box,
  Torus,
  Float,
  Text3D,
  Center,
  Text
} from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useMediaQuery } from 'react-responsive';

// ============ PHYSICS SETUP ============
// Using Cannon-es for lightweight physics without extra dependencies
class SimplePhysicsWorld {
  constructor() {
    this.bodies = [];
    this.gravity = new THREE.Vector3(0, -9.8, 0);
  }

  addBody(mesh, mass = 1, shape = 'sphere') {
    const body = {
      mesh,
      mass,
      velocity: new THREE.Vector3(),
      acceleration: new THREE.Vector3(),
      shape,
      radius: mesh.geometry?.parameters?.radius || 0.5,
      restitution: 0.6,
      damping: 0.01
    };
    this.bodies.push(body);
    return body;
  }

  step(dt = 0.016) {
    // Simple Euler physics integration
    for (let body of this.bodies) {
      if (body.mass === 0) continue; // Static

      // Apply gravity
      body.acceleration.copy(this.gravity);

      // Update velocity with damping
      body.velocity.addScaledVector(body.acceleration, dt);
      body.velocity.multiplyScalar(1 - body.damping);

      // Update position
      body.mesh.position.addScaledVector(body.velocity, dt);

      // Boundary collisions (simple AABB)
      const bounds = 15;
      if (body.mesh.position.x > bounds) {
        body.mesh.position.x = bounds;
        body.velocity.x *= -body.restitution;
      }
      if (body.mesh.position.x < -bounds) {
        body.mesh.position.x = -bounds;
        body.velocity.x *= -body.restitution;
      }
      if (body.mesh.position.z > bounds) {
        body.mesh.position.z = bounds;
        body.velocity.z *= -body.restitution;
      }
      if (body.mesh.position.z < -bounds) {
        body.mesh.position.z = -bounds;
        body.velocity.z *= -body.restitution;
      }

      // Ground collision
      if (body.mesh.position.y - body.radius < -8) {
        body.mesh.position.y = -8 + body.radius;
        body.velocity.y *= -body.restitution;
      }
    }

    // Simple sphere-sphere collisions
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const b1 = this.bodies[i];
        const b2 = this.bodies[j];
        const dx = b2.mesh.position.x - b1.mesh.position.x;
        const dy = b2.mesh.position.y - b1.mesh.position.y;
        const dz = b2.mesh.position.z - b1.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;
          const overlap = minDist - dist;

          b1.mesh.position.addScaledVector(new THREE.Vector3(nx, ny, nz), -overlap / 2);
          b2.mesh.position.addScaledVector(new THREE.Vector3(nx, ny, nz), overlap / 2);

          const rel = new THREE.Vector3()
            .subVectors(b2.velocity, b1.velocity);
          const relNormal = rel.dot(new THREE.Vector3(nx, ny, nz));

          if (relNormal < 0) {
            const restitution = (b1.restitution + b2.restitution) / 2;
            const impulse = -(1 + restitution) * relNormal / (b1.mass + b2.mass);

            b1.velocity.addScaledVector(new THREE.Vector3(nx, ny, nz), -impulse * b2.mass);
            b2.velocity.addScaledVector(new THREE.Vector3(nx, ny, nz), impulse * b1.mass);
          }
        }
      }
    }
  }
}

// ============ FRUTIGER AERO COMPONENTS ============

// Glossy sphere with metallic sheen
function GlossySphere({ position, color, size, interactive }) {
  const meshRef = useRef();
  const worldRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame(() => {
    if (interactive && meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={isHovered ? color : '#000000'}
        emissiveIntensity={isHovered ? 0.3 : 0}
      />
      
      {/* Highlight for glossy effect */}
      <mesh scale={1.05}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          transparent
          opacity={0.3}
          color="#ffffff"
        />
      </mesh>
    </mesh>
  );
}

// Crystalline form with fractal geometry
function CrystalLine({ start, end, color }) {
  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  );
}

// Liquid surface effect with waves
function LiquidSurface({ position }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const timeRef = useRef(0);

  useFrame(() => {
    timeRef.current += 0.01;
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(timeRef.current) * 0.2;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = timeRef.current;
    }
  });

  const vertexShader = `
    uniform float time;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.y += sin(pos.x * 3.0 + time) * 0.1;
      pos.y += cos(pos.z * 3.0 + time * 0.7) * 0.1;
      vWave = sin(pos.x * 2.0 + time) * cos(pos.z * 2.0 + time * 0.8);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vec3 color = mix(uColor, vec3(1.0), vWave * 0.2);
      gl_FragColor = vec4(color, 0.8);
    }
  `;

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 64, 64]} />
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

// Interactive particle system
function ParticleSystem({ position, count = 500 }) {
  const pointsRef = useRef();
  const particlesRef = useRef([]);
  const timeRef = useRef(0);

  useMemo(() => {
    // Initialize particles
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          Math.random() * 4,
          (Math.random() - 0.5) * 8
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 2,
          (Math.random() - 0.5) * 2
        ),
        life: Math.random() * 100 + 50
      });
    }
    particlesRef.current = particles;
  }, [count]);

  useFrame(() => {
    timeRef.current += 0.016;
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.position.add(p.velocity);
      p.life -= 1;
      if (p.life <= 0) {
        p.position.set(
          (Math.random() - 0.5) * 8,
          Math.random() * 4,
          (Math.random() - 0.5) * 8
        );
        p.life = 100;
      }
    }

    if (pointsRef.current) {
      const positions = new Float32Array(particles.length * 3);
      for (let i = 0; i < particles.length; i++) {
        positions[i * 3] = particles[i].position.x;
        positions[i * 3 + 1] = particles[i].position.y;
        positions[i * 3 + 2] = particles[i].position.z;
      }
      pointsRef.current.geometry.attributes.position.array = positions;
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = Math.random() * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ff69b4" sizeAttenuation />
    </points>
  );
}

// Physics-driven interactive sphere
function PhysicsSphere({ position, color, size = 0.8 }) {
  const meshRef = useRef();
  const bodyRef = useRef();
  const [physics] = useState(() => new SimplePhysicsWorld());

  useEffect(() => {
    if (meshRef.current) {
      bodyRef.current = physics.addBody(meshRef.current, 1, 'sphere');
      bodyRef.current.velocity.set(
        (Math.random() - 0.5) * 5,
        Math.random() * 2,
        (Math.random() - 0.5) * 5
      );
    }
  }, [physics]);

  useFrame(() => {
    physics.step();
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial 
        color={color}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

// ============ SCENE COMPONENTS ============

function AnimatedBackground() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <>
      <color attach="background" args={['#0a0e27']} />
      <fog attach="fog" args={['#1a0f35', 10, isMobile ? 40 : 80]} />
    </>
  );
}

function Lighting({ isMobile }) {
  return (
    <>
      <ambientLight intensity={0.5} color="#ff1493" />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1} 
        color="#ff69b4"
        castShadow={!isMobile}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00ffff" />
    </>
  );
}

function Scene() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [interactive, setInteractive] = useState(true);

  return (
    <>
      <AnimatedBackground />
      <Lighting isMobile={isMobile} />

      {/* Starfield */}
      {!isMobile && <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />}

      {/* Frutiger Aero Elements */}
      <GlossySphere position={[5, 4, 0]} color="#ff1493" size={1.5} interactive />
      <GlossySphere position={[-5, 3, 2]} color="#00ffff" size={1.2} interactive />
      <GlossySphere position={[0, 6, -8]} color="#ffff00" size={0.8} interactive />

      {/* Crystal lines */}
      <CrystalLine start={[0, 0, 0]} end={[5, 5, 5]} color="#00ff00" />
      <CrystalLine start={[0, 0, 0]} end={[-5, 3, -5]} color="#ff00ff" />
      <CrystalLine start={[0, 0, 0]} end={[3, -2, 6]} color="#00ffff" />

      {/* Liquid surface */}
      <LiquidSurface position={[0, -8, 0]} />

      {/* Particle effects */}
      <ParticleSystem position={[0, 2, 0]} count={isMobile ? 250 : 500} />

      {/* Physics objects */}
      {[...Array(5)].map((_, i) => (
        <PhysicsSphere
          key={`phys-${i}`}
          position={[
            (Math.random() - 0.5) * 12,
            8 + i * 2,
            (Math.random() - 0.5) * 12
          ]}
          color={['#ff1493', '#00ffff', '#ffff00', '#00ff00', '#ff69b4'][i]}
          size={0.6 + Math.random() * 0.4}
        />
      ))}

      {/* Contact shadows */}
      <ContactShadows 
        position={[0, -7.99, 0]} 
        opacity={isMobile ? 0.15 : 0.4} 
        scale={isMobile ? 20 : 40}
        blur={isMobile ? 1.5 : 4} 
        far={isMobile ? 4 : 8}
      />

      {/* OrbitControls */}
      <OrbitControls 
        makeDefault 
        autoRotate={!isMobile}
        autoRotateSpeed={0.3}
        enablePan={!isMobile}
        maxPolarAngle={Math.PI / 1.5}
        minDistance={isMobile ? 15 : 10}
        maxDistance={isMobile ? 25 : 40}
        enableZoom={!isMobile}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

// ============ MAIN COMPONENT ============

export default function Dreamscape() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a0f35] to-[#0f0a1e] relative overflow-hidden">
      {/* Canvas */}
      <Canvas
        shadows={!isMobile}
        camera={{ position: [15, 12, 20], fov: isMobile ? 55 : 45 }}
        dpr={isMobile ? [0.75, 1] : [1, 1.5]}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? "low-power" : "default",
          depth: true,
          stencil: false,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false
        }}
        frameloop="demand"
        onCreated={({ gl }) => {
          if (isMobile) {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          }
        }}
      >
        <Scene />
      </Canvas>

      {/* UI Overlay */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-8 z-10 text-white"
      >
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tight">
          DREAMSCAPE
        </h1>
        <p className="text-xs md:text-sm opacity-60 mt-2">Physics-driven interactive experience</p>
      </motion.div>

      {/* Mobile Instructions */}
      {isMobile && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-8 left-8 right-8 z-10 text-white text-xs opacity-40 text-center"
        >
          Touch and drag to rotate • Pinch to zoom
        </motion.div>
      )}

      {/* Back Button */}
      <motion.a
        href="/"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-8 right-8 z-10 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/40 rounded-full text-white text-sm font-bold hover:bg-white/30 transition-all"
      >
        ← Back
      </motion.a>
    </div>
  );
}
