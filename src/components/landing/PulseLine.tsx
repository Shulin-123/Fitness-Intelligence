import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const PulseLine: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Continuous EKG waveform path: baseline -> P-wave -> QRS complex -> T-wave -> baseline
  const pathD =
    'M 0,24 L 380,24 Q 405,24 415,18 Q 425,12 435,24 L 455,24 L 470,36 L 488,4 L 508,44 L 522,24 L 545,24 Q 565,24 578,16 Q 592,8 605,24 L 1200,24';

  return (
    <div
      className={`w-full overflow-hidden flex items-center justify-center py-4 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-6xl h-8 sm:h-10 px-4 opacity-80"
      >
        <defs>
          <filter id="pulseGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.05" />
            <stop offset="30%" stopColor="#FF6B1A" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FFB547" stopOpacity="1" />
            <stop offset="70%" stopColor="#FF6B1A" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {prefersReducedMotion ? (
          <path
            d={pathD}
            stroke="url(#pulseGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pulseGlow)"
          />
        ) : (
          <motion.path
            d={pathD}
            stroke="url(#pulseGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pulseGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          />
        )}
      </svg>
    </div>
  );
};
