import React, { Component, Suspense, lazy, useState, useEffect } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useLongevityCapabilities } from './useLongevityCapabilities';
import { LongevityStaticPoster } from './LongevityStaticPoster';

// Lazy-load the heavy 3D canvas chunk after initial paint
const LazyLongevityCanvas = lazy(() => import('./3d/LongevityCanvas'));

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class LongevityErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Longevity 3D context error caught by boundary; falling back to SVG poster:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface LongevityBackgroundProps {
  scrollProgress?: number;
}

export const LongevityBackground: React.FC<LongevityBackgroundProps> = ({
  scrollProgress: controlledProgress,
}) => {
  const capabilities = useLongevityCapabilities();
  const [internalProgress, setInternalProgress] = useState(0);

  // If scrollProgress is not explicitly passed, compute overall page scroll progress
  useEffect(() => {
    if (controlledProgress !== undefined) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      setInternalProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controlledProgress]);

  const activeProgress = controlledProgress !== undefined ? controlledProgress : internalProgress;

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden select-none -z-10"
      aria-hidden="true"
    >
      {/* 3D Scene or Static Fallback */}
      {capabilities.shouldRender3D ? (
        <LongevityErrorBoundary fallback={<LongevityStaticPoster />}>
          <Suspense fallback={<LongevityStaticPoster />}>
            <LazyLongevityCanvas
              scrollProgress={activeProgress}
              isMobile={capabilities.isMobile}
              dpr={capabilities.dpr}
              enableParallax={capabilities.enableParallax}
            />
          </Suspense>
        </LongevityErrorBoundary>
      ) : (
        <LongevityStaticPoster />
      )}

      {/* Gradient scrims ensuring WCAG AA contrast (>= 4.5:1) for text content */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/80 via-[var(--bg)]/60 to-[var(--bg)]/95 pointer-events-none"
        aria-hidden="true"
      />
      {/* Subtle radial center vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,var(--bg)_90%)] pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

export default LongevityBackground;
