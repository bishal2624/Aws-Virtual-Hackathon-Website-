import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import GateSection from '../components/GateSection';
import LaboratorySection from '../components/LaboratorySection';
import ChambersSection from '../components/ChambersSection';
import ChroniclesSection from '../components/ChroniclesSection';
import JudgesSection from '../components/JudgesSection';
import VaultSection from '../components/VaultSection';
import AllianceSection from '../components/AllianceSection';
import FaqSection from '../components/FaqSection';
import FinalPortalSection from '../components/FinalPortalSection';
import FallbackPoster from '../components/FallbackPoster';
import HalloweenSideDecorations from '../components/HalloweenSideDecorations';
import RegistrationModal from '../components/RegistrationModal';
import SubmissionModal from '../components/SubmissionModal';
import { PrivacyModal, TermsModal } from '../components/LegalModals';
import { useQualityTier } from '../utils/useQualityTier';
import { ambientSound } from '../utils/audio';
import HauntedVoice from '../components/audio/HauntedVoice';
// Lazy-load the heavy 3D chunk after initial paint
const SceneCanvas = lazy(() => import('../components/3d/SceneCanvas'));

/**
 * MainSite component representing Page B (/hack).
 * Preserves the entire existing hackathon site, 3D experience, and functionality.
 */
export default function MainSite({
  isAudioActive: propIsAudioActive,
  onToggleAudio: propOnToggleAudio
} = {}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [is3dMounted, setIs3dMounted] = useState(false);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Global audio state (synchronized with root App or fallback to local)
  const [localAudioActive, setLocalAudioActive] = useState(true);
  const isAudioActive = propIsAudioActive !== undefined ? propIsAudioActive : localAudioActive;

  const handleToggleAudio = propOnToggleAudio || (() => {
    setLocalAudioActive((prev) => {
      const next = !prev;
      if (!next) {
        try {
          ambientSound.stop();
        } catch {}
      }
      return next;
    });
  });

  const handlePlaybackStarted = useCallback(() => {
    if (propIsAudioActive === undefined) {
      setLocalAudioActive(true);
    }
  }, [propIsAudioActive]);


  const isModalOpen = isRegisterOpen || isSubmitOpen || isPrivacyOpen || isTermsOpen;

  // Quality tier & accessibility controls
  const {
    tier,
    isLowGraphicsMode,
    toggleLowGraphicsMode,
    isReducedMotion,
    toggleReducedMotion
  } = useQualityTier();

  // Test WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
      }
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  // Mount 3D canvas after first paint
  useEffect(() => {
    if (!webGlSupported) return;
    const timer = setTimeout(() => {
      setIs3dMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [webGlSupported]);

  // Compute scroll progress (0 to 1) via native scroll listener
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const current = window.scrollY / totalHeight;
            setScrollProgress(Math.min(1, Math.max(0, current)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash scrolling if navigating directly to a section
  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div
      id="app-root"
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#050505',
        overflowX: 'hidden'
      }}
    >
      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-100px',
          left: '20px',
          backgroundColor: 'var(--color-pumpkin)',
          color: '#050505',
          padding: '10px 18px',
          borderRadius: '4px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          zIndex: 9999,
          transition: 'top 0.2s',
          textDecoration: 'none'
        }}
        onFocus={(e) => (e.currentTarget.style.top = '16px')}
        onBlur={(e) => (e.currentTarget.style.top = '-100px')}
      >
        Skip to main content
      </a>

      {/* Layered SVG Static Poster Background (Visible immediately, crossfades once 3D loads) */}
      <FallbackPoster
        opacity={isCanvasLoaded && !isLowGraphicsMode ? 0 : 1}
        isVisible={!isCanvasLoaded || isLowGraphicsMode || !webGlSupported}
      />

      {/* Full-Viewport 3D Experience (Mounted lazily, rendered behind DOM) */}
      {webGlSupported && is3dMounted && !isLowGraphicsMode && (
        <Suspense fallback={null}>
          <SceneCanvas
            scrollProgress={scrollProgress}
            activeTrackIdx={activeTrackIdx}
            tier={tier}
            isReducedMotion={isReducedMotion}
            onLoaded={() => setIsCanvasLoaded(true)}
          />
        </Suspense>
      )}

      {/* Fixed Header & Navigation */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
        isLowGraphicsMode={isLowGraphicsMode}
        toggleLowGraphicsMode={toggleLowGraphicsMode}
        isReducedMotion={isReducedMotion}
        toggleReducedMotion={toggleReducedMotion}
        isAudioActive={isAudioActive}
        onToggleAudio={handleToggleAudio}
      />

      {/* Headless Haunted Voice Audio Controller (Active when MainSite is rendered standalone) */}
      {propIsAudioActive === undefined && (
        <HauntedVoice
          isSoundEnabled={isAudioActive}
          onPlaybackStarted={handlePlaybackStarted}
        />
      )}

      {/* Atmospheric Halloween Side Decorations (Left & Right Margins with Scroll Reveal) */}
      <HalloweenSideDecorations
        scrollProgress={scrollProgress}
        isReducedMotion={isReducedMotion}
      />

      {/* Main Accessible DOM Content */}
      <main id="main-content" style={{ position: 'relative', zIndex: 10 }}>
        {/* Section 00: Hero (The Haunted Mansion at Midnight) */}
        <HeroSection
          onOpenRegister={() => setIsRegisterOpen(true)}
        />

        {/* Section 01: Act I (The Haunted Gate) */}
        <GateSection />

        {/* Section 02: Act II (The Mysterious Laboratory) */}
        <LaboratorySection />

        {/* Section 05: The Four Challenge Chambers */}
        <ChambersSection
          activeTrackIdx={activeTrackIdx}
          onSelectTrack={(idx) => setActiveTrackIdx(idx)}
        />

        {/* Section 06: The Event Chronicles */}
        <ChroniclesSection />

        {/* Section 07: The Judges' Chamber */}
        <JudgesSection />

        {/* Section 08: The Prize Vault */}
        <VaultSection />

        {/* Section 09: The Alliance Hall */}
        <AllianceSection />

        {/* Section 10: Questions Before The Night (FAQ) */}
        <FaqSection />

        {/* Section 11: The Final Portal & Integrated Environmental Footer */}
        <FinalPortalSection
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenSubmit={() => setIsSubmitOpen(true)}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenTerms={() => setIsTermsOpen(true)}
        />
      </main>

      {/* Interactive Modals */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <SubmissionModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
