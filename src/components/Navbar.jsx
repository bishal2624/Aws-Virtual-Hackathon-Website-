import React, { useState } from 'react';
import { Volume2, VolumeX, Menu, X, ArrowUpRight, Eye, Sparkles } from 'lucide-react';
import { COLLABORATION_BANNER } from '../data/hackathonData';
import { ambientSound } from '../utils/audio';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';

export default function Navbar({
  onOpenRegister,
  isLowGraphicsMode,
  toggleLowGraphicsMode,
  isReducedMotion,
  toggleReducedMotion,
  isAudioActive: propIsAudioActive,
  onToggleAudio: propOnToggleAudio
}) {
  const [internalAudioActive, setInternalAudioActive] = useState(false);
  const isAudioActive = propIsAudioActive !== undefined ? propIsAudioActive : internalAudioActive;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useDialogFocusTrap(isDrawerOpen, { onEscape: () => setIsDrawerOpen(false) });

  const handleToggleAudio = () => {
    if (propOnToggleAudio) {
      propOnToggleAudio();
      return;
    }
    setInternalAudioActive((prev) => {
      const next = !prev;
      if (!next) {
        try {
          ambientSound.stop();
        } catch {}
      }
      return next;
    });
  };

  const navLinks = [
    { label: 'The Gate', href: '#gate' },
    { label: 'Laboratory', href: '#laboratory' },
    { label: 'Chambers', href: '#chambers' },
    { label: 'Chronicles', href: '#chronicles' },
    { label: 'Judges', href: '#judges' },
    { label: 'Vault', href: '#vault' },
    { label: 'Alliance', href: '#alliance' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-dark)',
        backdropFilter: 'var(--backdrop-blur, blur(12px))',
        borderBottom: '1px solid var(--divider-subtle)',
        height: '68px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        {/* Brand Logo & Chapter Banner */}
        <a
          href="#hero"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          {/* Stylized Jack-o-Lantern Glyph Icon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#171717',
              border: '1px solid rgba(255, 117, 24, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FF7518'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#F4F1EB',
                lineHeight: 1.2
              }}
            >
              Hack - To - ween
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10.5px',
                fontWeight: 500,
                color: '#9CA3AF',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                lineHeight: 1.3
              }}
            >
              {COLLABORATION_BANNER}
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '22px'
          }}
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                color: 'var(--muted-text)',
                textDecoration: 'none',
                padding: 'var(--space-tiny) var(--space-xxs)',
                transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:focus-visible': {
                  color: 'var(--accent-orange)',
                  outline: '2px solid var(--accent-orange)',
                  outlineOffset: '2px'
                }
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Controls: Audio, Graphics Tier, Reduced Motion, Register CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Ambient Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleAudio}
            aria-pressed={isAudioActive}
            aria-label={isAudioActive ? 'Ambient sound: on' : 'Ambient sound: off'}
            title={isAudioActive ? 'Ambient sound: on (click to mute)' : 'Ambient sound: off (click to play atmospheric wind)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isAudioActive ? 'rgba(255, 117, 24, 0.12)' : 'var(--bg-subtle)',
              border: `1px solid ${isAudioActive ? '#FF7518' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-tiny) var(--space-xxs)',
              color: isAudioActive ? '#FF7518' : 'var(--muted-text)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-small)',
              fontWeight: 500,
              letterSpacing: '0.01em',
              minHeight: '40px',
              '&:focus-visible': {
                outline: '2px solid var(--accent-orange)',
                outlineOffset: '2px'
              }
            }}
          >
            {isAudioActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="control-label">{isAudioActive ? 'Sound On' : 'Sound Off'}</span>
          </button>

          {/* Low Graphics Mode Toggle */}
          <button
            type="button"
            onClick={toggleLowGraphicsMode}
            aria-label={isLowGraphicsMode ? 'Low graphics mode enabled' : 'Low graphics mode disabled'}
            title={isLowGraphicsMode ? 'Low graphics mode is active' : 'Click to enable low graphics mode'}
            className="desktop-control"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isLowGraphicsMode ? 'rgba(163, 255, 18, 0.12)' : 'var(--bg-subtle)',
              border: `1px solid ${isLowGraphicsMode ? '#A3FF12' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-tiny) var(--space-xxs)',
              color: isLowGraphicsMode ? '#A3FF12' : 'var(--muted-text)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-small)',
              fontWeight: 500,
              letterSpacing: '0.01em',
              minHeight: '40px',
              '&:focus-visible': {
                outline: '2px solid var(--accent-orange)',
                outlineOffset: '2px'
              }
            }}
          >
            <Eye size={15} />
            <span className="control-label">{isLowGraphicsMode ? 'Low 3D' : 'Full 3D'}</span>
          </button>



          {/* Persistent Register CTA Button */}
          <button
            type="button"
            onClick={onOpenRegister}
            className="btn btn-primary"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-small)',
              fontWeight: 600,
              letterSpacing: '0.01em',
              padding: 'var(--space-small) var(--space-large)',
              minHeight: '40px',
              backgroundColor: 'var(--accent-orange)',
              color: 'var(--bg-darkest)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
              '&:focus-visible': {
                outline: '2px solid var(--accent-orange)',
                outlineOffset: '2px'
              },
              '&:hover': {
                backgroundColor: 'var(--accent-ember)'
              },
              '&:active': {
                backgroundColor: 'var(--accent-ember)'
              }
            }}
          >
            Register Now
            <ArrowUpRight size={14} />
          </button>

          {/* Mobile Drawer Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="mobile-nav-toggle"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              backgroundColor: '#171717',
              border: '1px solid rgba(200, 205, 216, 0.2)',
              borderRadius: '6px',
              color: '#F4F1EB',
              cursor: 'pointer'
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Accessible modal sheet) */}
      {isDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          ref={drawerRef}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'var(--bg-dark)',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-large) var(--space-md)',
            overflowY: 'auto',
            borderRight: 'var(--divider-subtle)'
          }}
        >
          {/* Header of Drawer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xlarge)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, color: '#F4F1EB', letterSpacing: '-0.01em' }}>
              Hack - To - ween
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close navigation menu"
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#171717',
                border: '1px solid rgba(200, 205, 216, 0.2)',
                borderRadius: '6px',
                color: '#F4F1EB',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: 'var(--space-xlarge)' }}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '18px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'var(--muted-text)',
                  textDecoration: 'none',
                  padding: 'var(--space-tiny) 0',
                  borderBottom: '1px solid var(--divider-subtle)'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Drawer Actions */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button
              type="button"
              onClick={handleToggleAudio}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-tiny)',
                padding: 'var(--space-small)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--muted-text)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-small)',
                fontWeight: 500,
                letterSpacing: '0.01em',
                minHeight: '44px'
              }}
            >
              {isAudioActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
              {isAudioActive ? 'Ambient Sound: On' : 'Ambient Sound: Off'}
            </button>

            <button
              type="button"
              onClick={toggleLowGraphicsMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-tiny)',
                padding: 'var(--space-small)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--muted-text)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-small)',
                fontWeight: 500,
                letterSpacing: '0.01em',
                minHeight: '44px'
              }}
            >
              <Eye size={18} />
              {isLowGraphicsMode ? 'Low Graphics: Enabled' : 'Low Graphics: Disabled'}
            </button>



            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenRegister();
              }}
              className="btn btn-primary"
              style={{
                width: '100%',
                minHeight: '48px',
                justifyContent: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.01em'
              }}
            >
              Register Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
