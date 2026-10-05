import React from 'react';
import { Cookie } from 'lucide-react';

export const CookieTag: React.FC<{
  onClick: () => void;
  className?: string;
  variant?: 'pill' | 'text';
}> = ({ onClick, className = '', variant = 'pill' }) => {
  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`text-xs text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1.5 transition-colors cursor-pointer ${className}`}
        aria-label="Open Cookie & Storage Preferences"
      >
        <Cookie className="w-3.5 h-3.5 text-[#FF6B1A]" />
        <span>Cookies & Privacy</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] hover:border-[#FF6B1A] transition-all cursor-pointer ${className}`}
      title="Cookie & Storage Preferences"
      aria-label="Open Cookie & Storage Preferences"
    >
      <Cookie className="w-3.5 h-3.5 text-[#FF6B1A]" />
      <span className="hidden sm:inline">Cookies</span>
    </button>
  );
};
