import React, { useRef, useState, lazy, Suspense } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  LONGEVITY_FACTS,
  LONGEVITY_SECTION_HEADER,
} from '../../content/longevityFacts';
import type { LongevityFact } from '../../content/longevityFacts';
import { LongevitySourcesModal } from './LongevitySourcesModal';
import { useLongevityCapabilities } from './useLongevityCapabilities';
import { LongevityStaticPoster } from './LongevityStaticPoster';

const LazyLongevityCanvas = lazy(() => import('./3d/LongevityCanvas'));

export const LongevityScene: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const capabilities = useLongevityCapabilities();
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [activeProgress, setActiveProgress] = useState(0);

  // Scroll tracking across sticky runway
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Active beat determination (0 to 4)
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);

  scrollYProgress.on('change', (latest) => {
    setActiveProgress(latest);
    const idx = Math.min(
      Math.floor(latest * LONGEVITY_FACTS.length),
      LONGEVITY_FACTS.length - 1
    );
    if (idx !== activeBeatIndex) {
      setActiveBeatIndex(idx);
    }
  });

  const activeFact: LongevityFact = LONGEVITY_FACTS[activeBeatIndex] || LONGEVITY_FACTS[0];

  // -------------------------------------------------------------
  // ACCESSIBILITY & LOW-SPEC FALLBACK (Static Cards View)
  // -------------------------------------------------------------
  if (!capabilities.shouldRender3D) {
    return (
      <section
        id="the-long-game"
        aria-labelledby="longevity-heading"
        className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--bg)]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 text-[#FF6B1A] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{LONGEVITY_SECTION_HEADER.badge}</span>
            </div>
            <h2
              id="longevity-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] tracking-tight"
            >
              {LONGEVITY_SECTION_HEADER.headline}
            </h2>
            <p className="text-base sm:text-lg text-[var(--muted)] mt-3">
              {LONGEVITY_SECTION_HEADER.subline}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
            {/* SVG Poster Graphic */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-[280px] p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[8px]">
                <LongevityStaticPoster className="h-[360px]" />
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B1A]" />
                    <span className="text-xs text-[var(--text)] font-medium">Move</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                    <span className="text-xs text-[var(--text)] font-medium">Nourish</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Beats Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {LONGEVITY_FACTS.map((fact, i) => (
                <article
                  key={fact.id}
                  className={`p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] flex flex-col justify-between ${
                    i === LONGEVITY_FACTS.length - 1 ? 'md:col-span-2' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-[#FF6B1A]">
                        Beat 0{i + 1}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-[3px]">
                        {fact.evidenceType}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">
                      {fact.headline}
                    </h3>
                    <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
                      {fact.body}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>{fact.sourceLabel}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Converged Action Bar */}
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full border-2 border-[#FF6B1A] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#22C55E] border-t-transparent" />
                <CheckCircle2 className="w-5 h-5 text-[#FFB547]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text)]">
                  Two strands. One unified regimen.
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Get an adaptive plan calibrated to your biometrics and daily constraints.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto px-6 py-3 bg-[#FF6B1A] hover:bg-[#FF8A3D] text-white font-bold text-sm tracking-tight rounded-[4px] flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
            >
              <span>Start your assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Under-Scene Persistent Disclaimer & Sources Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)]">
            <p className="text-center sm:text-left">
              {LONGEVITY_SECTION_HEADER.disclaimer}
            </p>
            <button
              type="button"
              onClick={() => setSourcesModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[#FF6B1A] hover:text-[#FF8A3D] font-medium underline underline-offset-4 cursor-pointer shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>See sources</span>
            </button>
          </div>
        </div>

        {/* Accessible Sources Modal */}
        <LongevitySourcesModal
          isOpen={sourcesModalOpen}
          onClose={() => setSourcesModalOpen(false)}
        />
      </section>
    );
  }

  // -------------------------------------------------------------
  // 3D SCROLL-DRIVEN STICKY EXPERIENCE
  // -------------------------------------------------------------
  return (
    <section
      ref={containerRef}
      id="the-long-game"
      aria-labelledby="longevity-heading"
      className="relative min-h-[380vh] border-t border-[var(--border)] scroll-mt-24 pt-8 md:pt-12 bg-[var(--bg)]"
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-20 md:top-24 h-[calc(100vh-5.5rem)] w-full flex flex-col justify-between p-6 sm:p-10 lg:px-16 lg:py-6 overflow-hidden pointer-events-none">
        {/* Top Header */}
        <div className="max-w-2xl pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 text-[#FF6B1A] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{LONGEVITY_SECTION_HEADER.badge}</span>
          </div>
          <h2
            id="longevity-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] tracking-tight leading-[1.08]"
          >
            {LONGEVITY_SECTION_HEADER.headline}
          </h2>
          <p className="text-sm sm:text-base text-[var(--muted)] mt-2">
            {LONGEVITY_SECTION_HEADER.subline}
          </p>
        </div>

        {/* Center: Dynamic Evidence Beat DOM Overlay (Real Semantic Text) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-auto my-auto relative w-full">
          {/* Mobile Helix Backdrop */}
          <div className="lg:hidden absolute inset-0 -z-10 flex items-center justify-center opacity-30 pointer-events-none overflow-hidden">
            <LongevityStaticPoster className="h-[320px] w-full" />
          </div>

          <div className="lg:col-span-7 xl:col-span-6 relative z-10">
            <AnimatePresence mode="wait">
              <motion.article
                key={activeFact.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="p-6 sm:p-8 bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] rounded-[8px] relative overflow-hidden"
              >
                {/* Visual top accent indicator */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B1A]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6B1A]">
                      Beat 0{activeBeatIndex + 1} of 05
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFB547] bg-[#FFB547]/10 px-2 py-0.5 rounded-[3px]">
                    {activeFact.evidenceType}
                  </span>
                </div>

                {/* Beat Headline */}
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  {activeFact.headline}
                </h3>

                {/* Beat Body (Exact copy from prompt) */}
                <p className="text-sm sm:text-base text-[var(--text)] mt-3 leading-relaxed">
                  {activeFact.body}
                </p>

                {/* Evidence Source Attribution */}
                <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)] font-mono">
                    {activeFact.sourceLabel}
                  </span>
                  <a
                    href={activeFact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#FF6B1A] hover:text-[#FF8A3D] font-medium underline underline-offset-4"
                  >
                    View Study
                  </a>
                </div>

                {/* 5-Step Visual Progress Bar */}
                <div className="flex items-center gap-1.5 mt-5">
                  {LONGEVITY_FACTS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === activeBeatIndex
                          ? 'w-8 bg-[#FF6B1A]'
                          : i < activeBeatIndex
                          ? 'w-4 bg-[#22C55E]'
                          : 'w-4 bg-[var(--border)]'
                      }`}
                    />
                  ))}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Right Stage: Permanent Helix Stage on Desktop + Converged CTA */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 w-full h-[460px] lg:h-[520px] relative flex-col items-center justify-center pointer-events-auto">
            {/* Permanent Double Helix Visualization */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
              {capabilities.shouldRender3D ? (
                <Suspense fallback={<LongevityStaticPoster className="h-full w-full max-h-[460px]" />}>
                  <LazyLongevityCanvas
                    scrollProgress={activeProgress}
                    isMobile={false}
                    dpr={capabilities.dpr}
                    enableParallax={capabilities.enableParallax}
                  />
                </Suspense>
              ) : (
                <LongevityStaticPoster className="h-full w-full max-h-[460px]" />
              )}
            </div>

            {/* Converged Dual-Strand Ring & Primary CTA at end of scroll */}
            <AnimatePresence>
              {activeBeatIndex === LONGEVITY_FACTS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 10 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-20 w-full max-w-sm p-6 bg-[var(--surface)]/95 border border-[var(--border)] rounded-[8px] flex flex-col items-center text-center backdrop-blur-md"
                >
                  {/* Converged Dual-Strand Ring Graphic */}
                  <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-[#FF6B1A] animate-pulse" />
                    <div className="absolute inset-1 rounded-full border-4 border-[#22C55E] border-t-transparent" />
                    <Sparkles className="w-6 h-6 text-[#FFB547]" />
                  </div>
                  <h4 className="text-lg font-bold text-[var(--text)] tracking-tight">
                    Two Strands. One Life.
                  </h4>
                  <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                    Start with movement you enjoy and food that fuels you. The compounding benefits begin this week.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/onboarding')}
                    className="w-full mt-5 px-6 py-3 bg-[#FF6B1A] hover:bg-[#FF8A3D] text-white font-bold text-sm tracking-tight rounded-[4px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Start your assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Persistent Disclaimer & Sources Link */}
        <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm -mx-6 sm:-mx-10 lg:-mx-16 px-6 sm:px-10 lg:px-16 pb-2 text-xs text-[var(--muted)]">
          <p className="text-center sm:text-left max-w-2xl">
            {LONGEVITY_SECTION_HEADER.disclaimer}
          </p>
          <button
            type="button"
            onClick={() => setSourcesModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-[#FF6B1A] hover:text-[#FF8A3D] font-medium underline underline-offset-4 cursor-pointer shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>See sources</span>
          </button>
        </div>
      </div>

      {/* Accessible Sources Modal */}
      <LongevitySourcesModal
        isOpen={sourcesModalOpen}
        onClose={() => setSourcesModalOpen(false)}
      />
    </section>
  );
};

export default LongevityScene;
