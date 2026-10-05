import { useState, useEffect } from 'react';

export interface LongevityCapabilities {
  shouldRender3D: boolean;
  isMobile: boolean;
  dpr: number;
  enableParallax: boolean;
  reason?: string;
}

export function useLongevityCapabilities(): LongevityCapabilities {
  const [capabilities, setCapabilities] = useState<LongevityCapabilities>(() => {
    // Initial safe SSR/first-render fallback default
    return {
      shouldRender3D: false,
      isMobile: false,
      dpr: 1,
      enableParallax: false,
    };
  });

  useEffect(() => {
    // 1. Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.info('[Longevity Capabilities] Mode: static-poster', { reason: 'prefers-reduced-motion' });
      setCapabilities({
        shouldRender3D: false,
        isMobile: false,
        dpr: 1,
        enableParallax: false,
        reason: 'prefers-reduced-motion',
      });
      return;
    }

    // 2. Data saver check
    const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) {
      console.info('[Longevity Capabilities] Mode: static-poster', { reason: 'saveData' });
      setCapabilities({
        shouldRender3D: false,
        isMobile: false,
        dpr: 1,
        enableParallax: false,
        reason: 'saveData',
      });
      return;
    }

    // 3. Hardware constraints check (strictly low-end: < 4 cores or <= 2GB RAM)
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency;

    if ((deviceMemory && deviceMemory <= 2) || (hardwareConcurrency && hardwareConcurrency < 4)) {
      const reason = `low-hardware-specs (RAM: ${deviceMemory ?? 'unknown'}GB, cores: ${hardwareConcurrency ?? 'unknown'})`;
      console.info('[Longevity Capabilities] Mode: static-poster', { reason });
      setCapabilities({
        shouldRender3D: false,
        isMobile: false,
        dpr: 1,
        enableParallax: false,
        reason,
      });
      return;
    }

    // 4. WebGL support check
    const hasWebGL = (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch {
        return false;
      }
    })();

    if (!hasWebGL) {
      console.info('[Longevity Capabilities] Mode: static-poster', { reason: 'no-webgl' });
      setCapabilities({
        shouldRender3D: false,
        isMobile: false,
        dpr: 1,
        enableParallax: false,
        reason: 'no-webgl',
      });
      return;
    }

    // 5. Responsive / DPR determination
    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
    const enableParallax = !isMobile;

    console.info('[Longevity Capabilities] Mode: 3d', {
      isMobile,
      dpr,
      enableParallax,
      cores: hardwareConcurrency,
      ram: deviceMemory,
    });

    setCapabilities({
      shouldRender3D: true,
      isMobile,
      dpr,
      enableParallax,
    });

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setCapabilities((prev) => ({
        ...prev,
        isMobile: mobile,
        dpr: mobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5),
        enableParallax: !mobile,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return capabilities;
}
