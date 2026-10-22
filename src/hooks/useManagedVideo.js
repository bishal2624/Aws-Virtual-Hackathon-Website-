import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Reusable managed video hook.
 * Strictly adheres to Section 9: Shared Video Behavior.
 * States: 'idle' | 'loading' | 'playing' | 'paused-by-user' | 'blocked' | 'failed'
 */
export function useManagedVideo({
  src,
  poster,
  isReducedMotion = false,
  autoPlay = true,
  disabled = false
} = {}) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [hasError, setHasError] = useState(false);
  const userPausedRef = useRef(false);

  // Check Data Saver preference
  const isDataSaver = typeof navigator !== 'undefined' &&
    Boolean(navigator.connection && navigator.connection.saveData);

  const shouldAutoplay = autoPlay && !isReducedMotion && !isDataSaver && !disabled;

  // Toggle user play / pause
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (status === 'playing') {
      userPausedRef.current = true;
      video.pause();
      setStatus('paused-by-user');
    } else {
      userPausedRef.current = false;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setStatus('playing');
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError') {
              setStatus('blocked');
            } else if (err.name !== 'AbortError') {
              setStatus('failed');
              setHasError(true);
            }
          });
      }
    }
  }, [status]);

  // Handle visibility changes safely
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        if (!video.paused) {
          video.pause();
        }
      } else {
        // Resume on visible only if user did NOT explicitly pause it
        if (!userPausedRef.current && status === 'playing') {
          video.muted = true;
          video.play().catch(() => {
            // Ignore abort or autoplay constraints on tab reactivation
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status]);

  // Setup video element events and initiate playback if allowed
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || disabled) {
      setStatus('idle');
      return;
    }

    userPausedRef.current = false;
    setHasError(false);

    // Muted must be set explicitly through the DOM property before play()
    video.muted = true;
    video.defaultMuted = true;

    const handlePlaying = () => {
      if (userPausedRef.current) {
        video.pause();
        setStatus('paused-by-user');
      } else {
        setStatus('playing');
      }
    };

    const handleWaiting = () => {
      if (status !== 'paused-by-user') {
        setStatus('loading');
      }
    };

    const handleError = () => {
      setStatus('failed');
      setHasError(true);
      if (import.meta.env.DEV) {
        console.warn(`[useManagedVideo] Media playback error for source: ${src}`);
      }
    };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);

    if (shouldAutoplay) {
      setStatus('loading');
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name === 'NotAllowedError') {
            setStatus('blocked');
          } else if (err.name === 'AbortError') {
            // AbortError is expected when interrupted by unmount or reload; ignore safely
          } else {
            setStatus('failed');
            setHasError(true);
            if (import.meta.env.DEV) {
              console.warn(`[useManagedVideo] Autoplay rejected for source ${src}:`, err.message);
            }
          }
        });
      }
    } else {
      setStatus('idle');
    }

    return () => {
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);

      // On unmount: pause, remove src, call load() to completely release hardware decoder
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch {
        // Ignore unmount cleanup exceptions in strict mode
      }
    };
  }, [src, shouldAutoplay, disabled]);

  return {
    videoRef,
    status,
    hasError,
    isPlaying: status === 'playing',
    isBlocked: status === 'blocked',
    isPausedByUser: status === 'paused-by-user',
    isFailed: status === 'failed',
    togglePlayPause
  };
}
