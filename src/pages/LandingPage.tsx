import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, X, Zap } from 'lucide-react';
import { HeroMedia } from '../components/hero/HeroMedia';
import { HeroWall } from '../components/landing/HeroWall';
import { HeroArc } from '../components/landing/HeroArc';
import { PulseLine } from '../components/landing/PulseLine';
import { TrainingSplitsRail } from '../components/landing/TrainingSplitsRail';
import { StoryScene } from '../components/story/StoryScene';
import { ReasonCards } from '../components/landing/ReasonCards';
import { FaqAccordion } from '../components/landing/FaqAccordion';
import { LongevityBackground } from '../components/longevity/LongevityBackground';
import { LongevityScene } from '../components/longevity/LongevityScene';
import { Button } from '../components/ui/Button';
import { CookieTag } from '../components/ui/CookieTag';
import { CookieConsent } from '../components/ui/CookieConsent';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { SpringBootStatusBadge } from '../components/ui/SpringBootStatusBadge';
import { BiomechanicsLabModal } from '../components/ui/BiomechanicsLabModal';
import { SignInModal } from '../components/auth/SignInModal';
import { UserMenu } from '../components/auth/UserMenu';
import { HeroPromptBar } from '../components/ai/HeroPromptBar';
import { services } from '../services/registry';
import { useToast } from '../context/ToastContext';
import type { Goal, UserProfile } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    services.auth.getCurrentUser()
  );

  const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
    return sessionStorage.getItem('fi_form_announcement_dismissed') === 'true';
  });

  const handleDismissAnnouncement = () => {
    sessionStorage.setItem('fi_form_announcement_dismissed', 'true');
    setAnnouncementDismissed(true);
  };

  const [selectedGoal, setSelectedGoal] = useState<Goal>('build_muscle');

  const handleStartOnboarding = (goal?: Goal) => {
    const chosenGoal = goal || selectedGoal;
    localStorage.removeItem('fitness_onboarding_draft');
    navigate(`/onboarding?goal=${chosenGoal}`);
  };

  const handleDemoMode = async () => {
    const user = await services.auth.enableDemoMode();
    setCurrentUser(user);
    showToast('Loaded 3-week Demo Persona (Alex Morgan, 28yo).', 'success');
    navigate('/dashboard');
  };

  const goals: { id: Goal; label: string; desc: string }[] = [
    { id: 'build_muscle', label: 'Build Muscle', desc: '+8% controlled surplus & progressive overload' },
    { id: 'lose_fat', label: 'Lose Fat', desc: '15% steady deficit with floor protection' },
    { id: 'maintain', label: 'Maintain', desc: 'Metabolic equilibrium & body recomposition' },
    { id: 'get_fitter', label: 'Get Fitter', desc: 'Athletic conditioning & functional resilience' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col selection:bg-[#FF6B1A] selection:text-[#0F0B09] relative transition-colors duration-200">
      {/* 3D Longevity Background (Fixed full viewport, z-index -1, zero layout shift) */}
      <LongevityBackground />

      {/* Announcement Bar above nav */}
      {!announcementDismissed && (
        <div className="bg-[#FF6B1A] text-[#0F0B09] px-4 py-2 text-xs font-bold flex items-center justify-between tracking-tight sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-center flex-1 text-center">
            <span>New: form checker runs on your device. Nothing is uploaded.</span>
          </div>
          <button
            type="button"
            onClick={handleDismissAnnouncement}
            className="p-1 text-[#0F0B09]/80 hover:text-[#0F0B09] rounded transition-colors cursor-pointer"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Atmospheric Header */}
      <header className="border-b border-[var(--border)] sticky top-0 z-30 bg-[var(--bg)]/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B1A] animate-pulse" />
            <span className="font-extrabold tracking-tight text-sm uppercase text-[var(--text)]">
              FITNESS INTELLIGENCE
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs uppercase font-medium tracking-wider text-[var(--muted)]">
            <a href="#training-splits" className="hover:text-[var(--text)] transition-colors">
              Splits
            </a>
            <a href="#the-long-game" className="hover:text-[var(--text)] transition-colors">
              Longevity
            </a>
            <button
              type="button"
              onClick={() => setLabModalOpen(true)}
              className="text-[#FF6B1A] hover:opacity-80 transition-opacity font-bold cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Science Lab
            </button>
            <a href="#story-scene" className="hover:text-[var(--text)] transition-colors">
              Principles
            </a>
            <a href="#why-different" className="hover:text-[var(--text)] transition-colors">
              Why it's different
            </a>
            <a href="#faq" className="hover:text-[var(--text)] transition-colors">
              FAQ
            </a>
            <button
              onClick={handleDemoMode}
              className="text-[#FF6B1A] hover:underline font-semibold cursor-pointer"
            >
              Try Demo Mode
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cookie Tag */}
            <CookieTag onClick={() => setCookieModalOpen(true)} />

            {/* Spring Boot Live Status Badge */}
            <SpringBootStatusBadge />

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Sign In or Active User Profile Avatar */}
            {currentUser ? (
              <UserMenu user={currentUser} onLogout={() => setCurrentUser(null)} />
            ) : (
              <button
                type="button"
                onClick={() => setSignInModalOpen(true)}
                className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={handleDemoMode}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer hidden md:block"
            >
              Demo Mode
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStartOnboarding()}
              className="tracking-tight text-xs uppercase"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* STEP 1: WHOOP-STYLE HERO SECTION (Full-bleed, min-h 100svh, content bottom-left) */}
      <section className="relative min-h-[100svh] w-full flex flex-col justify-between overflow-hidden pt-4 pb-16 md:pb-24 px-4 sm:px-6 lg:px-12">
        {/* Full-bleed Macro Product Shot / Video / 3D Canvas with color grade */}
        <HeroMedia />

        {/* Subtle tilted app cards wall in background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <HeroWall />
        </div>

        {/* Top-Right Subline: Positioned on the right side below the 'Get Started' option */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-end pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)]/90 border border-[var(--border)] text-xs text-[var(--text)] backdrop-blur-sm shadow-sm hover:border-[#FF6B1A]/40 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B1A]" />
            <span className="font-medium">Verifiable biomechanics & open algorithms</span>
          </div>
        </div>

        {/* Content Anchored Bottom-Left */}
        <div className="relative z-10 flex flex-col items-start text-left max-w-7xl mx-auto w-full mt-auto">

          {/* Headline on two lines: weight 300, tracking -0.04em, size clamp(56px, 11vw, 168px), line-height 0.95 */}
          <h1
            style={{
              fontSize: 'clamp(56px, 11vw, 168px)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
            }}
            className="font-light text-[#FF6B1A] dark:text-white text-left hero-headline"
          >
            A plan that<br />knows you.
          </h1>

          {/* Thin Body: weight 400, muted color */}
          <p className="font-normal text-white/80 dark:text-[var(--muted)] text-base sm:text-lg max-w-xl text-left leading-relaxed mt-6">
            Every set, rep, calorie, and recommendation is calculated by deterministic, peer-reviewed rules you can inspect and challenge anytime.
          </p>

          {/* Orange Pill CTA + Live ChatGPT Prompt Box + Goal Chips Row */}
          <div className="w-full max-w-2xl mt-8 flex flex-col items-start gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => handleStartOnboarding(selectedGoal)}
                className="px-8 py-3.5 rounded-full bg-[#FF6B1A] text-[#0F0B09] font-bold text-sm tracking-tight hover:bg-[#FF8A3D] cursor-pointer inline-flex items-center gap-2 transition-transform active:scale-[0.98]"
              >
                <span>Start your assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDemoMode}
                className="text-xs text-white/80 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                or explore 3-week demo persona
              </button>
            </div>

            {/* ChatGPT-style Live AI Prompt Box */}
            <HeroPromptBar className="w-full my-2" />

            {/* Goal-Chip Input */}
            <div className="w-full p-3 sm:p-4 rounded-[8px] bg-[var(--surface)]/90 border border-[var(--border)] flex flex-col gap-2.5 backdrop-blur-md">
              <div className="text-left px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  What's your goal?
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.id)}
                    className={`py-2.5 px-3 rounded-[4px] text-xs font-semibold transition-all text-center flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
                      selectedGoal === g.id
                        ? 'bg-[#FF6B1A]/15 border border-[#FF6B1A] text-[var(--text)] font-bold'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>

              <span className="text-xs text-[var(--muted)] px-1">
                {goals.find((g) => g.id === selectedGoal)?.desc}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Element: Glowing Orange Hairline Arc across full width */}
      <HeroArc className="relative z-10" />

      {/* STEP 3: Pulse Line Divider between Hero and Splits */}
      <PulseLine className="my-3 relative z-10" />

      {/* STEP 2: FUNNEL ORDER */}
      {/* 2. "Training splits" rail (Step 3) */}
      <TrainingSplitsRail />

      {/* 3. "The long game" Longevity Scene (5 scroll-driven evidence beats + 3D camera progression) */}
      <LongevityScene />

      {/* 4. Existing <StoryScene /> section (unchanged) */}
      <StoryScene />

      {/* 4. "Why it's different" - four reason cards (Step 4) */}
      <ReasonCards />

      {/* 5. FAQ accordion (Step 5) */}
      <FaqAccordion />

      {/* STEP 3: Pulse Line Divider above final CTA */}
      <PulseLine className="my-6 relative z-10" />

      {/* 6. Final CTA: repeat the goal chips + "Get started" button */}
      <section className="py-20 md:py-24 bg-[var(--surface)] border-t border-[var(--border)] relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
            Immediate Local Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight mt-1 mb-3">
            Start with your goal.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-lg mx-auto mb-8">
            Zero cloud registrations. All profiles, caloric allocations, and safety boundaries compute entirely in your local browser.
          </p>

          {/* Repeated Goal Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {goals.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGoal(g.id)}
                className={`py-3 px-3 rounded-[4px] text-xs font-semibold transition-all text-center flex flex-col items-center justify-center min-h-[46px] cursor-pointer ${
                  selectedGoal === g.id
                    ? 'bg-[#FF6B1A]/15 border border-[#FF6B1A] text-[var(--text)] font-bold'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                }`}
              >
                <span>{g.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleStartOnboarding(selectedGoal)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 group cursor-pointer text-sm font-bold"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleDemoMode}
              className="w-full sm:w-auto text-xs"
            >
              <span>Launch 3-Week Historical Demo</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer & Medical Disclaimer */}
      <footer className="border-t border-[var(--border)] py-10 bg-[var(--bg)] text-xs text-[var(--muted)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <span className="text-[var(--text)] font-bold tracking-tight">FITNESS INTELLIGENCE</span>
            <p className="max-w-xl text-[11px] leading-relaxed">
              Fitness & wellness tracking only. All figures are estimates based on your inputs. Never diagnose, treat, or claim a workout is safe for your condition. Always confirm suitability with a qualified medical or exercise professional.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 text-xs font-semibold">
            <CookieTag variant="text" onClick={() => setCookieModalOpen(true)} />
            <button
              onClick={handleDemoMode}
              className="text-[#FF6B1A] hover:underline cursor-pointer"
            >
              Try Demo Mode
            </button>
            <button
              onClick={() => handleStartOnboarding()}
              className="text-[var(--text)] hover:text-[#FF6B1A] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </footer>

      {/* Sign In & Auth Frontend Modal */}
      <SignInModal
        isOpen={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        onSuccess={() => setCurrentUser(services.auth.getCurrentUser())}
      />

      {/* Cookie Consent & Local Storage Preferences Modal */}
      <CookieConsent
        isOpenDirectly={cookieModalOpen}
        onCloseDirectly={() => setCookieModalOpen(false)}
      />

      {/* Interactive Biomechanics Lab & Calculation Engine Modal */}
      <BiomechanicsLabModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
      />
    </div>
  );
};
