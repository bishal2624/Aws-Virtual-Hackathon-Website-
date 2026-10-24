import React, { useState, useRef, useMemo } from 'react';
import { COLLABORATION_BANNER, EVENT_CONFIG } from '../../data/hackathonData';
import { getIntroVideoUrl, getIntroPosterUrl } from '../../config/media';
import ManagedVideo from '../../components/media/ManagedVideo';
import './IntroPage.css';

/**
 * Full-Screen Cinematic Horror Intro Page (Page A, route /).
 * Redesigned to use a full-viewport background video with no rectangular card container.
 * Mounts zero WebGL or 3D canvas elements.
 */
export default function IntroPage({ onNavigate, onEnterHack, onPrefetch }) {
  const introVideoUrl = getIntroVideoUrl();
  const introPosterUrl = getIntroPosterUrl();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);

  // Generate 16 deterministic ember particle styles (desktop 16, mobile CSS hides excess)
  const emberParticles = useMemo(() => {
    const particles = [];
    const seed = [
      { left: '8%', bottom: '15%', size: 3, delay: '0s', duration: '7.2s' },
      { left: '16%', bottom: '22%', size: 2, delay: '2.1s', duration: '8.4s' },
      { left: '25%', bottom: '10%', size: 4, delay: '1.4s', duration: '6.8s' },
      { left: '34%', bottom: '28%', size: 3, delay: '4.2s', duration: '9.1s' },
      { left: '42%', bottom: '14%', size: 2, delay: '0.8s', duration: '7.9s' },
      { left: '50%', bottom: '18%', size: 3, delay: '3.3s', duration: '8.7s' },
      { left: '58%', bottom: '25%', size: 2, delay: '5.1s', duration: '7.5s' },
      { left: '66%', bottom: '12%', size: 4, delay: '1.9s', duration: '6.5s' },
      { left: '74%', bottom: '30%', size: 3, delay: '4.8s', duration: '9.3s' },
      { left: '82%', bottom: '16%', size: 2, delay: '2.7s', duration: '8.1s' },
      { left: '90%', bottom: '24%', size: 3, delay: '0.4s', duration: '7.0s' },
      { left: '12%', bottom: '8%', size: 2, delay: '3.9s', duration: '8.9s' },
      { left: '28%', bottom: '5%', size: 3, delay: '5.6s', duration: '6.9s' },
      { left: '48%', bottom: '6%', size: 2, delay: '2.4s', duration: '9.5s' },
      { left: '68%', bottom: '9%', size: 3, delay: '1.1s', duration: '7.8s' },
      { left: '86%', bottom: '7%', size: 2, delay: '4.5s', duration: '8.3s' }
    ];
    return seed;
  }, []);

  const handleCtaClick = (e) => {
    // Only intercept primary left click without modifier keys
    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      setIsTransitioning(true);

      if (onEnterHack) {
        onEnterHack();
      } else if (onNavigate) {
        onNavigate('/hack');
      }
    }
  };

  const handleCtaKeyDown = (e) => {
    // Space or Enter key activates the button with accessible keyboard navigation
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      setIsTransitioning(true);

      if (onEnterHack) {
        onEnterHack();
      } else if (onNavigate) {
        onNavigate('/hack');
      }
    }
  };

  const handleSkipClick = (e) => {
    if (isTransitioningRef.current) {
      e.preventDefault();
      return;
    }
    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (onNavigate) onNavigate('/hack');
    }
  };

  return (
    <div id="intro-root">
      {/* 1. Full-Viewport Edge-to-Edge Video Background */}
      <div className="intro-fullscreen-video-bg">
        <ManagedVideo
          src={introVideoUrl}
          poster={introPosterUrl}
          aspectRatio="unset"
          objectFit="cover"
          objectPosition="var(--intro-video-pos, 28% center)"
          showControls={true}
          controlsPosition={{ bottom: '24px', left: '24px' }}
        />
      </div>

      {/* 2. Directional Contrast Scrims */}
      <div className="intro-scrim-horizontal" aria-hidden="true" />
      <div className="intro-scrim-vertical" aria-hidden="true" />

      {/* 3. Perimeter Cinematic Vignette */}
      <div className="intro-vignette" aria-hidden="true" />

      {/* 4. Filmic Static Noise Overlay */}
      <div className="intro-noise-overlay" aria-hidden="true" />

      {/* 5. Slow Drifting Fog Planes */}
      <div className="intro-fog-layer-1" aria-hidden="true" />
      <div className="intro-fog-layer-2" aria-hidden="true" />

      {/* 6. Restrained Floating Ember Particles */}
      <div className="intro-embers-container" aria-hidden="true">
        {emberParticles.map((ember, idx) => (
          <span
            key={idx}
            className="intro-ember-particle"
            style={{
              left: ember.left,
              bottom: ember.bottom,
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              animationDelay: ember.delay,
              animationDuration: ember.duration
            }}
          />
        ))}
      </div>

      {/* Skip to Content Accessibility Link */}
      <a
        href="#intro-main-content"
        className="intro-skip-link"
      >
        Skip to content
      </a>

      {/* Top Bar: Skip Intro Link */}
      <header className="intro-top-bar">
        <a
          href="/hack"
          onClick={handleSkipClick}
          className="intro-skip-intro-link"
          tabIndex={isTransitioning ? -1 : 0}
        >
          Skip intro
        </a>
      </header>

      {/* Main Content Stage (Right-aligned, zero card container) */}
      <main
        id="intro-main-content"
        className={`intro-content-stage ${isTransitioning ? 'intro-content-exit' : ''}`}
      >
        <div className="intro-text-column">
          {/* Collaboration Label (Plain text with ember accent, NO card) */}
          <div className="intro-collab-label">
            <span className="intro-collab-bullet" aria-hidden="true" />
            <span>{COLLABORATION_BANNER}</span>
          </div>

          {/* Eyebrow Format */}
          <div className="intro-eyebrow">
            {EVENT_CONFIG.format}
          </div>

          {/* Primary Page H1 */}
          <h1 id="intro-main-heading" className="intro-heading-h1 font-horror-gothic">
            Hack - To - ween
          </h1>

          {/* Descriptive Content Body */}
          <p className="intro-body-text">
            Build and deploy a cloud project between October 31 and November 5, 2026. Judged on a published 60-point rubric.
          </p>

          {/* Primary Action Button */}
          <div className="intro-cta-wrapper">
            <a
              id="intro-cta"
              href="/hack"
              role="button"
              tabIndex={0}
              aria-busy={isTransitioning}
              aria-disabled={isTransitioning}
              onClick={handleCtaClick}
              onKeyDown={handleCtaKeyDown}
              onMouseEnter={() => {
                if (onPrefetch) onPrefetch();
              }}
              onFocus={() => {
                if (onPrefetch) onPrefetch();
              }}
              className={`intro-cta-btn ${isTransitioning ? 'is-active' : ''}`}
            >
              ENTER THE HACK
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
