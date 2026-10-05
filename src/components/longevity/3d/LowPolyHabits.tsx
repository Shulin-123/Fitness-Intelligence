import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LowPolyHabitsProps {
  isMobile: boolean;
}

export const LowPolyHabits: React.FC<LowPolyHabitsProps> = ({ isMobile }) => {
  const groupRef = useRef<THREE.Group>(null);
  const dumbbellRef = useRef<THREE.Group>(null);
  const kettlebellRef = useRef<THREE.Group>(null);
  const bowlRef = useRef<THREE.Group>(null);
  const appleRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Dumbbell Orbit & Rotation
    if (dumbbellRef.current) {
      const angle = t * 0.18 + 0.5;
      const radius = isMobile ? 3.2 : 4.6;
      dumbbellRef.current.position.set(
        Math.cos(angle) * radius,
        3.5 + Math.sin(t * 0.9) * 0.4,
        Math.sin(angle) * radius
      );
      dumbbellRef.current.rotation.x = t * 0.4;
      dumbbellRef.current.rotation.y = t * 0.3;
    }

    // Kettlebell Orbit & Rotation
    if (kettlebellRef.current) {
      const angle = t * 0.15 + 2.2;
      const radius = isMobile ? 3.0 : 4.4;
      kettlebellRef.current.position.set(
        Math.cos(angle) * radius,
        -2.5 + Math.sin(t * 0.8 + 1) * 0.35,
        Math.sin(angle) * radius
      );
      kettlebellRef.current.rotation.y = t * 0.25;
      kettlebellRef.current.rotation.z = Math.sin(t * 0.5) * 0.15;
    }

    // Bowl with food spheres Orbit
    if (bowlRef.current) {
      const angle = t * 0.14 + 3.8;
      const radius = isMobile ? 3.4 : 4.8;
      bowlRef.current.position.set(
        Math.cos(angle) * radius,
        1.2 + Math.sin(t * 0.7 + 2) * 0.3,
        Math.sin(angle) * radius
      );
      bowlRef.current.rotation.y = t * 0.2;
    }

    // Apple Orbit
    if (appleRef.current) {
      const angle = t * 0.2 + 5.1;
      const radius = isMobile ? 3.1 : 4.2;
      appleRef.current.position.set(
        Math.cos(angle) * radius,
        -4.8 + Math.sin(t * 0.85 + 3) * 0.35,
        Math.sin(angle) * radius
      );
      appleRef.current.rotation.y = t * 0.35;
      appleRef.current.rotation.x = Math.sin(t * 0.6) * 0.2;
    }

    // Water Droplet Orbit
    if (waterRef.current) {
      const angle = t * 0.17 + 1.2;
      const radius = isMobile ? 3.3 : 4.5;
      waterRef.current.position.set(
        Math.cos(angle) * radius,
        -0.8 + Math.sin(t * 0.75 + 4) * 0.4,
        Math.sin(angle) * radius
      );
      waterRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Low-Poly Dumbbell */}
      <group ref={dumbbellRef} scale={isMobile ? 0.35 : 0.45}>
        {/* Handle */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 1.3, 8]} />
          <meshStandardMaterial color="#A89A90" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Left Inner Weight Plate */}
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.36, 0.36, 0.12, 10]} />
          <meshStandardMaterial color="#1F1814" roughness={0.6} emissive="#FF6B1A" emissiveIntensity={0.25} />
        </mesh>
        {/* Left Outer Weight Plate */}
        <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.14, 10]} />
          <meshStandardMaterial color="#17110E" roughness={0.5} />
        </mesh>
        {/* Right Inner Weight Plate */}
        <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.36, 0.36, 0.12, 10]} />
          <meshStandardMaterial color="#1F1814" roughness={0.6} emissive="#FF6B1A" emissiveIntensity={0.25} />
        </mesh>
        {/* Right Outer Weight Plate */}
        <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.14, 10]} />
          <meshStandardMaterial color="#17110E" roughness={0.5} />
        </mesh>
      </group>

      {/* 2. Low-Poly Kettlebell */}
      <group ref={kettlebellRef} scale={isMobile ? 0.38 : 0.48}>
        {/* Body Sphere */}
        <mesh position={[0, -0.2, 0]}>
          <sphereGeometry args={[0.42, 12, 12]} />
          <meshStandardMaterial color="#17110E" roughness={0.4} metalness={0.4} emissive="#FF6B1A" emissiveIntensity={0.15} />
        </mesh>
        {/* Torus Handle */}
        <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24, 0.06, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#A89A90" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* 3. Low-Poly Bowl with Food Spheres */}
      <group ref={bowlRef} scale={isMobile ? 0.35 : 0.45}>
        {/* Bowl */}
        <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1F1814" side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
        {/* Food Sphere 1 (Nourish Green) */}
        <mesh position={[-0.15, 0.05, -0.05]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#22C55E" roughness={0.3} emissive="#22C55E" emissiveIntensity={0.4} />
        </mesh>
        {/* Food Sphere 2 (Ember Orange) */}
        <mesh position={[0.15, 0.08, 0.08]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#FFB547" roughness={0.3} emissive="#FFB547" emissiveIntensity={0.4} />
        </mesh>
        {/* Food Sphere 3 (Cream Protein) */}
        <mesh position={[0, 0.12, -0.12]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#FFF4EC" roughness={0.4} emissive="#FFF4EC" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* 4. Low-Poly Apple */}
      <group ref={appleRef} scale={isMobile ? 0.35 : 0.45}>
        {/* Apple Body */}
        <mesh>
          <sphereGeometry args={[0.38, 10, 10]} />
          <meshStandardMaterial color="#22C55E" roughness={0.3} emissive="#22C55E" emissiveIntensity={0.25} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.025, 0.03, 0.18, 6]} />
          <meshStandardMaterial color="#854D0E" roughness={0.8} />
        </mesh>
        {/* Leaf */}
        <mesh position={[0.1, 0.44, 0]} rotation={[0.4, 0, 0.8]}>
          <coneGeometry args={[0.08, 0.18, 5]} />
          <meshStandardMaterial color="#4ADE80" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Low-Poly Water Droplet */}
      <group ref={waterRef} scale={isMobile ? 0.35 : 0.45}>
        {/* Droplet Base (Sphere) */}
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.32, 10, 10]} />
          <meshStandardMaterial
            color="#38BDF8"
            transparent
            opacity={0.85}
            roughness={0.1}
            emissive="#0284C7"
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Droplet Top (Cone) */}
        <mesh position={[0, 0.22, 0]}>
          <coneGeometry args={[0.3, 0.5, 10]} />
          <meshStandardMaterial
            color="#38BDF8"
            transparent
            opacity={0.85}
            roughness={0.1}
            emissive="#0284C7"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
};
