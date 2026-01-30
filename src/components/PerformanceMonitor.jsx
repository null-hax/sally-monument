import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Real-time Performance Monitoring for Dreamscape
 * Tracks FPS, memory, and adjusts quality dynamically on mobile
 */

export function usePerformanceMonitor() {
  const statsRef = useRef({
    fps: 0,
    frameCount: 0,
    lastTime: Date.now(),
    avgFrameTime: 0,
    memory: 0
  });

  const [stats, setStats] = useState({
    fps: 0,
    frameTime: 0,
    memory: 0,
    quality: 'high'
  });

  useFrame(({ gl, camera }) => {
    const now = Date.now();
    statsRef.current.frameCount++;

    // Update FPS every second
    if (now - statsRef.current.lastTime >= 1000) {
      setStats({
        fps: statsRef.current.frameCount,
        frameTime: (1000 / statsRef.current.frameCount).toFixed(2),
        memory: navigator.deviceMemory || 'N/A',
        quality: statsRef.current.frameCount > 55 ? 'high' : statsRef.current.frameCount > 30 ? 'medium' : 'low'
      });

      statsRef.current.frameCount = 0;
      statsRef.current.lastTime = now;
    }
  });

  return stats;
}

/**
 * Visual Performance Display Component
 */
export function PerformanceDisplay({ visible = true }) {
  const stats = usePerformanceMonitor();

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 text-white text-xs font-mono bg-black/40 backdrop-blur p-3 rounded border border-white/20">
      <div>FPS: <span className={stats.fps > 55 ? 'text-green-400' : stats.fps > 30 ? 'text-yellow-400' : 'text-red-400'}>{stats.fps}</span></div>
      <div>Frame: {stats.frameTime}ms</div>
      <div>Quality: <span className={stats.quality === 'high' ? 'text-green-400' : stats.quality === 'medium' ? 'text-yellow-400' : 'text-red-400'}>{stats.quality}</span></div>
      {stats.memory !== 'N/A' && <div>Memory: {stats.memory}GB</div>}
    </div>
  );
}

/**
 * Adaptive Quality System
 * Automatically adjusts scene complexity based on performance
 */
export class AdaptiveQuality {
  constructor() {
    this.targetFps = 60;
    this.currentQuality = 1.0;
    this.frameHistory = [];
    this.maxFrameHistory = 60;
    this.qualityLevels = {
      high: {
        particleCount: 1000,
        shadowsEnabled: true,
        reflectionsEnabled: true,
        antialiasing: true,
        dpr: 1.5
      },
      medium: {
        particleCount: 500,
        shadowsEnabled: true,
        reflectionsEnabled: false,
        antialiasing: true,
        dpr: 1.0
      },
      low: {
        particleCount: 250,
        shadowsEnabled: false,
        reflectionsEnabled: false,
        antialiasing: false,
        dpr: 0.75
      }
    };
  }

  recordFrameTime(frameTime) {
    this.frameHistory.push(frameTime);
    if (this.frameHistory.length > this.maxFrameHistory) {
      this.frameHistory.shift();
    }
  }

  getAverageFrameTime() {
    if (this.frameHistory.length === 0) return 0;
    return this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
  }

  getQualityLevel() {
    const avgTime = this.getAverageFrameTime();
    const targetFrameTime = 1000 / this.targetFps;

    if (avgTime < targetFrameTime * 0.8) {
      return 'high';
    } else if (avgTime < targetFrameTime) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getQualitySettings() {
    return this.qualityLevels[this.getQualityLevel()];
  }
}

/**
 * Mobile Performance Optimizations
 */
export const MobileOptimizations = {
  // Reduce geometry complexity
  reduceGeometry: (geometry, factor = 0.5) => {
    if (geometry.attributes.position) {
      const positions = geometry.attributes.position.array;
      const newLength = Math.floor(positions.length * factor);
      const newPositions = new Float32Array(newLength);
      
      for (let i = 0; i < newLength; i++) {
        newPositions[i] = positions[i];
      }
      
      geometry.attributes.position = new THREE.BufferAttribute(newPositions, 3);
    }
    return geometry;
  },

  // Use simpler shaders
  useSimpleShader: (color = '#ff1493') => {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: false
    });
  },

  // Disable expensive features
  disableExpensiveEffects: (renderer) => {
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = false;
  },

  // Optimize lighting
  optimizeLighting: () => {
    return {
      ambientLight: 0.6,
      directionalLight: 0.8,
      pointLights: 0 // Disable point lights on mobile
    };
  },

  // Limit draw calls
  batchGeometry: (meshes) => {
    const geometries = meshes.map(m => m.geometry);
    const materials = meshes.map(m => m.material);
    
    // Merge geometries if possible
    const mergedGeometry = THREE.BufferGeometryUtils?.mergeGeometries
      ? THREE.BufferGeometryUtils.mergeGeometries(geometries)
      : geometries[0];

    return { geometry: mergedGeometry, materials };
  }
};

/**
 * Frame Rate Monitor Hook
 */
export function useFrameRateMonitor(targetFps = 60) {
  const frameCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const [currentFps, setCurrentFps] = useState(0);
  const [targetMet, setTargetMet] = useState(false);

  useFrame(() => {
    frameCountRef.current++;

    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed >= 1000) {
      const fps = (frameCountRef.current * 1000) / elapsed;
      setCurrentFps(Math.round(fps));
      setTargetMet(fps >= targetFps * 0.9); // 90% of target
      
      frameCountRef.current = 0;
      startTimeRef.current = Date.now();
    }
  });

  return { fps: currentFps, targetMet };
}

/**
 * Throttled Animation Loop for Battery Efficiency
 */
export class ThrottledAnimationLoop {
  constructor(targetFps = 30) {
    this.targetFps = targetFps;
    this.frameInterval = 1000 / targetFps;
    this.lastFrameTime = 0;
  }

  shouldUpdate(currentTime) {
    if (currentTime - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = currentTime;
      return true;
    }
    return false;
  }

  update(deltaTime) {
    return deltaTime * (this.targetFps / 60); // Normalize to 60fps
  }
}

/**
 * Memory-aware particle system
 */
export class MemoryAwareParticles {
  constructor(maxParticles = 500) {
    this.maxParticles = maxParticles;
    this.particles = new Float32Array(maxParticles * 3);
    this.velocities = new Float32Array(maxParticles * 3);
    this.lives = new Float32Array(maxParticles);
    this.particleCount = 0;
  }

  emit(position, velocity, life = 1) {
    if (this.particleCount < this.maxParticles) {
      const idx = this.particleCount * 3;
      this.particles[idx] = position.x;
      this.particles[idx + 1] = position.y;
      this.particles[idx + 2] = position.z;

      this.velocities[idx] = velocity.x;
      this.velocities[idx + 1] = velocity.y;
      this.velocities[idx + 2] = velocity.z;

      this.lives[this.particleCount] = life;
      this.particleCount++;
    }
  }

  update(deltaTime) {
    let alive = 0;
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      
      // Update position
      this.particles[idx] += this.velocities[idx] * deltaTime;
      this.particles[idx + 1] += this.velocities[idx + 1] * deltaTime;
      this.particles[idx + 2] += this.velocities[idx + 2] * deltaTime;

      // Apply gravity
      this.velocities[idx + 1] -= 9.8 * deltaTime * 0.1;

      // Update life
      this.lives[i] -= deltaTime;

      if (this.lives[i] > 0) {
        alive++;
      }
    }

    return alive;
  }

  getParticleData() {
    return {
      positions: this.particles.slice(0, this.particleCount * 3),
      count: this.particleCount
    };
  }
}

/**
 * GPU Memory Helper
 */
export function useGPUMemoryInfo() {
  const gl = useThree((state) => state.gl);
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    if (gl.capabilities.isWebGL2) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        setMemoryInfo({
          vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
        });
      }
    }
  }, [gl]);

  return memoryInfo;
}
