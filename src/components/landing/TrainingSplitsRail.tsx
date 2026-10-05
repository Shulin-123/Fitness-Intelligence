import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { selectSplit } from '../../engine/rules';
import { Button } from '../ui/Button';

// Abstract muscle group SVG icon row
const MuscleIcons: React.FC<{ dayTemplates: string[] }> = ({ dayTemplates }) => {
  const hasUpper = dayTemplates.some((t) => t.includes('Upper') || t.includes('Push') || t.includes('Pull') || t.includes('Full'));
  const hasLower = dayTemplates.some((t) => t.includes('Lower') || t.includes('Legs') || t.includes('Full'));
  const hasPush = dayTemplates.some((t) => t.includes('Push') || t.includes('Upper') || t.includes('Full'));
  const hasPull = dayTemplates.some((t) => t.includes('Pull') || t.includes('Upper') || t.includes('Full'));

  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {/* Chest/Push */}
      <span
        title="Push / Chest"
        className={`w-6 h-6 rounded-[4px] border flex items-center justify-center text-[10px] font-mono ${
          hasPush
            ? 'bg-[#FF6B1A]/10 border-[#FF6B1A]/30 text-[#FF6B1A]'
            : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted)]/40'
        }`}
      >
        P
      </span>
      {/* Back/Pull */}
      <span
        title="Pull / Back"
        className={`w-6 h-6 rounded-[4px] border flex items-center justify-center text-[10px] font-mono ${
          hasPull
            ? 'bg-[#FFB547]/10 border-[#FFB547]/30 text-[#FFB547]'
            : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted)]/40'
        }`}
      >
        PL
      </span>
      {/* Legs */}
      <span
        title="Legs / Lower"
        className={`w-6 h-6 rounded-[4px] border flex items-center justify-center text-[10px] font-mono ${
          hasLower
            ? 'bg-[#FF6B1A]/10 border-[#FF6B1A]/30 text-[#FF6B1A]'
            : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted)]/40'
        }`}
      >
        L
      </span>
      {/* Upper general */}
      <span
        title="Upper Torso"
        className={`w-6 h-6 rounded-[4px] border flex items-center justify-center text-[10px] font-mono ${
          hasUpper
            ? 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]'
            : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted)]/40'
        }`}
      >
        U
      </span>
    </div>
  );
};

export const TrainingSplitsRail: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();
  const railRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Read real split definitions directly from the app's rules engine (selectSplit)
  const splits = [2, 3, 4, 5, 6].map((days) => {
    const raw = selectSplit(days);
    const difficultyMap: Record<number, string> = {
      2: 'Beginner',
      3: 'All Levels',
      4: 'Intermediate',
      5: 'Intermediate-Advanced',
      6: 'Advanced',
    };
    const bestForMap: Record<number, string> = {
      2: 'Busy schedules, active recovery phases, and maximum joint rest.',
      3: 'Balanced full-body progression with 4 complete rest days each week.',
      4: 'Optimal 2x/week frequency for lean mass hypertrophy and strength.',
      5: 'Dedicated lifters wanting higher weekly volume and isolation work.',
      6: 'High-frequency double rotation targeting every movement pattern.',
    };

    return {
      days,
      name: raw.splitName,
      description: raw.splitDescription,
      dayTemplates: raw.dayTemplates,
      difficulty: difficultyMap[days],
      bestFor: bestForMap[days],
    };
  });

  const scroll = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    const scrollAmount = 340;
    railRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, index: number, days: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextBtn = railRef.current?.querySelectorAll<HTMLElement>('[data-split-card]')[index + 1];
      if (nextBtn) {
        nextBtn.focus();
        nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevBtn = railRef.current?.querySelectorAll<HTMLElement>('[data-split-card]')[index - 1];
      if (prevBtn) {
        prevBtn.focus();
        prevBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/onboarding?days=${days}`);
    }
  };

  return (
    <section
      id="training-splits"
      className={`py-20 md:py-24 bg-[var(--surface)] border-t border-[var(--border)] relative z-10 ${className}`}
      aria-label="Training splits rail"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Rail Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
              Deterministic Programming
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight mt-1">
              Training splits
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-lg">
              Engineered for weekly volume distribution, joint recovery, and neuromuscular fatigue management.
            </p>
          </div>

          {/* Left/Right Arrow Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-[4px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[#FF6B1A]/40 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Scroll training splits left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-[4px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[#FF6B1A]/40 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Scroll training splits right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll-Snap Rail */}
        <div
          ref={railRef}
          tabIndex={0}
          role="region"
          aria-label="Horizontal list of training splits"
          className="flex gap-5 overflow-x-auto pb-6 pt-4 px-1 scroll-smooth snap-x snap-mandatory focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B1A] scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {splits.map((split, idx) => {
            const isHovered = hoveredIdx === idx;
            const isDimmed = hoveredIdx !== null && hoveredIdx !== idx;

            return (
              <div
                key={split.days}
                data-split-card
                tabIndex={0}
                role="article"
                aria-label={`${split.name}, ${split.days} days per week, ${split.difficulty}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(idx)}
                onBlur={() => setHoveredIdx(null)}
                onKeyDown={(e) => handleCardKeyDown(e, idx, split.days)}
                className={`relative flex-shrink-0 w-[290px] sm:w-[320px] rounded-[8px] p-6 border border-[var(--border)] bg-[var(--surface-2)] snap-start transition-all duration-300 ease-out select-none cursor-pointer flex flex-col justify-between ${
                  isHovered
                    ? 'scale-[1.06] z-20 border-[#FF6B1A]/60 shadow-lg'
                    : isDimmed
                    ? 'opacity-60'
                    : 'opacity-100 hover:border-[#FF6B1A]/40'
                }`}
              >
                {/* Top Badge Row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-[#FF6B1A]">
                      {split.days} DAYS / WEEK
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]">
                      {split.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text)] tracking-tight leading-snug mb-2">
                    {split.name}
                  </h3>

                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    {split.description}
                  </p>

                  {/* Muscle icons row */}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-mono text-[var(--muted)] block mb-1.5">
                      Pattern Balance
                    </span>
                    <MuscleIcons dayTemplates={split.dayTemplates} />
                  </div>
                </div>

                {/* Bottom Reveal on Hover/Focus */}
                <div className="pt-4 border-t border-[var(--border)] mt-2 space-y-3">
                  <div className="text-[11px] text-[var(--muted)] leading-relaxed">
                    <span className="text-[#FFB547] font-semibold block mb-0.5">Best for:</span>
                    {split.bestFor}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/onboarding?days=${split.days}`);
                    }}
                    className={`w-full text-xs font-bold transition-opacity ${
                      isHovered ? 'opacity-100' : 'opacity-90 sm:opacity-75'
                    }`}
                  >
                    <span>Start with this</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
