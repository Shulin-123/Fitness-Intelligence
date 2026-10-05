import React, { useEffect, useRef } from 'react';
import { X, Cpu, Calculator, Sliders, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useWhyDrawer } from '../../context/WhyDrawerContext';

export const WhyDrawer: React.FC = () => {
  const { isOpen, content, closeDrawer } = useWhyDrawer();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !content) return null;

  const { title, valueDisplay, explanation } = content;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end items-end md:items-stretch"
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer content: Bottom sheet on mobile, Right side-panel on desktop */}
      <div
        ref={drawerRef}
        className="relative z-10 w-full md:max-w-md bg-[var(--surface)] border-t md:border-t-0 md:border-l border-[var(--border)] shadow-2xl flex flex-col max-h-[90vh] md:max-h-full rounded-t-2xl md:rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-5 md:slide-in-from-right-5 duration-200"
      >
        {/* Mobile handle indicator */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-[var(--border)] rounded-full" />
        </div>

        {/* Header */}
        <div className="p-5 md:p-6 border-b border-[var(--border)] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B1A] flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Explainable by Design
              </span>
            </div>
            <h2 id="why-drawer-title" className="text-xl font-bold tracking-tight text-[var(--text)]">
              {title}
            </h2>
            {valueDisplay !== undefined && (
              <p className="text-sm text-[var(--muted)] mt-0.5">
                Current estimate:{' '}
                <span className="font-semibold text-[var(--text)] tabular-nums">
                  {valueDisplay}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={closeDrawer}
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close explainability panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Section 1: The Rule That Fired */}
          <div className="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B1A]" />
              <span>Logic Rule Applied</span>
            </div>
            <p className="text-[var(--text)] font-medium leading-relaxed">
              {explanation.ruleFired}
            </p>
          </div>

          {/* Section 2: Mathematical Formula */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              <Calculator className="w-4 h-4 text-[var(--muted)]" />
              <span>Calculation Formula</span>
            </div>
            <div className="bg-[var(--surface-2)] p-3.5 rounded-lg border border-[var(--border)] font-mono text-xs text-[#FF6B1A] break-all leading-normal">
              {explanation.formula}
            </div>
          </div>

          {/* Section 3: User's Contributing Inputs */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              <Sliders className="w-4 h-4 text-[var(--muted)]" />
              <span>Your Contributing Parameters</span>
            </div>
            <div className="bg-[var(--surface-2)] rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
              {Object.entries(explanation.inputs).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-xs text-[var(--muted)] capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text)] tabular-nums">
                    {Array.isArray(val)
                      ? val.length > 0
                        ? val.join(', ')
                        : 'None'
                      : typeof val === 'boolean'
                      ? val
                        ? 'Yes'
                        : 'No'
                      : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Transparent Scientific Caveat */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-[#FACC15] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-[#FACC15]">
                Transparent Context & Limits
              </h4>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/80 mt-1 leading-relaxed">
                {explanation.caveat}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-[var(--border)] bg-[var(--surface-2)] flex justify-end">
          <button
            onClick={closeDrawer}
            className="w-full md:w-auto px-5 py-2.5 bg-[#FF6B1A] text-white font-bold text-sm rounded-[3px] hover:bg-[#FF8A3D] transition-colors min-h-[44px] cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
