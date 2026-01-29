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
          preserveDrawingBuffer: false
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