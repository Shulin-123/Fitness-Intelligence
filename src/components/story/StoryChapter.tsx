import React from 'react';

export interface ChapterData {
  number: string;
  tag: string;
  title: string;
  description: string;
  highlight: string;
}

export const STORY_CHAPTERS: ChapterData[] = [
  {
    number: '01',
    tag: 'Bioenergetic Foundation',
    title: 'From vague estimates to exact baselines.',
    description:
      'We calculate your metabolic rate, daily caloric ceiling, and safety tier using transparent equations instead of opaque AI guesses.',
    highlight: 'Mifflin-St Jeor & WHO Reference Stratification',
  },
  {
    number: '02',
    tag: 'Autoregulated Volume',
    title: 'Your workout adapts before you touch a weight.',
    description:
      'A 3-tap morning check-in measures sleep debt and joint soreness, scaling scheduled volume by up to -30% to protect tendons and prevent burnout.',
    highlight: 'Deterministic fatigue-adjustment rules',
  },
  {
    number: '03',
    tag: 'Edge Biomechanics',
    title: 'Real-time form critique without uploading video.',
    description:
      'MediaPipe models run locally in WebAssembly. Knee flexion, hip hinge depth, and elbow lockouts are verified on your GPU with zero frames sent to a server.',
    highlight: '60 FPS on-device pose estimation',
  },
  {
    number: '04',
    tag: 'Cultural Nutrition',
    title: 'Food logging that matches your real plate.',
    description:
      'From dal, roti, and paneer to grilled chicken and quinoa — portion sliders and macro breakdowns reflect actual culinary preparation without restrictive dogma.',
    highlight: '120+ verified Indian & international staples',
  },
  {
    number: '05',
    tag: 'Explainable by Design',
    title: 'Every recommendation can be inspected and challenged.',
    description:
      'Tap "Why this?" on any number to view the mathematical formula, inputs used, and scientific caveats. No black-box secrets, ever.',
    highlight: '100% open logic rules & algorithmic auditability',
  },
];

export interface StoryChapterCardProps {
  chapter: ChapterData;
  isActive: boolean;
  onClick?: () => void;
}

export const StoryChapterCard: React.FC<StoryChapterCardProps> = ({
  chapter,
  isActive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`p-6 sm:p-7 rounded-[8px] border transition-all duration-300 text-left cursor-pointer select-none ${
        isActive
          ? 'bg-[var(--surface-2)] border-[#FF6B1A]/50 shadow-md'
          : 'bg-[var(--surface)] border-[var(--border)] opacity-60 hover:opacity-90'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-mono text-xs font-bold text-[#FF6B1A]">
          CHAPTER {chapter.number}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[rgba(255,107,26,0.12)] text-[#FFB547] border border-[#FF6B1A]/20">
          {chapter.tag}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text)] mb-2 leading-snug">
        {chapter.title}
      </h3>

      <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
        {chapter.description}
      </p>

      <div className="text-[11px] font-mono text-[#FFB547] flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A]" />
        <span>{chapter.highlight}</span>
      </div>
    </div>
  );
};
