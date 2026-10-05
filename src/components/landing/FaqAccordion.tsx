import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface FaqItem {
  question: string;
  badge: string;
  answer: React.ReactNode;
}

export const FaqAccordion: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]); // Default first item open

  const faqs: FaqItem[] = [
    {
      question: 'How are my calories estimated?',
      badge: 'Metabolic Math',
      answer: (
        <>
          We calculate your baseline using peer-reviewed{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            Mifflin-St Jeor metabolic equations
          </strong>
          , then scale by your daily active index and goal deficit/surplus.{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            Strict safety floors (1,500 kcal for men, 1,200 kcal for women)
          </strong>{' '}
          are mathematically enforced to prevent metabolic crash diets.
        </>
      ),
    },
    {
      question: 'Is this medical advice?',
      badge: 'Health Guardrail',
      answer: (
        <>
          <strong className="font-bold text-neutral-950 dark:text-white">No.</strong> Fitness Intelligence is{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            strictly for fitness and wellness tracking
          </strong>
          . All figures, macros, and workout splits are algorithmic estimates.{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            Never use this app for diagnosing, treating, or managing any health condition.
          </strong>{' '}
          Always confirm suitability with a qualified medical or healthcare professional.
        </>
      ),
    },
    {
      question: 'Is my video uploaded?',
      badge: '100% On-Device',
      answer: (
        <>
          <strong className="font-bold text-neutral-950 dark:text-white">No.</strong> All camera frames are analyzed in real time on your device using{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            WebAssembly pose models running directly in your browser
          </strong>
          .{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            No video, image, or biometric camera stream is ever transmitted across the internet.
          </strong>
        </>
      ),
    },
    {
      question: 'Where is my data stored?',
      badge: 'Local Storage',
      answer: (
        <>
          Local to this browser in the current prototype build. Your profile, workout logs, custom foods, and bodyweight history{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            persist exclusively in your browser localStorage
          </strong>
          . You can{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            export or erase your data at any time
          </strong>{' '}
          from your settings.
        </>
      ),
    },
    {
      question: 'Can I use it if I have an injury?',
      badge: 'Safety Screening',
      answer: (
        <>
          <strong className="font-bold text-neutral-950 dark:text-white">Yes, with a lower-risk plan.</strong> Our safety screening checks for{' '}
          <strong className="font-bold text-neutral-950 dark:text-white bg-[#FF6B1A]/15 dark:bg-[#FF6B1A]/25 px-1.5 py-0.5 rounded">
            joint contraindications (knees, shoulders, lower back, wrists)
          </strong>{' '}
          to substitute vulnerable movements with safer alternatives and cap exertion. However, always confirm with a qualified physical therapist or doctor before training around an injury.
        </>
      ),
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextBtn = document.getElementById(`faq-btn-${index + 1}`);
      nextBtn?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevBtn = document.getElementById(`faq-btn-${index - 1}`);
      prevBtn?.focus();
    }
  };

  return (
    <section
      id="faq"
      className={`py-20 md:py-24 bg-[var(--surface)] border-t border-[var(--border)] relative z-10 ${className}`}
      aria-label="Frequently asked questions"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF6B1A]/15 text-[#D94800] dark:text-[#FF6B1A] border border-[#FF6B1A]/35 mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B1A]" />
            <span>Common Inquiries</span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-[var(--text)] tracking-tight mt-1">
            Frequently asked <span className="text-[#D94800] dark:text-[#FF6B1A] underline decoration-[#FF6B1A]/40 decoration-wavy underline-offset-8">questions</span>
          </h2>
          <p className="text-sm sm:text-base font-semibold text-neutral-600 dark:text-[var(--muted)] mt-4">
            Clear, transparent answers about how the app works, data privacy, and safety limits.
          </p>
        </div>

        {/* Accordion Cards List */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndices.includes(index);

            return (
              <div
                key={index}
                className={`transition-all duration-200 rounded-xl overflow-hidden border ${
                  isOpen
                    ? 'bg-white dark:bg-[#1A130F] border-[#FF6B1A] shadow-md ring-2 ring-[#FF6B1A]/20'
                    : 'bg-white dark:bg-[#140E0B] border-neutral-200/90 dark:border-[var(--border)] hover:border-[#FF6B1A]/50 shadow-xs hover:shadow-sm'
                }`}
              >
                <h3>
                  <button
                    id={`faq-btn-${index}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => toggleItem(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B1A] focus-visible:ring-inset group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 flex-1 min-w-0">
                      <span
                        className={`text-base sm:text-lg tracking-tight transition-colors ${
                          isOpen
                            ? 'text-[#D94800] dark:text-[#FF6B1A] font-extrabold'
                            : 'text-neutral-900 dark:text-neutral-100 font-bold group-hover:text-[#D94800] dark:group-hover:text-[#FF6B1A]'
                        }`}
                      >
                        {faq.question}
                      </span>
                      <span
                        className={`inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${
                          isOpen
                            ? 'bg-[#FF6B1A]/15 text-[#D94800] dark:text-[#FFB547] font-bold border border-[#FF6B1A]/30'
                            : 'bg-neutral-100 dark:bg-[#1F1814] text-neutral-600 dark:text-[var(--muted)] border border-neutral-200 dark:border-[var(--border)]'
                        }`}
                      >
                        {faq.badge}
                      </span>
                    </div>

                    {/* Animated Plus-to-Cross Icon in High-Contrast Orange */}
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        isOpen
                          ? 'bg-[#FF6B1A] text-white rotate-45 shadow-sm ring-2 ring-[#FF6B1A]/30'
                          : 'bg-neutral-100 dark:bg-[var(--surface-2)] border border-neutral-200 dark:border-[var(--border)] text-neutral-800 dark:text-[#FF6B1A] group-hover:bg-[#FF6B1A] group-hover:text-white group-hover:border-[#FF6B1A]'
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-btn-${index}`}
                    className="px-6 pb-6 pt-1 text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal animate-in fade-in duration-150 border-t border-neutral-100 dark:border-[var(--border)]/50"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
