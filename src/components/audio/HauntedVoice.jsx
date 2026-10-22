import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Square, Mic, AlertCircle, Radio } from 'lucide-react';
import { getHauntedVoiceAudioUrl } from '../../config/media';
import { ambientSound } from '../../utils/audio';
import './HauntedVoice.css';

/**
 * Phase 5: Haunted Voice Audio Player.
 * Self-contained, resilient HTML5 audio controller for the hackathon website.
 *
 * States: 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'unavailable'
 *
 * Requirements:
 * - Load from reserved path: public/assets/audio/haunted-voice.mp3
 * - Support play, pause, resume, replay, and stop
 * - Safe error handling when audio is missing or not yet uploaded
 * - Respect global sound settings: stops immediately when website sound is turned off
 * - Never auto-play without user action
 * - Releases audio resources cleanly on unmount
 * - Fully keyboard accessible with WCAG-compliant controls
 */
export default function HauntedVoice({
  src,
  isGlobalSoundActive = true,
  onStateChange,
  className = '',
  style = {}
}) {
  const audioRef = useRef(null);
  const [playbackState, setPlaybackState] = useState('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const audioUrl = src || getHauntedVoiceAudioUrl();

  // Notify parent if state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(playbackState);
    }
  }, [playbackState, onStateChange]);

  // Clean initialization of singleton Audio instance
  const getOrCreateAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime || 0);
      });

      audio.addEventListener('ended', () => {
        setPlaybackState('ended');
        ambientSound.resume();
      });

      audio.addEventListener('error', () => {
        setPlaybackState('unavailable');
        setErrorMessage('Recording awaiting upload (public/assets/audio/haunted-voice.mp3)');
        ambientSound.resume();
      });

      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  // 1. Play action
  const handlePlay = useCallback(() => {
    setErrorMessage(null);
    const audio = getOrCreateAudio();

    // Suspend procedural audio so only the real haunted voice MP3 is heard
    ambientSound.suspend();

    if (!audio.src || !audio.src.includes('haunted-voice.mp3')) {
      audio.src = audioUrl;
      audio.load();
    }

    setPlaybackState('loading');

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setPlaybackState('playing');
        })
        .catch((err) => {
          ambientSound.resume();
          if (err.name === 'NotAllowedError') {
            setPlaybackState('idle');
          } else {
            // Missing asset, network error, or invalid media
            setPlaybackState('unavailable');
            setErrorMessage('Recording awaiting upload (public/assets/audio/haunted-voice.mp3)');
          }
        });
    }
  }, [audioUrl, getOrCreateAudio]);

  // 2. Pause action
  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setPlaybackState('paused');
      ambientSound.resume();
    }
  }, []);

  // 3. Resume action
  const handleResume = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      ambientSound.suspend();
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaybackState('playing');
          })
          .catch(() => {
            ambientSound.resume();
            setPlaybackState('paused');
          });
      }
    }
  }, []);

  // 4. Stop action
  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
    setPlaybackState('idle');
    setCurrentTime(0);
    ambientSound.resume();
  }, []);

  // 5. Replay action
  const handleReplay = useCallback(() => {
    const audio = getOrCreateAudio();
    ambientSound.suspend();
    try {
      audio.currentTime = 0;
    } catch {}

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setPlaybackState('playing');
        })
        .catch(() => {
          ambientSound.resume();
          setPlaybackState('unavailable');
        });
    }
  }, [getOrCreateAudio]);

  // 6. Global Sound Integration:
  // Turning website sound off stops the haunted voice immediately.
  // Turning sound back on must NOT automatically restart the recording.
  const prevSoundActiveRef = useRef(isGlobalSoundActive);

  useEffect(() => {
    if (prevSoundActiveRef.current && !isGlobalSoundActive) {
      if (playbackState === 'playing' || playbackState === 'paused' || playbackState === 'loading') {
        handleStop();
      }
    }
    prevSoundActiveRef.current = isGlobalSoundActive;
  }, [isGlobalSoundActive, playbackState, handleStop]);

  // 7. Cleanup on unmount: release audio hardware resources
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        } catch {}
        audioRef.current = null;
      }
      ambientSound.resume();
    };
  }, []);

  // Helper formatting for seconds to M:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`haunted-voice-widget state-${playbackState} ${className}`}
      style={style}
      role="region"
      aria-label="Haunted Voice Transmission Control"
    >
      <div className="haunted-voice-inner">
        {/* Transmission status indicator & Icon */}
        <div className="haunted-voice-meta">
          <div className="haunted-voice-badge">
            <Radio size={14} className={playbackState === 'playing' ? 'icon-pulse' : ''} />
            <span className="haunted-voice-tag">TRANSMISSION</span>
          </div>

          <span className="haunted-voice-title">
            {playbackState === 'playing' && 'Listening to Haunted Voice'}
            {playbackState === 'paused' && 'Transmission Paused'}
            {playbackState === 'ended' && 'Transmission Complete'}
            {playbackState === 'loading' && 'Establishing Link...'}
            {playbackState === 'unavailable' && 'Frequency Silent'}
            {playbackState === 'idle' && 'Haunted Voice Available'}
          </span>

          {/* Time tracker when playing or paused */}
          {(playbackState === 'playing' || playbackState === 'paused' || playbackState === 'ended') && duration > 0 && (
            <span className="haunted-voice-time" aria-live="off">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="haunted-voice-controls">
          {playbackState === 'idle' && (
            <button
              type="button"
              onClick={handlePlay}
              className="haunted-btn haunted-btn-play"
              aria-label="Play Haunted Voice Recording"
              title="Activate the cinematic haunted voice recording"
            >
              <Play size={14} />
              <span>Hear Voice</span>
            </button>
          )}

          {playbackState === 'loading' && (
            <button
              type="button"
              disabled
              className="haunted-btn haunted-btn-loading"
              aria-label="Loading audio"
            >
              <div className="haunted-spinner" />
              <span>Connecting...</span>
            </button>
          )}

          {playbackState === 'playing' && (
            <>
              <button
                type="button"
                onClick={handlePause}
                className="haunted-btn haunted-btn-pause"
                aria-label="Pause Haunted Voice"
                title="Pause playback"
              >
                <Pause size={14} />
                <span>Pause</span>
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="haunted-btn haunted-btn-stop"
                aria-label="Stop Haunted Voice"
                title="Stop playback immediately"
              >
                <Square size={14} />
                <span>Stop</span>
              </button>
            </>
          )}

          {playbackState === 'paused' && (
            <>
              <button
                type="button"
                onClick={handleResume}
                className="haunted-btn haunted-btn-resume"
                aria-label="Resume Haunted Voice"
                title="Resume playback"
              >
                <Play size={14} />
                <span>Resume</span>
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="haunted-btn haunted-btn-stop"
                aria-label="Stop Haunted Voice"
                title="Stop playback"
              >
                <Square size={14} />
                <span>Stop</span>
              </button>
            </>
          )}

          {playbackState === 'ended' && (
            <button
              type="button"
              onClick={handleReplay}
              className="haunted-btn haunted-btn-replay"
              aria-label="Replay Haunted Voice"
              title="Play recording again from beginning"
            >
              <RotateCcw size={14} />
              <span>Replay</span>
            </button>
          )}

          {playbackState === 'unavailable' && (
            <button
              type="button"
              onClick={handlePlay}
              className="haunted-btn haunted-btn-retry"
              aria-label="Retry loading Haunted Voice"
              title="Check for audio recording again"
            >
              <RotateCcw size={14} />
              <span>Check Audio</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtle notification if audio file is not yet uploaded */}
      {errorMessage && (
        <div className="haunted-voice-notice" role="status">
          <AlertCircle size={12} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
