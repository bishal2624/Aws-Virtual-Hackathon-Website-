import React from 'react';
import { Volume2, VolumeX, Play, Pause, AlertTriangle } from 'lucide-react';
import { useManagedVideo } from '../../hooks/useManagedVideo';

/**
 * Reusable resilient video component.
 * Complies with Section 6, 8, 9, and 10 of project specifications.
 */
export default function ManagedVideo({
  src,
  poster,
  webmSrc = null,
  aspectRatio = '16/9',
  objectFit = 'cover',
  objectPosition = 'center center',
  isReducedMotion = false,
  autoPlay = true,
  disabled = false,
  showControls = true,
  controlsPosition = { bottom: '16px', right: '16px' },
  ariaLabel = 'Video player',
  style = {},
  className = ''
}) {
  const {
    videoRef,
    status,
    hasError,
    isPlaying,
    isBlocked,
    isPausedByUser,
    isFailed,
    togglePlayPause
  } = useManagedVideo({
    src,
    poster,
    isReducedMotion,
    autoPlay,
    disabled
  });

  const isVideoVisible = status === 'playing';

  return (
    <div
      className={`managed-video-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#050505',
        aspectRatio,
        ...style
      }}
    >
      {/* Dev-only missing or failed file banner */}
      {import.meta.env.DEV && hasError && (
        <div
          role="status"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 30,
            backgroundColor: 'rgba(193, 18, 31, 0.92)',
            color: '#F2EFEA',
            border: '1px solid #FF7518',
            borderRadius: '4px',
            padding: '6px 12px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '90%'
          }}
        >
          <AlertTriangle size={14} />
          <span>Dev Warning: Video asset unavailable or decode failed ({src})</span>
        </div>
      )}

      {/* Static Poster Image Fallback (Visible before video plays or if video fails) */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            objectPosition,
            opacity: isVideoVisible ? 0 : 1,
            transition: 'opacity 0.4s ease-in-out',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* Real HTML5 Video Element */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay={autoPlay && !isReducedMotion}
        preload="auto"
        poster={poster || undefined}
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit,
          objectPosition,
          opacity: isVideoVisible ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        {webmSrc && <source src={webmSrc} type="video/webm" />}
        {src && <source src={src} type="video/mp4" />}
      </video>

      {/* Accessible Pause / Play Control (WCAG 2.2.2 compliance) */}
      {showControls && (
        <button
          type="button"
          onClick={togglePlayPause}
          aria-pressed={!isPlaying}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          title={isPlaying ? 'Pause video' : 'Play video'}
          style={{
            position: 'absolute',
            ...controlsPosition,
            zIndex: 10,
            minWidth: '44px',
            minHeight: '44px',
            width: '44px',
            height: '44px',
            borderRadius: '6px',
            backgroundColor: 'rgba(5, 5, 5, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(200, 205, 216, 0.25)',
            color: '#F4F1EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(23, 23, 23, 0.95)';
            e.currentTarget.style.borderColor = '#C1121F';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(5, 5, 5, 0.75)';
            e.currentTarget.style.borderColor = 'rgba(200, 205, 216, 0.25)';
          }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      )}
    </div>
  );
}
