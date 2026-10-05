import React, { useState, useEffect, useRef, Suspense, lazy, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useLongevityCapabilities } from '../longevity/useLongevityCapabilities';
import { HeroStaticPoster } from './HeroStaticPoster';

// Lazy-load the 3D macro object canvas
const LazyHeroKettlebellCanvas = lazy(() => import('./3d/HeroKettlebellCanvas'));

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class HeroErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Hero 3D context error caught by boundary; falling back to static poster:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const HeroMedia: React.FC<{ className?: string }> = ({ className = '' }) => {
  const capabilities = useLongevityCapabilities();
  const [videoAvailable, setVideoAvailable] = useState<boolean | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Check if /media/hero.mp4 is available via HEAD request
  useEffect(() => {
    let isMounted = true;
    fetch('/media/hero.mp4', { method: 'HEAD' })
      .then((res) => {
        if (!isMounted) return;
        if (res.ok && res.headers.get('content-type')?.includes('video')) {
          setVideoAvailable(true);
        } else {
          setVideoAvailable(false);
        }
      })
      .catch(() => {
        if (isMounted) setVideoAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Pause when tab hidden or offscreen
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible && isTabActive && !capabilities.reason?.includes('reduced-motion')) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible, isTabActive, capabilities.reason]);

  // Mode decision logic:
  // 1. VIDEO (if available and not errored and not reduced-motion)
  // 2. 3D MACRO OBJECT (if video unavailable and capabilities.shouldRender3D is true)
  // 3. STATIC POSTER (fallback)
  const isReducedMotion = capabilities.reason === 'prefers-reduced-motion';
  const showVideo = videoAvailable === true && !videoError && !isReducedMotion;
  const show3D = !showVideo && capabilities.shouldRender3D && !isReducedMotion;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Visual Content Layer */}
      <div className="absolute inset-0 w-full h-full">
        {showVideo ? (
          <video
            ref={videoRef}
            src="/media/hero.mp4"
            poster="/media/hero-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            style={{
              filter: 'grayscale(1) contrast(1.1) brightness(0.7)',
            }}
            className="w-full h-full object-cover"
          />
        ) : show3D ? (
          <HeroErrorBoundary fallback={<HeroStaticPoster />}>
            <Suspense fallback={<HeroStaticPoster />}>
              {/* Depth of field background blur duplicate */}
              <div
                style={{
                  filter: 'grayscale(1) contrast(1.1) brightness(0.7) blur(18px)',
                  opacity: 0.35,
                }}
                className="absolute inset-0 w-full h-full transform scale-105"
              >
                <LazyHeroKettlebellCanvas
                  enableParallax={false}
                  isMobile={capabilities.isMobile}
                />
              </div>

              {/* Crisp foreground 3D macro layer */}
              <div
                style={{
                  filter: 'grayscale(1) contrast(1.15) brightness(0.72)',
                }}
                className="absolute inset-0 w-full h-full"
              >
                <LazyHeroKettlebellCanvas
                  enableParallax={capabilities.enableParallax && isVisible}
                  isMobile={capabilities.isMobile}
                />
              </div>
            </Suspense>
          </HeroErrorBoundary>
        ) : (
          <HeroStaticPoster />
        )}
      </div>

      {/* Color Grade: Orange Duotone Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#FF6B1A]/40 via-transparent to-[#0F0B09]/80 pointer-events-none"
        style={{ mixBlendMode: 'soft-light' }}
      />

      {/* Radial Vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,transparent_35%,#0F0B09_92%)] pointer-events-none"
      />

      {/* Left-to-Right Heavy Scrim ensuring WCAG AA (>4.5:1) headline contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0F0B09] via-[#0F0B09]/85 sm:via-[#0F0B09]/75 to-transparent pointer-events-none"
      />

      {/* Bottom Fade into page background */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#0F0B09] via-[#0F0B09]/80 to-transparent pointer-events-none"
      />
    </div>
  );
};

export default HeroMedia;
