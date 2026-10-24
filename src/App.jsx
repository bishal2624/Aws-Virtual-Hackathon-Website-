import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import IntroPage from './pages/Intro/IntroPage';
import HauntedVoice from './components/audio/HauntedVoice';
import { hauntedVoiceManager } from './utils/hauntedVoiceManager';

// Lazy-load the heavy hackathon site so / pays zero 3D bundle cost
const MainSite = lazy(() => import('./pages/MainSite'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

/**
 * Normalizes window.location.pathname relative to Vite's base path.
 */
function getNormalizedPath() {
  if (typeof window === 'undefined') return '/';
  const rawBase = import.meta.env.BASE_URL || '/';
  const cleanBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  let pathname = window.location.pathname;

  if (cleanBase && pathname.startsWith(cleanBase)) {
    pathname = pathname.slice(cleanBase.length);
  }

  // Normalize empty or trailing slashes
  if (!pathname || pathname === '') return '/';
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Builds a full path respecting Vite's base path.
 */
function getFullPath(targetPath) {
  const rawBase = import.meta.env.BASE_URL || '/';
  const cleanBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  const cleanTarget = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  return `${cleanBase}${cleanTarget}`;
}

export default function App() {
  // Determine initial route and handle legacy hash redirection
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window === 'undefined') return '/';
    const norm = getNormalizedPath();
    const hash = window.location.hash;

    // Legacy URL redirect: visit to / with hash (e.g. /#gate) replaces to /hack#gate
    if ((norm === '/' || norm === '') && hash) {
      const redirectedPath = `/hack${hash}`;
      const fullUrl = getFullPath(redirectedPath);
      window.history.replaceState(null, '', fullUrl);
      return '/hack';
    }

    // Handle /admin, /hack, or /
    if (norm.startsWith('/admin')) return '/admin';
    return norm.startsWith('/hack') ? '/hack' : '/';
  });

  // Client-side navigation handler
  const navigate = useCallback((targetPath, options = {}) => {
    const { replace = false } = options;
    const fullUrl = getFullPath(targetPath);
    const norm = targetPath.split('#')[0] || '/';

    if (replace) {
      window.history.replaceState(null, '', fullUrl);
    } else {
      window.history.pushState(null, '', fullUrl);
    }

    setCurrentRoute(norm.startsWith('/admin') ? '/admin' : norm.startsWith('/hack') ? '/hack' : '/');

    // Scroll to top on route change if no anchor hash is present
    if (!targetPath.includes('#')) {
      window.scrollTo(0, 0);
    }
  }, []);

  // Transition state: 'idle' | 'covering' | 'revealing'
  const [transitionState, setTransitionState] = useState('idle');
  const isTransitioningRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const revealTimerRef = useRef(null);

  // Helper to safely release intro video decoder and hardware resources
  const releaseIntroVideo = useCallback(() => {
    try {
      const videoEl = document.querySelector('.intro-fullscreen-video-bg video');
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        const sources = videoEl.querySelectorAll('source');
        sources.forEach((s) => s.removeAttribute('src'));
        videoEl.load();
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  // Handle cinematic entry transition (Sequence: click -> content exits -> overlay covers -> release video -> navigate -> reveal)
  const handleEnterHack = useCallback(() => {
    if (isTransitioningRef.current) return;

    // Check prefers-reduced-motion preference
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      releaseIntroVideo();
      navigate('/hack');
      return;
    }

    isTransitioningRef.current = true;
    setTransitionState('covering');

    // 1. Once screen is covered (~520ms):
    transitionTimerRef.current = setTimeout(() => {
      // Step 4: Release intro video
      releaseIntroVideo();

      // Step 5: Navigate to /hack
      navigate('/hack');

      // Step 6: Fade the overlay away after the main website's DOM content has rendered
      requestAnimationFrame(() => {
        setTransitionState('revealing');

        revealTimerRef.current = setTimeout(() => {
          setTransitionState('idle');
          isTransitioningRef.current = false;
        }, 400);
      });
    }, 520);
  }, [navigate, releaseIntroVideo]);

  // Listen to browser Back and Forward navigation events
  useEffect(() => {
    const handlePopState = () => {
      // Reset any active transition on history navigation
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      setTransitionState('idle');
      isTransitioningRef.current = false;

      const norm = getNormalizedPath();
      const hash = window.location.hash;

      // Legacy hash redirect on popstate
      if (norm === '/' && hash) {
        const redirectedPath = `/hack${hash}`;
        window.history.replaceState(null, '', getFullPath(redirectedPath));
        setCurrentRoute('/hack');
        return;
      }

      setCurrentRoute(norm.startsWith('/admin') ? '/admin' : norm.startsWith('/hack') ? '/hack' : '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Prefetch MainSite chunk on idle when user is on /
  const prefetchMainSite = useCallback(() => {
    const isSaveData = typeof navigator !== 'undefined' &&
      Boolean(navigator.connection && navigator.connection.saveData);
    if (!isSaveData) {
      import('./pages/MainSite');
    }
  }, []);

  useEffect(() => {
    if (currentRoute === '/') {
      const isSaveData = typeof navigator !== 'undefined' &&
        Boolean(navigator.connection && navigator.connection.saveData);
      if (!isSaveData) {
        let timeoutId;
        let idleId;
        if ('requestIdleCallback' in window) {
          idleId = window.requestIdleCallback(prefetchMainSite, { timeout: 1500 });
        } else {
          timeoutId = setTimeout(prefetchMainSite, 1500);
        }
        return () => {
          if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
          if (timeoutId) clearTimeout(timeoutId);
        };
      }
    }
  }, [currentRoute, prefetchMainSite]);

  // Global sound state (synchronized across / and /hack)
  const [isAudioActive, setIsAudioActive] = useState(true);

  const handleToggleAudio = useCallback(() => {
    setIsAudioActive((prev) => {
      const next = !prev;
      hauntedVoiceManager.setSoundEnabled(next);
      return next;
    });
  }, []);

  const handlePlaybackStarted = useCallback(() => {
    setIsAudioActive(true);
  }, []);

  return (
    <div id="route-container" style={{ width: '100%', minHeight: '100vh', backgroundColor: '#050505', position: 'relative' }}>
      {/* Authoritative Haunted Voice Audio Controller (Persistent across / and /hack) */}
      <HauntedVoice
        isSoundEnabled={isAudioActive}
        onPlaybackStarted={handlePlaybackStarted}
      />

      {/* Phase 3 Cinematic Entry Transition Overlay */}
      <div
        id="cinematic-transition-overlay"
        className={`cinematic-entry-overlay ${
          transitionState === 'covering'
            ? 'is-covering'
            : transitionState === 'revealing'
            ? 'is-revealing'
            : ''
        }`}
        aria-hidden="true"
      />

      {currentRoute === '/admin' ? (
        <Suspense
          fallback={
            <div
              style={{
                minHeight: '100vh',
                backgroundColor: '#050505',
                color: '#F4F1EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '14px'
              }}
            >
              Loading Organizer Chamber...
            </div>
          }
        >
          <AdminDashboard onNavigate={navigate} />
        </Suspense>
      ) : currentRoute === '/hack' ? (
        <Suspense
          fallback={
            <div
              style={{
                minHeight: '100vh',
                backgroundColor: '#050505',
                color: '#F4F1EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '14px'
              }}
            >
              Loading Hack - To - ween experience...
            </div>
          }
        >
          <MainSite
            isAudioActive={isAudioActive}
            onToggleAudio={handleToggleAudio}
          />
        </Suspense>
      ) : (
        <IntroPage
          onNavigate={navigate}
          onEnterHack={handleEnterHack}
          onPrefetch={prefetchMainSite}
        />
      )}
    </div>
  );
}
