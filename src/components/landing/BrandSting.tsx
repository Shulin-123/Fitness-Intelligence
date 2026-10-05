import React, { useState, useEffect } from 'react';

export const BrandSting: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const seen = sessionStorage.getItem('fi_brand_sting_seen');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (seen || prefersReduced) return false;
      return true;
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    try {
      sessionStorage.setItem('fi_brand_sting_seen', 'true');
    } catch {
      // ignore
    }
    setVisible(false);
    onComplete?.();
  };

  useEffect(() => {
    if (!visible) return;

    // Auto dismiss after 1.2 seconds
    const timer = setTimeout(() => {
      dismiss();
    }, 1200);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      role="banner"
      aria-label="Fitness Intelligence brand sting introduction"
      className="fixed inset-0 z-50 bg-[var(--bg)] flex flex-col items-center justify-center cursor-pointer select-none animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col items-center justify-center p-6 text-center max-w-sm">
        {/* Animated Drawing Arc */}
        <svg width="220" height="40" viewBox="0 0 220 40" fill="none" className="mb-4">
          <path
            d="M 10 32 Q 110 8 210 32"
            stroke="#FF6B1A"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="motion-safe:animate-[drawArc_0.8s_ease-out_forwards]"
            style={{
              strokeDasharray: 240,
              strokeDashoffset: 0,
            }}
          />
        </svg>

        {/* Wordmark resolving */}
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text)] uppercase tracking-[0.2em] animate-in fade-in zoom-in-95 duration-700">
          Fitness Intelligence
        </h1>

        <span className="text-[10px] font-mono text-[var(--muted)] tracking-widest uppercase mt-2">
          Click or press any key to skip
        </span>
      </div>
    </div>
  );
};
