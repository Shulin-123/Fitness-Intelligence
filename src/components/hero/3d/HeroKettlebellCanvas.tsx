import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

interface HeroKettlebellProps {
  enableParallax: boolean;
  isMobile: boolean;
}

const ProceduralKettlebell: React.FC<{ enableParallax: boolean }> = ({ enableParallax }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const targetCam = useRef(new THREE.Vector3(2.0, 0.2, 5.5));

  useEffect(() => {
    if (!enableParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableParallax]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // 30s full rotation cycle (2 * PI / 30)
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.2094;
      // Gentle subtle breathing bob
      groupRef.current.position.y = -0.3 + Math.sin(time * 0.6) * 0.08;
    }

    if (enableParallax) {
      targetCam.current.set(
        1.8 + mouse.current.x * 0.45,
        0.2 + mouse.current.y * 0.35,
        5.5
      );
      camera.position.lerp(targetCam.current, 0.04);
      camera.lookAt(1.4, -0.2, 0);
    }
  });

  return (
    <group ref={groupRef} position={[1.4, -0.3, 0]}>
      {/* 1. Squashed Sphere Body */}
      <mesh scale={[1.25, 1.05, 1.25]} castShadow receiveShadow>
        <sphereGeometry args={[1.2, 36, 32]} />
        <meshPhysicalMaterial
          color="#1A1A1C"
          metalness={1.0}
          roughness={0.35}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* 2. Half-Torus Handle */}
      <mesh position={[0, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.16, 20, 36, Math.PI]} />
        <meshPhysicalMaterial
          color="#1A1A1C"
          metalness={1.0}
          roughness={0.35}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Handle Horn Struts */}
      <mesh position={[-0.72, 1.05, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.4, 16]} />
        <meshPhysicalMaterial
          color="#1A1A1C"
          metalness={1.0}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.72, 1.05, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.4, 16]} />
        <meshPhysicalMaterial
          color="#1A1A1C"
          metalness={1.0}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

export const HeroKettlebellCanvas: React.FC<HeroKettlebellProps> = ({
  enableParallax,
  isMobile,
}) => {
  return (
    <Canvas
      camera={{ position: [isMobile ? 0 : 1.8, 0.2, isMobile ? 6.5 : 5.5], fov: 42 }}
      dpr={isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5)}
      gl={{
        powerPreference: 'high-performance',
        antialias: !isMobile,
        alpha: true,
      }}
      onCreated={({ scene, gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
        scene.fog = new THREE.FogExp2('#0F0B09', isMobile ? 0.06 : 0.045);
      }}
      className="w-full h-full"
    >
      <ProceduralKettlebell enableParallax={enableParallax} />

      {/* Direct Key, Rim & Fill Lights */}
      <directionalLight position={[0, 8, 4]} intensity={1.5} color="#FFF4EC" />
      <pointLight position={[-6, 0, 2]} intensity={3.5} color="#FF6B1A" distance={16} />
      <pointLight position={[2, 2, -6]} intensity={1.5} color="#FFB547" distance={16} />
      <ambientLight intensity={0.3} color="#FFF4EC" />

      {/* Custom Drei Environment with Lightformer Panels (Procedural Studio Lighting) */}
      <Environment resolution={256}>
        {/* Soft cool-white top panel */}
        <Lightformer
          form="rect"
          intensity={2.8}
          color="#FFF4EC"
          position={[0, 6, 2]}
          scale={[8, 4, 1]}
          rotation={[-Math.PI / 3, 0, 0]}
        />
        {/* Thin ORANGE (#FF6B1A) rim strip from the left */}
        <Lightformer
          form="ring"
          intensity={5.0}
          color="#FF6B1A"
          position={[-6, 0, 1]}
          scale={[1, 7, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />
        {/* Faint ember strip from behind */}
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#FFB547"
          position={[1, 2, -5]}
          scale={[6, 3, 1]}
          rotation={[0, Math.PI, 0]}
        />
      </Environment>
    </Canvas>
  );
};

export default HeroKettlebellCanvas;
