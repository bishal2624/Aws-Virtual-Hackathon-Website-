import { useState, useEffect } from 'react';

/**
 * Evaluates hardware and preferences to determine quality tier:
 * 'high'   -> Desktop, dedicated GPU / high concurrency, full particles, postprocessing
 * 'medium' -> Tablet, ultrabook, moderate hardware
 * 'low'    -> Mobile, battery saver, low concurrency, or user-selected low graphics mode
 */
export function getInitialQualityTier() {
  if (typeof window === 'undefined') return 'high';

  // Check if user previously toggled low graphics mode in sessionStorage
  const savedLowGraphics = sessionStorage.getItem('low_graphics_mode');
  if (savedLowGraphics === 'true') return 'low';

  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;

  if (isNarrow || isCoarse || cores <= 4 || memory <= 4) {
    if (isNarrow && (cores <= 2 || memory <= 2)) {
      return 'low';
    }
    return isNarrow ? 'low' : 'medium';
  }

  return 'high';
}

export function useQualityTier() {
  const [tier, setTier] = useState(getInitialQualityTier);
  const [isLowGraphicsMode, setIsLowGraphicsMode] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('low_graphics_mode') === 'true';
  });
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const manualPref = sessionStorage.getItem('reduced_motion_mode');
    return manualPref ? manualPref === 'true' : mediaQuery.matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => {
      if (!sessionStorage.getItem('reduced_motion_mode')) {
        setIsReducedMotion(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleLowGraphicsMode = () => {
    const next = !isLowGraphicsMode;
    setIsLowGraphicsMode(next);
    sessionStorage.setItem('low_graphics_mode', String(next));
    setTier(next ? 'low' : getInitialQualityTier());
  };

  const toggleReducedMotion = () => {
    const next = !isReducedMotion;
    setIsReducedMotion(next);
    sessionStorage.setItem('reduced_motion_mode', String(next));
  };

  return {
    tier,
    setTier,
    isLowGraphicsMode,
    toggleLowGraphicsMode,
    isReducedMotion,
    toggleReducedMotion
  };
}
