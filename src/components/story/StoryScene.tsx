import React, { useState, useEffect, useRef } from 'react';
import { StoryFigure } from './StoryFigure';
import { STORY_CHAPTERS, StoryChapterCard } from './StoryChapter';
import { EmberField } from './EmberField';

export const StoryScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Update active chapter based on scroll position on desktop
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Only calculate if the container is currently on screen
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const totalScrollable = rect.height - windowHeight;
        if (totalScrollable > 0) {
          const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
          const idx = Math.min(STORY_CHAPTERS.length - 1, Math.floor(progress * STORY_CHAPTERS.length));
          setActiveChapter(idx);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      id="story-scene"
      className={`relative z-10 py-20 md:py-28 bg-[var(--bg)] border-t border-[var(--border)] overflow-hidden ${className}`}
    >
      {/* Background Ember Dust */}
      <EmberField count={25} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
            The Architecture of Movement
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-[var(--text)] tracking-tight mt-2">
            Five principles. <span className="font-extrabold text-[var(--text)]">Zero dogma.</span>
          </h2>
          <p className="text-sm text-[var(--muted)] mt-3 max-w-lg mx-auto">
            From initial safety stratification to progressive overload and plate recognition.
          </p>
        </div>

        {/* Desktop Sticky Experience vs Mobile Stack */}
        {prefersReducedMotion ? (
          // Reduced motion: Clean accessible grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORY_CHAPTERS.map((ch) => (
              <StoryChapterCard
                key={ch.number}
                chapter={ch}
                isActive={true}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            {/* Left: Sticky Athlete Kinematics Stage */}
            <div className="lg:col-span-6 lg:sticky lg:top-28 flex flex-col items-center">
              <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 relative overflow-hidden">
                <StoryFigure chapterIndex={activeChapter} />

                {/* 5-Dot Indicator */}
                <div
                  className="flex items-center justify-center gap-2 mt-4"
                  role="tablist"
                  aria-label="Story chapter progression"
                >
                  {STORY_CHAPTERS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveChapter(i)}
                      className={`h-2 transition-all rounded-full cursor-pointer ${
                        activeChapter === i
                          ? 'w-6 bg-[#FF6B1A]'
                          : 'w-2 bg-[rgba(255,235,220,0.18)] hover:bg-[#FFB547]'
                      }`}
                      aria-label={`Jump to chapter ${i + 1}`}
                      aria-selected={activeChapter === i}
                      role="tab"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Scrolling Story Chapters */}
            <div className="lg:col-span-6 space-y-6">
              {STORY_CHAPTERS.map((ch, idx) => (
                <StoryChapterCard
                  key={ch.number}
                  chapter={ch}
                  isActive={activeChapter === idx}
                  onClick={() => setActiveChapter(idx)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
