import React from 'react';

export const HeroArc: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-12 md:h-16 block"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="heroArcGlow" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="arcStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.05" />
            <stop offset="25%" stopColor="#FF6B1A" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#FFB547" stopOpacity="1" />
            <stop offset="75%" stopColor="#FF6B1A" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="arcGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0" />
            <stop offset="30%" stopColor="#FF6B1A" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#FF6B1A" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#FF6B1A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Soft Blurred Glow Layer (6s breathing pulse) */}
        <path
          d="M 0 55 Q 720 5 1440 55"
          stroke="url(#arcGlowGrad)"
          strokeWidth="10"
          fill="none"
          filter="url(#heroArcGlow)"
          className="motion-safe:animate-[pulse_6s_ease-in-out_infinite]"
        />

        {/* Crisp Hairline Arc */}
        <path
          d="M 0 55 Q 720 5 1440 55"
          stroke="url(#arcStrokeGrad)"
          strokeWidth="1.25"
          fill="none"
        />
      </svg>
    </div>
  );
};
