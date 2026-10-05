import React, { useEffect, useRef } from 'react';

export interface EmberFieldProps {
  className?: string;
  count?: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  baseOpacity: number;
  flickerSpeed: number;
  flickerOffset: number;
  color: string;
}

export const EmberField: React.FC<EmberFieldProps> = ({
  className = '',
  count = 35,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 600;
    };
    window.addEventListener('resize', handleResize);

    // Intersection observer to pause rendering off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisibleRef.current = entry.isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const emberColors = [
      'rgba(255, 107, 26, ',   // #FF6B1A
      'rgba(255, 181, 71, ',   // #FFB547
      'rgba(224, 78, 0, ',     // #E04E00
      'rgba(255, 150, 60, ',
    ];

    const particles: Particle[] = Array.from({ length: Math.min(count, 40) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      speedY: -(Math.random() * 0.45 + 0.15),
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.5 + 0.2,
      baseOpacity: Math.random() * 0.5 + 0.2,
      flickerSpeed: Math.random() * 0.04 + 0.015,
      flickerOffset: Math.random() * Math.PI * 2,
      color: emberColors[Math.floor(Math.random() * emberColors.length)],
    }));

    let tick = 0;
    const render = () => {
      if (isVisibleRef.current) {
        ctx.clearRect(0, 0, width, height);
        tick += 1;

        for (const p of particles) {
          p.y += p.speedY;
          p.x += p.speedX;

          // Gentle flicker
          const flicker = Math.sin(tick * p.flickerSpeed + p.flickerOffset) * 0.25;
          const currentOpacity = Math.max(0.05, Math.min(0.9, p.baseOpacity + flicker));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${currentOpacity})`;
          ctx.fill();

          // Reset to bottom if floated above viewport
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
};
