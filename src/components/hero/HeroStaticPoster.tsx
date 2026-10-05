import React from 'react';

export const HeroStaticPoster: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-end overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center mr-0 lg:mr-12">
        {/* Soft orange rim ambient glow */}
        <div className="absolute inset-0 bg-radial-gradient from-[#FF6B1A]/20 via-transparent to-transparent blur-3xl rounded-full scale-110" />

        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto opacity-80"
        >
          <defs>
            {/* Dark gunmetal metallic gradient with bright orange rim on the left */}
            <linearGradient id="bodyRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8A3D" stopOpacity="0.9" />
              <stop offset="8%" stopColor="#FF6B1A" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#2A2420" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#1A1A1C" stopOpacity="1" />
              <stop offset="100%" stopColor="#0F0B09" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="handleRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#3A3430" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1A1A1C" stopOpacity="1" />
            </linearGradient>

            <filter id="rimGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Kettlebell Handle Arc */}
          <path
            d="M 140,200 C 140,110 260,110 260,200"
            stroke="url(#handleRimGrad)"
            strokeWidth="28"
            strokeLinecap="round"
          />

          {/* Squashed Kettlebell Body */}
          <ellipse
            cx="200"
            cy="245"
            rx="115"
            ry="105"
            fill="url(#bodyRimGrad)"
            filter="url(#rimGlow)"
          />

          {/* Emissive orange left rim reflection accent */}
          <path
            d="M 100,210 Q 86,245 106,290"
            stroke="#FF6B1A"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>
    </div>
  );
};
