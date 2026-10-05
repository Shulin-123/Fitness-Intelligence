import React, { useEffect, useRef } from 'react';
import { ExternalLink, X, BookOpen, ShieldCheck } from 'lucide-react';
import { LONGEVITY_SOURCES, LONGEVITY_SECTION_HEADER } from '../../content/longevityFacts';

interface LongevitySourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LongevitySourcesModal: React.FC<LongevitySourcesModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus modal container
      modalRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        // Focus trap
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="longevity-sources-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[8px] overflow-hidden focus:outline-none"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 flex items-center justify-center text-[#FF6B1A]">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="longevity-sources-title" className="text-base font-bold text-[var(--text)] tracking-tight">
                Peer-Reviewed Evidence & Methodology
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Observational cohorts, systematic reviews & dose-response analyses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-[4px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-[6px] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              <strong className="text-[var(--text)] font-semibold">Scientific Transparency: </strong>
              {LONGEVITY_SECTION_HEADER.disclaimer} Statistics represent epidemiological population correlations, not personalized health guarantees.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {LONGEVITY_SOURCES.map((source, index) => (
              <article
                key={index}
                className="p-4 bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-[6px] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFB547] bg-[#FFB547]/10 px-2 py-0.5 rounded-[3px]">
                      {source.publication} ({source.year})
                    </span>
                    <h3 className="text-sm font-semibold text-[var(--text)] mt-2 leading-snug">
                      {source.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                      {source.keyFinding}
                    </p>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[var(--muted)] hover:text-[#FF6B1A] hover:bg-[#FF6B1A]/10 rounded-[4px] transition-colors shrink-0"
                    title={`Read full paper: ${source.title}`}
                    aria-label={`Open external paper: ${source.title}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <span className="text-xs text-[var(--muted)]">5 Verified Meta-Analyses & Cohorts</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FF6B1A] text-white font-bold text-xs tracking-tight rounded-[4px] hover:bg-[#FF8A3D] transition-colors cursor-pointer"
          >
            Close Sources
          </button>
        </div>
      </div>
    </div>
  );
};
