import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HelixGeometry } from './HelixGeometry';
import { LowPolyHabits } from './LowPolyHabits';
import { ThreeEmbers } from './ThreeEmbers';

interface LongevityCanvasProps {
  scrollProgress: number; // 0 to 1
  isMobile: boolean;
  dpr: number;
  enableParallax: boolean;
}

// Internal scene controller managing camera positioning, parallax, and fog
const SceneController: React.FC<{
  scrollProgress: number;
  isMobile: boolean;
  enableParallax: boolean;
}> = ({ scrollProgress, isMobile, enableParallax }) => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const targetCamPos = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!enableParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized device coordinates [-1, 1]
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableParallax]);

  useFrame(() => {
    // Desktop: helix positioned slightly to the right (x ~ 2.4); mobile: centered (x ~ 0)
    const baseOffsetX = isMobile ? 0 : 2.5;

    // Camera moves smoothly along vertical path with scroll progress
    // At scrollProgress 0 -> y: 2.0; at scrollProgress 1.0 (converged ring) -> y: 0
    const scrollY = THREE.MathUtils.lerp(3.5, 0, scrollProgress);

    // Parallax camera offsets (gentle, desktop only)
    const parallaxX = enableParallax ? mouse.current.x * 0.6 : 0;
    const parallaxY = enableParallax ? mouse.current.y * 0.4 : 0;

    targetCamPos.current.set(
      baseOffsetX + parallaxX,
      scrollY + parallaxY,
      isMobile ? 12 : 10
    );

    camera.position.lerp(targetCamPos.current, 0.05);
    camera.lookAt(baseOffsetX * 0.7, scrollY * 0.7, 0);
  });

  return null;
};

export const LongevityCanvas: React.FC<LongevityCanvasProps> = ({
  scrollProgress,
  isMobile,
  dpr,
  enableParallax,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);

  // Tab visibility management (pause rendering when tab hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // IntersectionObserver to pause rendering when offscreen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const shouldRenderAlways = isVisible && isTabActive;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [isMobile ? 0 : 2.5, 2, isMobile ? 12 : 10], fov: 48 }}
        dpr={dpr}
        frameloop={shouldRenderAlways ? 'always' : 'demand'}
        gl={{
          powerPreference: 'high-performance',
          antialias: !isMobile,
          alpha: true,
          stencil: false,
          depth: true,
        }}
        onCreated={({ scene, gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          // Scene fog fading into background #0F0B09
          scene.fog = new THREE.FogExp2('#0F0B09', isMobile ? 0.055 : 0.045);
        }}
      >
        <SceneController
          scrollProgress={scrollProgress}
          isMobile={isMobile}
          enableParallax={enableParallax}
        />

        {/* Lighting setup */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.8}
          color="#FFF4EC"
        />
        <pointLight
          position={[-4, 0, 3]}
          intensity={0.9}
          color="#FF6B1A"
          distance={15}
        />
        <pointLight
          position={[4, -2, 3]}
          intensity={0.7}
          color="#22C55E"
          distance={15}
        />

        {/* 3D Double Helix Geometry */}
        <HelixGeometry
          scrollProgress={scrollProgress}
          isMobile={isMobile}
        />

        {/* Orbiting Low-Poly Habit Primitives */}
        <LowPolyHabits isMobile={isMobile} />

        {/* Embers System replacing 2D canvas */}
        <ThreeEmbers isMobile={isMobile} />
      </Canvas>
    </div>
  );
};

export default LongevityCanvas;
