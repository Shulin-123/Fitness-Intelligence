import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThreeEmbersProps {
  isMobile: boolean;
}

export const ThreeEmbers: React.FC<ThreeEmbersProps> = ({ isMobile }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = isMobile ? 40 : 120;

  // Particle positions, velocities, and colors
  const [positions, initialData, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const initial = [];

    const palette = [
      new THREE.Color('#FF6B1A'),
      new THREE.Color('#FFB547'),
      new THREE.Color('#FFF4EC'),
    ];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 12;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const speedY = 0.4 + Math.random() * 0.6;
      const driftSpeed = 0.5 + Math.random() * 1.0;
      const driftOffset = Math.random() * Math.PI * 2;
      initial.push({ speedY, driftSpeed, driftOffset, initialX: x });

      const col = palette[Math.floor(Math.random() * palette.length)];
      cols[i * 3] = col.r;
      cols[i * 3 + 1] = col.g;
      cols[i * 3 + 2] = col.b;
    }

    return [pos, initial, cols];
  }, [count]);

  // Create procedural round particle texture so no external asset is requested
  const emberTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 180, 80, 0.8)');
      grad.addColorStop(0.8, 'rgba(255, 107, 26, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const data = initialData[i];
      // Move up
      array[i * 3 + 1] += data.speedY * 0.02;
      // Gentle horizontal wave
      array[i * 3] = data.initialX + Math.sin(t * data.driftSpeed + data.driftOffset) * 0.4;

      // Wrap around vertically
      if (array[i * 3 + 1] > 11) {
        array[i * 3 + 1] = -11;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.35 : 0.45}
        map={emberTexture}
        vertexColors
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
