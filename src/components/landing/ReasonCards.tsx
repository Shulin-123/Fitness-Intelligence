import React from 'react';

// Looping animated SVG icons (CSS / SVG only, transform/opacity only)
const DrawerIcon: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true" className="overflow-visible">
    <rect x="6" y="8" width="32" height="28" rx="4" stroke="rgba(255,235,220,0.18)" strokeWidth="1.5" fill="#17110E" />
    <line x1="6" y1="20" x2="38" y2="20" stroke="rgba(255,235,220,0.12)" strokeWidth="1.2" />
    {/* Sliding drawer handle with glow */}
    <g className="motion-safe:animate-[pulse_3s_ease-in-out_infinite]">
      <rect x="17" y="13" width="10" height="2.5" rx="1.25" fill="#FF6B1A" />
      <rect x="17" y="25" width="10" height="2.5" rx="1.25" fill="#FFB547" />
    </g>
    <circle cx="31" cy="26" r="1.5" fill="#FF6B1A" />
  </svg>
);

const ReadinessMeterIcon: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    {/* Meter arc track */}
    <path
      d="M 9 32 A 15 15 0 0 1 35 32"
      stroke="#17110E"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M 9 32 A 15 15 0 0 1 35 32"
      stroke="#FF6B1A"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="60"
      strokeDashoffset="15"
      opacity="0.8"
    />
    {/* Oscillating needle */}
    <g className="origin-[22px_32px] motion-safe:animate-[wiggle_4s_ease-in-out_infinite]" style={{ transformOrigin: '22px 32px' }}>
      <line x1="22" y1="32" x2="29" y2="18" stroke="#FFB547" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="32" r="3" fill="#FFF4EC" />
    </g>
  </svg>
);

const SkeletonLockIcon: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    {/* Biomechanical joints */}
    <line x1="10" y1="28" x2="20" y2="16" stroke="#FF6B1A" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="16" x2="28" y2="24" stroke="#FFB547" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="28" r="3" fill="#FFF4EC" />
    <circle cx="20" cy="16" r="3.5" fill="#FF6B1A" />
    <circle cx="28" cy="24" r="3" fill="#FFF4EC" />
    {/* Small security lock */}
    <g className="motion-safe:animate-[pulse_4s_ease-in-out_infinite]">
      <rect x="26" y="10" width="12" height="10" rx="2" fill="#17110E" stroke="#FF6B1A" strokeWidth="1.5" />
      <path d="M 29 10 V 7 A 3 3 0 0 1 35 7 V 10" stroke="#FFB547" strokeWidth="1.5" fill="none" />
      <circle cx="32" cy="15" r="1.5" fill="#FFF4EC" />
    </g>
  </svg>
);

const BowlFoodIcon: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    {/* Rising steam curls */}
    <path
      d="M 17 12 C 16 10, 18 8, 17 6"
      stroke="#FFB547"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="motion-safe:animate-[pulse_3s_ease-in-out_infinite]"
    />
    <path
      d="M 22 13 C 21 11, 23 9, 22 7"
      stroke="#FF6B1A"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="motion-safe:animate-[pulse_3s_ease-in-out_infinite_0.5s]"
    />
    <path
      d="M 27 12 C 26 10, 28 8, 27 6"
      stroke="#FFB547"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="motion-safe:animate-[pulse_3s_ease-in-out_infinite_1s]"
    />
    {/* Bowl curve */}
    <path
      d="M 8 18 H 36 C 36 29, 29 33, 22 33 C 15 33, 8 29, 8 18 Z"
      fill="#17110E"
      stroke="#FF6B1A"
      strokeWidth="1.5"
    />
    <line x1="16" y1="33" x2="28" y2="33" stroke="rgba(255,235,220,0.3)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ReasonCards: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reasons = [
    {
      title: 'Explainable by design',
      desc: 'Inspect the exact mathematical formula, input variables, and physiological rules behind every recommendation.',
      icon: <DrawerIcon />,
      tag: 'TRANSPARENCY',
    },
    {
      title: 'Adapts to how you feel',
      desc: 'A 3-tap check-in scales your workout volume down to protect joints when systemic fatigue or poor sleep is detected.',
      icon: <ReadinessMeterIcon />,
      tag: 'AUTOREGULATION',
    },
    {
      title: 'Form feedback on your device',
      desc: 'Real-time rep counting and joint-angle tracking computed locally on your device with zero video uploads.',
      icon: <SkeletonLockIcon />,
      tag: 'PRIVACY',
    },
    {
      title: 'Food that matches your plate',
      desc: 'Portion estimates calibrated for real culinary preparations including dal, roti, rice, and international staples.',
      icon: <BowlFoodIcon />,
      tag: 'NUTRITION',
    },
  ];

  return (
    <section
      id="why-different"
      className={`py-20 md:py-24 bg-[var(--bg)] border-t border-[var(--border)] relative z-10 ${className}`}
      aria-label="Why Fitness Intelligence is different"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
            Core Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight mt-1">
            Why it's different
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">
            Engineered around verifiable physiology, on-device intelligence, and zero marketing exaggeration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map((r, i) => (
            <div
              key={i}
              className="p-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] hover:border-[#FF6B1A]/40 transition-colors duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-2.5 rounded-[4px] bg-[var(--surface-2)] border border-[var(--border)]">
                    {r.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#FFB547]">
                    {r.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text)] tracking-tight leading-snug mb-2">
                  {r.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
