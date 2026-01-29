      <Canvas
        shadows={false} // Never shadows on mobile for performance
        camera={{ position: [5, 5, 15], fov: isMobile ? 60 : 45 }}
        dpr={isMobile ? [0.75, 1] : [1, 1.5]} // Lower DPR on mobile
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
        />

        <OrbitControls 
          makeDefault 
          autoRotate={!isMobile} // No auto-rotate on mobile
          autoRotateSpeed={0.3} 
          enablePan={!isMobile} // Disable on mobile to prevent conflicts
          maxPolarAngle={Math.PI / 1.8} 
          minDistance={isMobile ? 12 : 8} 
          maxDistance={isMobile ? 20 : 30} 
          enableZoom={false} // Disable zoom on mobile entirely for simplicity
          enableDamping={!isMobile} // Performance optimization
          dampingFactor={0.05}
        />
      </Canvas>