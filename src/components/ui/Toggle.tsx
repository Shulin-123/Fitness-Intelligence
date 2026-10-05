import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  leftLabel,
  rightLabel,
  className = '',
}) => {
  if (leftLabel && rightLabel) {
    // Segmented style toggle for Metric / Imperial
    return (
      <div className={`inline-flex items-center p-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl ${className}`}>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`min-h-[40px] px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            !checked
              ? 'bg-[#FF6B1A] text-white font-bold shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          {leftLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`min-h-[40px] px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            checked
              ? 'bg-[#FF6B1A] text-white font-bold shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          {rightLabel}
        </button>
      </div>
    );
  }

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-[#FF6B1A] ${
          checked ? 'bg-[#FF6B1A]' : 'bg-[var(--surface-2)] border-[var(--border)]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5 !bg-white dark:!bg-[#0F0B09]' : 'translate-x-0 bg-[var(--muted)]'
          }`}
        />
      </button>
      {label && <span className="text-sm text-[var(--text)]">{label}</span>}
    </label>
  );
};
