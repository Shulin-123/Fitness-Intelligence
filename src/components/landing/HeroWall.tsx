import React from 'react';

export const HeroWall: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Tilted Drifting Wall */}
      <div className="absolute -inset-x-20 -inset-y-16 flex items-center justify-center opacity-10 dark:opacity-10 transform -rotate-3 scale-105 motion-safe:animate-[pulse_12s_ease-in-out_infinite]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl p-6">
          {/* Ghost Card 1: Calorie & Macro Target */}
          <div className="p-5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#FF6B1A]">BIOENERGETIC TARGET</span>
              <span className="text-[var(--muted)]">-15% DEFICIT</span>
            </div>
            <div className="flex items-center gap-4">
              <svg width="60" height="60" viewBox="0 0 60 60" className="rotate-[-90deg]">
                <circle cx="30" cy="30" r="24" stroke="currentColor" className="text-[var(--border)]" strokeWidth="5" fill="none" />
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  stroke="#FF6B1A"
                  strokeWidth="5"
                  strokeDasharray="150"
                  strokeDashoffset="45"
                  fill="none"
                />
              </svg>
              <div>
                <div className="text-xl font-bold text-[var(--text)]">2,040</div>
                <div className="text-[11px] text-[var(--muted)]">Target kcal / day</div>
              </div>
            </div>
            <div className="h-1.5 w-full bg-[var(--surface-2)] rounded-full overflow-hidden flex">
              <div className="w-[30%] bg-[#FF6B1A]" />
              <div className="w-[45%] bg-[#FFB547]" />
              <div className="w-[25%] bg-[#FFE3C4]" />
            </div>
          </div>

          {/* Ghost Card 2: Today's Workout */}
          <div className="p-5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#22C55E]">SESSION 01 // UPPER A</span>
              <span className="text-[var(--muted)]">45 MIN</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-3/4 bg-[var(--surface-2)] rounded" />
              <div className="h-3 w-1/2 bg-[var(--surface-2)]/60 rounded" />
            </div>
            <div className="flex gap-2 pt-1">
              <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-2)] text-[var(--muted)]">
                BENCH PRESS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-2)] text-[var(--muted)]">
                BARBELL ROW
              </span>
            </div>
          </div>

          {/* Ghost Card 3: Readiness Score */}
          <div className="p-5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#FFB547]">AUTOREGULATION</span>
              <span className="text-[#FF6B1A]">ACTIVE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--text)]">82</span>
              <span className="text-xs text-[var(--muted)]">/ 100 Readiness</span>
            </div>
            <p className="text-[11px] text-[var(--muted)]">Sleep 8.2h • Low joint fatigue • Full volume</p>
          </div>

          {/* Ghost Card 4: Weight 7-Day Moving Avg */}
          <div className="p-5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[var(--text)]">WEIGHT TREND</span>
              <span className="text-[#22C55E]">-0.4 KG/WK</span>
            </div>
            <svg width="100%" height="45" viewBox="0 0 200 45" className="overflow-visible">
              <path
                d="M 0 35 Q 50 32, 100 24 T 200 12"
                fill="none"
                stroke="#FF6B1A"
                strokeWidth="2.5"
              />
              <path
                d="M 0 38 L 30 33 L 70 36 L 110 28 L 150 22 L 200 15"
                fill="none"
                stroke="currentColor"
                className="text-[var(--muted)]"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            </svg>
            <div className="text-[10px] font-mono text-[var(--muted)]">7-DAY MOVING AVERAGE CLAMPED</div>
          </div>

          {/* Ghost Card 5: Food Recognition Plate */}
          <div className="p-5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#FF6B1A]">PLATE ESTIMATE</span>
              <span className="text-[#22C55E]">96% CONF</span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-[var(--text)]">Roti (2 pcs) • Dal Tadka • Paneer</div>
              <div className="text-[11px] text-[var(--muted)]">540 kcal • 28g P • 62g C • 18g F</div>
            </div>
            <div className="h-1.5 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6B1A] w-[65%]" />
            </div>
          </div>

          {/* Ghost Card 6: Skeleton Biomechanical Wireframe */}
          <div className="p-5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#FFB547]">EDGE VISION AI</span>
              <span className="text-[var(--text)]">60 FPS</span>
            </div>
            <svg width="100%" height="55" viewBox="0 0 160 55">
              <line x1="20" y1="20" x2="60" y2="35" stroke="#FF6B1A" strokeWidth="2" />
              <line x1="60" y1="35" x2="100" y2="25" stroke="#FF6B1A" strokeWidth="2" />
              <line x1="100" y1="25" x2="140" y2="45" stroke="#FFB547" strokeWidth="2" />
              <circle cx="20" cy="20" r="3" fill="currentColor" className="text-[var(--text)]" />
              <circle cx="60" cy="35" r="3" fill="#FF6B1A" />
              <circle cx="100" cy="25" r="3" fill="#FF6B1A" />
              <circle cx="140" cy="45" r="3" fill="currentColor" className="text-[var(--text)]" />
            </svg>
            <div className="text-[10px] font-mono text-[#FFB547]">DEPTH VERIFIED: PARALLEL</div>
          </div>
        </div>
      </div>

      {/* Dark/Light Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)] opacity-80" />
    </div>
  );
};
