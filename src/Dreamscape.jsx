import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import * as THREE from 'three';

/**
 * DREAMSCAPE - Frutiger Aero Masterpiece
 * Iridescent, alive, responsive, BEAUTIFUL
 */

// ============ IRIDESCENT MATERIAL ============
const IridescentMaterial = ({ color }) => {
  const shaderRef = useRef();

  const vertexShader = `
    uniform float time;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vHeight;

    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vHeight = sin(position.x * 2.0) * cos(position.y * 2.0) * 0.5 + 0.5;
      
      vec3 pos = position;
      pos.x += sin(time + position.y) * 0.1;
      pos.y += cos(time + position.x) * 0.1;
      pos.z += sin(time * 0.7 + position.z) * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 uColor;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vHeight;

    void main() {
      vec3 view = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, view)), 3.0);
      
      vec3 rainbow = vec3(
        sin(time + vHeight * 3.14159) * 0.5 + 0.5,
        sin(time + vHeight * 3.14159 + 2.09) * 0.5 + 0.5,
        sin(time + vHeight * 3.14159 + 4.19) * 0.5 + 0.5
      );
      
      vec3 color = mix(uColor, rainbow, fresnel * 0.6);
      color += vec3(1.0) * fresnel * 0.3;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  useFrame(() => {
    if (shaderRef.current?.uniforms) {
      shaderRef.current.uniforms.time.value += 0.016;
    }
  });

  return (
    <shaderMaterial
      ref={shaderRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        time: { value: 0 },
        uColor: { value: new THREE.Color(color) }
      }}
    />
  );
};

// ============ ORBING PARTICLE SYSTEM ============
function OrbitingParticles() {
  const pointsRef = useRef();
  const particlesRef = useRef([]);
  const COUNT = 2000;

  useMemo(() => {
    const particles = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 40;
      const height = (Math.random() - 0.5) * 60;
      
      particles.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        angle: angle,
        radius: radius,
        height: height,
        speed: 0.3 + Math.random() * 0.7,
        life: Math.random() * 100,
        maxLife: 100,
        hue: Math.random()
      });
    }
    particlesRef.current = particles;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5;
    const particles = particlesRef.current;
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.angle += p.speed * 0.01;
      p.radius += Math.sin(t + i) * 0.05;
      p.radius = Math.max(8, Math.min(50, p.radius));
      p.height += Math.cos(t + i) * 0.1;
      
      p.position.x = Math.cos(p.angle) * p.radius;
      p.position.y = p.height;
      p.position.z = Math.sin(p.angle) * p.radius;
      
      p.life--;
      if (p.life <= 0) {
        p.life = 100;
        p.radius = 10 + Math.random() * 40;
      }
    }

    if (pointsRef.current) {
      const positions = new Float32Array(particles.length * 3);
      const colors = new Float32Array(particles.length * 3);
      const sizes = new Float32Array(particles.length);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;
        
        // Vibrant cycling colors: pink, cyan, yellow, magenta
        const hue = (p.hue + clock.getElapsedTime() * 0.1) % 1;
        let r, g, b;
        if (hue < 0.25) {
          r = 1; g = hue * 4; b = 0; // pink to yellow
        } else if (hue < 0.5) {
          r = 1 - (hue - 0.25) * 4; g = 1; b = 0; // yellow to green
        } else if (hue < 0.75) {
          r = 0; g = 1 - (hue - 0.5) * 4; b = 1; // cyan to blue
        } else {
          r = (hue - 0.75) * 4; g = 0; b = 1; // blue to magenta
        }
        
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
        
        sizes[i] = (p.life / p.maxLife) * 0.4 + 0.1;
      }
      
      pointsRef.current.geometry.attributes.position.array = positions;
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.array = colors;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
      pointsRef.current.geometry.attributes.size.array = sizes;
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 40;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    
    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
    sizes[i] = Math.random() * 0.3 + 0.1;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={COUNT} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.25} sizeAttenuation transparent opacity={0.9} vertexColors />
    </points>
  );
}

// ============ MORPHING SPHERE ============
function MorphingSphere({ position, color, scale = 1 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.3;
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.z = Math.cos(t * 0.25) * 0.2;
    
    const pulse = Math.sin(t * 2) * 0.1 + 1;
    meshRef.current.scale.set(
      scale * pulse * (hovered ? 1.3 : 1),
      scale * pulse * (hovered ? 1.3 : 1),
      scale * pulse * (hovered ? 1.3 : 1)
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      castShadow
    >
      <icosahedronGeometry args={[1, 6]} />
      <IridescentMaterial color={color} />
    </mesh>
  );
}

// ============ SCENE ============
function Scene() {
  return (
    <>
      <color attach="background" args={['#f5b8e6']} />
      <fog attach="fog" args={['#f5b8e6', 20, 200]} />

      {/* Lighting */}
      <ambientLight intensity={1.2} color="#ffb3f0" />
      <directionalLight
        position={[50, 50, 50]}
        intensity={2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
      />
      <pointLight position={[-50, 30, 30]} intensity={1.5} color="#ff00ff" />
      <pointLight position={[30, 30, -50]} intensity={1.5} color="#00ffff" />

      {/* Morphing spheres */}
      <MorphingSphere position={[-30, 15, 20]} color="#ff1493" scale={2} />
      <MorphingSphere position={[30, 10, 0]} color="#00ffff" scale={2.5} />
      <MorphingSphere position={[0, 25, -30]} color="#ff00ff" scale={2} />
      <MorphingSphere position={[-15, 5, -20]} color="#00ff88" scale={1.8} />
      <MorphingSphere position={[20, 20, 25]} color="#ffff00" scale={1.5} />

      {/* Orbiting particles - the showcase */}
      <OrbitingParticles />

      {/* Camera */}
      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={1.5}
        enablePan={true}
        enableZoom={true}
        enableDamping
        dampingFactor={0.1}
        maxDistance={150}
        minDistance={40}
      />

      <Preload all />
    </>
  );
}

// ============ MAIN ============
export default function Dreamscape() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [80, 50, 80], fov: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <Scene />
      </Canvas>

      {/* Minimal, elegant UI */}
      <div className="absolute top-8 left-8 z-10 text-white pointer-events-none">
        <h1 className="text-6xl font-black italic tracking-tighter drop-shadow-lg">DREAMSCAPE</h1>
        <p className="text-xs opacity-70 tracking-widest mt-2">Interactive • Alive • Beautiful</p>
      </div>
    </div>
  );
}
