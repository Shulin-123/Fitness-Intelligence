import React from 'react';
import { Check } from 'lucide-react';

export interface StepCardProps {
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
}

export const StepCard: React.FC<StepCardProps> = ({
  title,
  description,
  selected = false,
  onClick,
  icon,
  badge,
  className = '',
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
      className={`group relative p-5 rounded-[16px] border text-left transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#FF6B1A] min-h-[72px] flex items-start justify-between gap-4 ${
        selected
          ? 'bg-[var(--surface-2)] border-[#FF6B1A] shadow-[0_0_24px_rgba(255,107,26,0.15)]'
          : 'bg-[var(--surface)] border-[var(--border)] hover:border-[#FF6B1A]/40 hover:bg-[var(--surface-hover)]'
      } ${className}`}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={`p-2.5 rounded-xl shrink-0 transition-colors ${
              selected ? 'bg-[#FF6B1A] text-[#0F0B09]' : 'bg-[var(--surface-2)] text-[var(--muted)] group-hover:text-[var(--text)]'
            }`}
          >
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold tracking-tight transition-colors text-[var(--text)]">
              {title}
            </h4>
            {badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[var(--text)]">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-[var(--muted)] mt-1 leading-snug">{description}</p>
          )}
        </div>
      </div>

      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          selected
            ? 'bg-[#FF6B1A] border-[#FF6B1A] text-[#0F0B09]'
            : 'border-[rgba(255,235,220,0.20)] group-hover:border-[rgba(255,235,220,0.40)]'
        }`}
        aria-hidden="true"
      >
        {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>
    </div>
  );
};
