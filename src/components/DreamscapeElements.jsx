import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Advanced Frutiger Aero Components for Dreamscape
 * High-performance, visually stunning elements with physics and interactivity
 */

// ============ ADVANCED SHADER MATERIALS ============

export const createIridescentMaterial = () => {
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec3 normal = normalize(vNormal);
      float iridescence = sin(vPosition.x * 2.0 + time) * 0.5 + 0.5;
      iridescence *= cos(vPosition.y * 2.0 + time * 0.7) * 0.5 + 0.5;
      
      vec3 color1 = vec3(1.0, 0.0, 1.0);
      vec3 color2 = vec3(0.0, 1.0, 1.0);
      vec3 color3 = vec3(1.0, 1.0, 0.0);
      
      vec3 finalColor = mix(color1, color2, iridescence);
      finalColor = mix(finalColor, color3, sin(time * 0.5) * 0.5 + 0.5);
      
      gl_FragColor = vec4(finalColor, 0.9);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 }
    },
    transparent: true,
    wireframe: false
  });
};

export const createGlassyMaterial = (color) => {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.8,
    thickness: 1,
    ior: 1.5,
    envMapIntensity: 1.2,
    clearcoatNormalScale: new THREE.Vector2(1, 1),
    emissive: color,
    emissiveIntensity: 0.2
  });
};

// ============ INTERACTIVE ELEMENTS ============

/**
 * Responsive Bubble - animated, interactive, physics-aware
 */
export function ResponsiveBubble({ 
  position = [0, 0, 0], 
  color = '#ff1493',
  size = 1,
  interactive = true,
  onHover = () => {}
}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();

    // Floating animation
    meshRef.current.position.y += Math.sin(t + position[0]) * 0.002;

    // Rotation
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.z += 0.001;

    // Interactive hover effect
    if (interactive) {
      const targetScale = hovered ? 1.15 : 1;
      scaleRef.current += (targetScale - scaleRef.current) * 0.1;
      meshRef.current.scale.set(
        scaleRef.current * size,
        scaleRef.current * size,
        scaleRef.current * size
      );
    }

    // Update material if iridescent
    if (materialRef.current?.uniforms?.time) {
      materialRef.current.uniforms.time.value = t;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => {
        setHovered(true);
        onHover(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
        onHover(false);
      }}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        metalness={0.85}
        roughness={0.15}
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={hovered ? 0.5 : 0.1}
      />
      
      {/* Glossy highlight layer */}
      <mesh scale={1.08}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          transparent
          opacity={hovered ? 0.5 : 0.2}
          color="#ffffff"
        />
      </mesh>
    </mesh>
  );
}

/**
 * Crystal Prism - geometric beauty
 */
export function CrystalPrism({ 
  position = [0, 0, 0], 
  color = '#00ffff',
  scale = 1,
  animated = true
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current || !animated) return;
    
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    meshRef.current.rotation.y = t * 0.3;
    meshRef.current.rotation.z = Math.cos(t * 0.4) * 0.2;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      {/* Octahedron prism */}
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.7}
        roughness={0.2}
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={hovered ? 0.4 : 0.05}
        transmission={0.5}
        thickness={0.5}
        ior={1.5}
      />
    </mesh>
  );
}

/**
 * Toroidal Ring - elegant 3D form
 */
export function ToroidalRing({ 
  position = [0, 0, 0],
  color = '#ffff00',
  tubeRadius = 0.2,
  majorRadius = 1.5,
  spinning = true
}) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current || !spinning) return;
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.015;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
    >
      <torusGeometry args={[majorRadius, tubeRadius, 16, 32]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

/**
 * Wave Distortion Field - dynamic, reactive
 */
export function WaveField({ 
  position = [0, 0, 0],
  color = '#ff69b4',
  scale = 2
}) {
  const meshRef = useRef();
  const materialRef = useRef();

  const vertexShader = `
    uniform float time;
    uniform float waveAmplitude;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      float wave1 = sin(pos.x * 5.0 + time) * waveAmplitude;
      float wave2 = cos(pos.z * 5.0 + time * 0.7) * waveAmplitude;
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
      vec3 color = uColor;
      color += vec3(sin(time) * 0.2, cos(time * 0.7) * 0.2, 0.0);
      color = mix(color, vec3(1.0), vWave * 0.3);
      gl_FragColor = vec4(color, 0.7);
    }
  `;

  useFrame(({ clock }) => {
    if (materialRef.current?.uniforms) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={scale}
      receiveShadow
    >
      <planeGeometry args={[4, 4, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
          waveAmplitude: { value: 0.15 },
          uColor: { value: new THREE.Color(color) }
        }}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Light Streaks - energy trails
 */
export function LightStreaks({ 
  position = [0, 0, 0],
  direction = [0, 1, 0],
  color = '#ff1493',
  length = 5
}) {
  const groupRef = useRef();
  const linesRef = useRef([]);

  useMemo(() => {
    // Create multiple streak lines
    const streaks = [];
    for (let i = 0; i < 3; i++) {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          direction[0] * length,
          direction[1] * length + i * 0.2,
          direction[2] * length
        )
      ];
      streaks.push(points);
    }
    linesRef.current = streaks;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((line, i) => {
      if (line.material) {
        line.material.opacity = Math.sin(t + i) * 0.5 + 0.5;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {linesRef.current.map((points, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial 
              color={color}
              linewidth={2}
              transparent
              opacity={0.7}
            />
          </line>
        );
      })}
    </group>
  );
}

/**
 * Advanced Particle Emitter - high-quality effects
 */
export function ParticleEmitter({ 
  position = [0, 0, 0],
  color = '#ff1493',
  count = 1000,
  emissionRate = 10,
  particleLife = 2
}) {
  const pointsRef = useRef();
  const particlesRef = useRef([]);
  const timeRef = useRef(0);

  useMemo(() => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 6,
          (Math.random() - 0.5) * 4
        ),
        life: Math.random() * particleLife,
        maxLife: particleLife,
        size: Math.random() * 0.3 + 0.1
      });
    }
    particlesRef.current = particles;
  }, [count, particleLife]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life -= delta;
      
      if (p.life <= 0) {
        p.position.set(0, 0, 0);
        p.velocity.set(
          (Math.random() - 0.5) * 4,
          Math.random() * 6,
          (Math.random() - 0.5) * 4
        );
        p.life = particleLife;
      } else {
        p.position.addScaledVector(p.velocity, delta);
        p.velocity.y -= 9.8 * delta * 0.1; // Gravity
      }
    }

    if (pointsRef.current) {
      const positions = new Float32Array(particles.length * 3);
      const sizes = new Float32Array(particles.length);
      
      for (let i = 0; i < particles.length; i++) {
        positions[i * 3] = particles[i].position.x;
        positions[i * 3 + 1] = particles[i].position.y;
        positions[i * 3 + 2] = particles[i].position.z;
        sizes[i] = (particles[i].life / particles[i].maxLife) * particles[i].size;
      }
      
      pointsRef.current.geometry.attributes.position.array = positions;
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.size.array = sizes;
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15}
        color={color}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}

/**
 * Geometric Morph - shape-shifting element
 */
export function GeometricMorph({ 
  position = [0, 0, 0],
  color = '#00ffff',
  scale = 1
}) {
  const meshRef = useRef();
  const morphRef = useRef(0);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const t = clock.getElapsedTime() * 0.5;
    morphRef.current = (Math.sin(t) + 1) * 0.5;
    
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.rotation.z = t * 0.2;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        emissive={color}
        emissiveIntensity={0.3}
        wireframe={false}
      />
    </mesh>
  );
}
