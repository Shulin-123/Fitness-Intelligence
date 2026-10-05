import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Card } from './Card';
import type { Explanation } from '../../types';
import { useWhyDrawer } from '../../context/WhyDrawerContext';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  change?: {
    value: string | number;
    positive?: boolean;
    neutral?: boolean;
  };
  explanation?: Explanation;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  sublabel,
  change,
  explanation,
  icon,
  accent = false,
  className = '',
}) => {
  const { openDrawer } = useWhyDrawer();

  const handleWhyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (explanation) {
      openDrawer({
        title: label,
        valueDisplay: unit ? `${value} ${unit}` : value,
        explanation,
      });
    }
  };

  return (
    <Card
      variant="default"
      className={`p-5 relative overflow-hidden transition-all duration-200 border-[var(--border)] ${
        accent ? 'border-[#FF6B1A]/40 bg-[var(--surface-2)]' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[var(--muted)]">{icon}</span>}
          <span className="text-xs uppercase font-medium tracking-wider text-[var(--muted)]">
            {label}
          </span>
        </div>

        {explanation && (
          <button
            type="button"
            onClick={handleWhyClick}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF6B1A] bg-[#FF6B1A]/10 hover:bg-[#FF6B1A]/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF6B1A]"
            aria-label={`Why this recommendation for ${label}?`}
          >
            <HelpCircle className="w-3 h-3" />
            <span>Why this?</span>
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-3xl md:text-4xl font-light tracking-tight tabular-nums text-[var(--text)]">
          {value}
        </span>
        {unit && <span className="text-sm font-normal text-[var(--muted)]">{unit}</span>}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        {sublabel && <span>{sublabel}</span>}
        {change && (
          <span
            className={`font-semibold tabular-nums ml-auto ${
              change.neutral
                ? 'text-[var(--muted)]'
                : change.positive
                ? 'text-[#22C55E]'
                : 'text-[#FACC15]'
            }`}
          >
            {change.positive ? '↑ ' : change.neutral ? '• ' : '↓ '}
            {change.value}
          </span>
        )}
      </div>
    </Card>
  );
};
