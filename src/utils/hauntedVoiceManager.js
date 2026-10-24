import { getHauntedVoiceAudioUrl } from '../config/media';
import { ambientSound } from './audio';

/**
 * Authoritative Singleton Haunted Voice Audio Manager.
 *
 * Guarantees:
 * 1. Single authoritative Audio instance across the entire application lifecycle.
 * 2. Uninterrupted playback across route transitions (from / to /hack).
 * 3. Direct autoplay attempt on cinematic intro (/) with automatic one-time gesture fallback.
 * 4. Full integration with Navbar Sound On/Off toggle:
 *    - Sound Off: immediately pauses, preserves playback position, cancels pending autoplay/listeners, stops ambient sound.
 *    - Sound On: resumes from the exact preserved position with the authentic recording (/assets/audio/haunted-voice.mp3).
 * 5. No duplicate Audio instances, no re-triggering across re-renders or section scrolls.
 * 6. Non-looping playback: naturally finishes and does not restart or loop.
 * 7. Obsolete voice sources permanently prevented from playing.
 */

class HauntedVoiceManager {
  constructor() {
    this.audio = null;
    this.isSoundEnabled = true;
    this.hasStarted = false;
    this.isPlaying = false;
    this.isFinished = false;
    this.isExplicitlyStopped = false;
    this.wasPlayingBeforeMute = false;
    this.removeInteractionListeners = null;
    this.subscribers = new Set();
  }

  getAudioInstance() {
    if (typeof window === 'undefined') return null;

    if (this.audio) {
      return this.audio;
    }

    // Reuse existing global audio if previously registered
    if (window.__hauntedVoiceAudio && window.__hauntedVoiceAudio instanceof Audio) {
      this.audio = window.__hauntedVoiceAudio;
    } else {
      const audioUrl = getHauntedVoiceAudioUrl();
      const audio = new Audio();
      audio.id = 'haunted-voice-audio';
      audio.src = audioUrl;
      audio.preload = 'auto';
      audio.loop = false;
      this.audio = audio;
      window.__hauntedVoiceAudio = audio;
    }

    // Ensure loop is disabled and url is correct
    this.audio.loop = false;
    const expectedUrl = getHauntedVoiceAudioUrl();
    if (this.audio.src !== expectedUrl && !this.audio.src.endsWith(expectedUrl)) {
      this.audio.src = expectedUrl;
    }

    // Bind event listeners
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.hasStarted = true;
      this.wasPlayingBeforeMute = true;
      this.notifySubscribers();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifySubscribers();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.isFinished = true;
      this.wasPlayingBeforeMute = false;
      this.notifySubscribers();
    });

    return this.audio;
  }

  cleanupInteractionFallback() {
    if (this.removeInteractionListeners) {
      this.removeInteractionListeners();
      this.removeInteractionListeners = null;
    }
  }

  setupInteractionFallback() {
    if (typeof window === 'undefined') return;
    this.cleanupInteractionFallback();

    const events = ['click', 'pointerdown', 'keydown', 'scroll', 'touchstart'];
    const onFirstInteraction = () => {
      this.cleanupInteractionFallback();
      if (!this.isFinished && this.isSoundEnabled && !this.isExplicitlyStopped) {
        try {
          ambientSound.stop();
        } catch {}
        const audio = this.getAudioInstance();
        if (audio) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                this.hasStarted = true;
                this.wasPlayingBeforeMute = true;
                this.notifySubscribers();
              })
              .catch(() => {});
          }
        }
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, onFirstInteraction, { capture: true, once: true, passive: true });
    });

    this.removeInteractionListeners = () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, onFirstInteraction, { capture: true });
      });
    };
  }

  attemptAutoplay() {
    if (typeof window === 'undefined') return;
    if (!this.isSoundEnabled || this.isExplicitlyStopped || this.isFinished) return;

    const audio = this.getAudioInstance();
    if (!audio) return;

    // If already playing or paused mid-playback without explicit stop, continue
    if (!audio.paused && !audio.ended) {
      this.isPlaying = true;
      this.hasStarted = true;
      return;
    }

    // Stop any conflicting ambient sound
    try {
      ambientSound.stop();
    } catch {}

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.hasStarted = true;
          this.isPlaying = true;
          this.wasPlayingBeforeMute = true;
          this.cleanupInteractionFallback();
          this.notifySubscribers();
        })
        .catch((err) => {
          // If browser policy blocks audible autoplay, listen for the first user interaction
          if (err.name === 'NotAllowedError') {
            this.setupInteractionFallback();
          }
        });
    }
  }

  setSoundEnabled(enabled) {
    const nextState = Boolean(enabled);
    this.isSoundEnabled = nextState;

    const audio = this.getAudioInstance();

    if (!nextState) {
      // SOUND OFF: Immediately stop/pause, preserve currentTime, cancel pending fallback
      this.isExplicitlyStopped = true;
      this.cleanupInteractionFallback();

      if (audio) {
        if (!audio.paused && !audio.ended) {
          this.wasPlayingBeforeMute = true;
        }
        try {
          audio.pause();
        } catch {}
      }

      try {
        ambientSound.stop();
      } catch {}
    } else {
      // SOUND ON: Resume from preserved position if eligible
      this.isExplicitlyStopped = false;

      try {
        ambientSound.stop();
      } catch {}

      if (audio && !this.isFinished) {
        // Only resume if it was playing or mid-playback or hasn't started yet
        if (this.wasPlayingBeforeMute || audio.currentTime > 0 || !this.hasStarted) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                this.hasStarted = true;
                this.isPlaying = true;
                this.cleanupInteractionFallback();
                this.notifySubscribers();
              })
              .catch((err) => {
                if (err.name === 'NotAllowedError') {
                  this.setupInteractionFallback();
                }
              });
          }
        }
      }
    }

    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  notifySubscribers() {
    const state = this.getState();
    this.subscribers.forEach((cb) => {
      try {
        cb(state);
      } catch {}
    });
  }

  getState() {
    return {
      isSoundEnabled: this.isSoundEnabled,
      isPlaying: this.isPlaying,
      hasStarted: this.hasStarted,
      isFinished: this.isFinished,
      isExplicitlyStopped: this.isExplicitlyStopped,
      currentTime: this.audio ? this.audio.currentTime : 0,
      duration: this.audio ? this.audio.duration : 0
    };
  }
}

// Export singleton instance
export const hauntedVoiceManager = new HauntedVoiceManager();
