import React from 'react';

interface LongevityStaticPosterProps {
  className?: string;
}

export const LongevityStaticPoster: React.FC<LongevityStaticPosterProps> = ({ className = '' }) => {
  // Generate points for 2 helical strands with connecting rungs
  const rungsCount = 18;
  const height = 600;
  const width = 300;
  const amplitude = 90;
  const centerX = width / 2;

  const rungs = Array.from({ length: rungsCount }).map((_, i) => {
    const t = (i / (rungsCount - 1)) * Math.PI * 4;
    const y = 30 + (i / (rungsCount - 1)) * (height - 60);
    const xA = centerX + Math.sin(t) * amplitude;
    const xB = centerX - Math.sin(t) * amplitude;
    const depth = Math.cos(t); // simulated 3D depth
    return { y, xA, xB, depth };
  });

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[340px] h-auto opacity-70 drop-shadow-[0_0_24px_rgba(255,107,26,0.15)]"
      >
        <defs>
          <linearGradient id="strandOrangeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8A3D" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#FF6B1A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFB547" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="strandGreenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#22C55E" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id="nodeGlowOrange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B1A" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nodeGlowGreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="1" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Connecting Rungs (Daily Habits) */}
        {rungs.map((r, i) => (
          <g key={`rung-${i}`} opacity={r.depth > 0 ? 0.8 : 0.35}>
            <line
              x1={r.xA}
              y1={r.y}
              x2={r.xB}
              y2={r.y}
              stroke="#FFF4EC"
              strokeWidth={r.depth > 0 ? 1.5 : 1}
              strokeDasharray={r.depth > 0 ? 'none' : '3 3'}
              strokeOpacity={0.4}
            />
            {/* Center Habit Node */}
            <circle
              cx={(r.xA + r.xB) / 2}
              cy={r.y}
              r={r.depth > 0 ? 2.5 : 1.5}
              fill="#FFF4EC"
              fillOpacity={0.6}
            />
          </g>
        ))}

        {/* Strand B: Nourish (Green) */}
        {rungs.map((r, i) => (
          <g key={`node-green-${i}`}>
            <circle cx={r.xB} cy={r.y} r={r.depth > 0 ? 5 : 3.5} fill="#22C55E" />
            <circle cx={r.xB} cy={r.y} r={r.depth > 0 ? 8 : 5} fill="url(#nodeGlowGreen)" opacity="0.6" />
          </g>
        ))}

        {/* Strand A: Move (Orange) */}
        {rungs.map((r, i) => (
          <g key={`node-orange-${i}`}>
            <circle cx={r.xA} cy={r.y} r={r.depth > 0 ? 5 : 3.5} fill="#FF6B1A" />
            <circle cx={r.xA} cy={r.y} r={r.depth > 0 ? 8 : 5} fill="url(#nodeGlowOrange)" opacity="0.7" />
          </g>
        ))}
      </svg>
    </div>
  );
};
