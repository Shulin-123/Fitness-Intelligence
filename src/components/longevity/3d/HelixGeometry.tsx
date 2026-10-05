import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HelixGeometryProps {
  scrollProgress: number; // 0 to 1
  isMobile: boolean;
}

export const HelixGeometry: React.FC<HelixGeometryProps> = ({ scrollProgress, isMobile }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Number of rungs / segments
  const rungCount = isMobile ? 26 : 42;
  const helixRadius = isMobile ? 1.6 : 2.2;
  const helixHeight = isMobile ? 18 : 24;

  // Geometry precomputations
  const nodes = useMemo(() => {
    return Array.from({ length: rungCount }).map((_, i) => {
      const frac = i / (rungCount - 1);
      // ~3.5 turns
      const angle = frac * Math.PI * 7;
      const y = (frac - 0.5) * helixHeight;
      return { id: i, frac, angle, y };
    });
  }, [rungCount, helixHeight]);

  // Temporary vectors for animation to avoid GC pressure
  const posA = useMemo(() => new THREE.Vector3(), []);
  const posB = useMemo(() => new THREE.Vector3(), []);
  const centerPos = useMemo(() => new THREE.Vector3(), []);

  // Strand A (Orange) & Strand B (Green) Node refs
  const strandAMeshRef = useRef<THREE.InstancedMesh>(null);
  const strandBMeshRef = useRef<THREE.InstancedMesh>(null);
  const habitNodeMeshRef = useRef<THREE.InstancedMesh>(null);
  const rungLinesMeshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Colors
  const colorOrange = useMemo(() => new THREE.Color('#FF6B1A'), []);
  const colorOrangeGlow = useMemo(() => new THREE.Color('#FFA366'), []);
  const colorGreen = useMemo(() => new THREE.Color('#22C55E'), []);
  const colorGreenGlow = useMemo(() => new THREE.Color('#86EFAC'), []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    // Heartbeat pulse travels along strands every ~2.4s
    const pulsePhase = (time % 2.4) / 2.4;

    // Slow ambient rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.22;
    }

    // Scroll interpolation: Convergence into a single ring at end of section (progress > 0.85)
    // convergence factor 0 -> 1
    const convergeFactor = THREE.MathUtils.smoothstep(scrollProgress, 0.78, 1.0);

    if (
      strandAMeshRef.current &&
      strandBMeshRef.current &&
      habitNodeMeshRef.current &&
      rungLinesMeshRef.current
    ) {
      nodes.forEach((node, i) => {
        // Compute normal helix coordinates
        const normAngle = node.angle;
        const normY = node.y;
        const normXA = Math.cos(normAngle) * helixRadius;
        const normZA = Math.sin(normAngle) * helixRadius;

        const normXB = Math.cos(normAngle + Math.PI) * helixRadius;
        const normZB = Math.sin(normAngle + Math.PI) * helixRadius;

        // Converged ring coordinates: a unified glowing ring of radius ~2.4 in the XY plane
        const ringAngle = node.frac * Math.PI * 2;
        const ringRadius = 2.4;
        const ringXA = Math.cos(ringAngle) * ringRadius;
        const ringYA = Math.sin(ringAngle) * ringRadius;
        const ringZA = 0;

        const ringXB = Math.cos(ringAngle + Math.PI) * ringRadius;
        const ringYB = Math.sin(ringAngle + Math.PI) * ringRadius;
        const ringZB = 0;

        // Interpolate current positions
        posA.set(
          THREE.MathUtils.lerp(normXA, ringXA, convergeFactor),
          THREE.MathUtils.lerp(normY, ringYA, convergeFactor),
          THREE.MathUtils.lerp(normZA, ringZA, convergeFactor)
        );

        posB.set(
          THREE.MathUtils.lerp(normXB, ringXB, convergeFactor),
          THREE.MathUtils.lerp(normY, ringYB, convergeFactor),
          THREE.MathUtils.lerp(normZB, ringZB, convergeFactor)
        );

        centerPos.lerpVectors(posA, posB, 0.5);

        // Pulse calculation
        // distance from pulse wave
        const distToPulse = Math.abs(node.frac - pulsePhase);
        const wrappedDist = Math.min(distToPulse, 1.0 - distToPulse);
        const pulseIntensity = Math.max(0, 1.0 - wrappedDist * 6.5); // Sharp 2.4s wave

        // Update Strand A Node
        const scaleA = (0.16 + pulseIntensity * 0.12) * (1 - convergeFactor * 0.1);
        dummy.position.copy(posA);
        dummy.scale.set(scaleA, scaleA, scaleA);
        dummy.updateMatrix();
        strandAMeshRef.current!.setMatrixAt(i, dummy.matrix);
        strandAMeshRef.current!.setColorAt(
          i,
          pulseIntensity > 0.4 ? colorOrangeGlow : colorOrange
        );

        // Update Strand B Node
        const scaleB = (0.16 + pulseIntensity * 0.12) * (1 - convergeFactor * 0.1);
        dummy.position.copy(posB);
        dummy.scale.set(scaleB, scaleB, scaleB);
        dummy.updateMatrix();
        strandBMeshRef.current!.setMatrixAt(i, dummy.matrix);
        strandBMeshRef.current!.setColorAt(
          i,
          pulseIntensity > 0.4 ? colorGreenGlow : colorGreen
        );

        // Update Habit Node (center of rung)
        const scaleHabit = (0.09 + pulseIntensity * 0.05) * (1 - convergeFactor * 0.4);
        dummy.position.copy(centerPos);
        dummy.scale.set(scaleHabit, scaleHabit, scaleHabit);
        dummy.updateMatrix();
        habitNodeMeshRef.current!.setMatrixAt(i, dummy.matrix);

        // Update Rung Line (Cylinder between posA and posB)
        const rungLength = posA.distanceTo(posB);
        dummy.position.copy(centerPos);
        // Look at posA and rotate 90 deg so cylinder points along rung
        dummy.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          posA.clone().sub(posB).normalize()
        );
        // Dim rungs when converging
        const rungThick = 0.022 * (1 - convergeFactor * 0.7);
        dummy.scale.set(rungThick, Math.max(0.001, rungLength), rungThick);
        dummy.updateMatrix();
        rungLinesMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });

      strandAMeshRef.current.instanceMatrix.needsUpdate = true;
      if (strandAMeshRef.current.instanceColor) strandAMeshRef.current.instanceColor.needsUpdate = true;

      strandBMeshRef.current.instanceMatrix.needsUpdate = true;
      if (strandBMeshRef.current.instanceColor) strandBMeshRef.current.instanceColor.needsUpdate = true;

      habitNodeMeshRef.current.instanceMatrix.needsUpdate = true;
      rungLinesMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Strand A (Move - Orange) */}
      <instancedMesh
        ref={strandAMeshRef}
        args={[undefined, undefined, rungCount]}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          roughness={0.2}
          metalness={0.1}
          emissive="#FF6B1A"
          emissiveIntensity={0.8}
        />
      </instancedMesh>

      {/* Strand B (Nourish - Green) */}
      <instancedMesh
        ref={strandBMeshRef}
        args={[undefined, undefined, rungCount]}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          roughness={0.2}
          metalness={0.1}
          emissive="#22C55E"
          emissiveIntensity={0.8}
        />
      </instancedMesh>

      {/* Daily Habits Rung Nodes (Cream) */}
      <instancedMesh
        ref={habitNodeMeshRef}
        args={[undefined, undefined, rungCount]}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#FFF4EC"
          roughness={0.3}
          emissive="#FFF4EC"
          emissiveIntensity={0.6}
        />
      </instancedMesh>

      {/* Rungs (Connecting Cylinders) */}
      <instancedMesh
        ref={rungLinesMeshRef}
        args={[undefined, undefined, rungCount]}
      >
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial
          color="#FFF4EC"
          transparent
          opacity={0.4}
          roughness={0.5}
        />
      </instancedMesh>
    </group>
  );
};
