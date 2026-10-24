import React, { useEffect, useRef } from 'react';
import { getHauntedVoiceAudioUrl } from '../../config/media';
import { hauntedVoiceManager } from '../../utils/hauntedVoiceManager';

/**
 * Headless Haunted Voice Audio Controller.
 * Zero UI - bridges with the authoritative hauntedVoiceManager singleton.
 *
 * Guarantees:
 * - Load exclusively from: public/assets/audio/haunted-voice.mp3 (/assets/audio/haunted-voice.mp3)
 * - Single authoritative Audio instance across all routes (/ and /hack)
 * - Never restarts or interrupts across route changes
 * - Handles Sound On/Off gracefully
 * - No looping, no obsolete narration sources
 */
export default function HauntedVoice({
  src,
  isSoundEnabled = true,
  onPlaybackStarted
}) {
  const audioUrl = src || getHauntedVoiceAudioUrl();
  const onPlaybackStartedRef = useRef(onPlaybackStarted);

  useEffect(() => {
    onPlaybackStartedRef.current = onPlaybackStarted;
  }, [onPlaybackStarted]);

  // Synchronize isSoundEnabled prop with hauntedVoiceManager
  useEffect(() => {
    hauntedVoiceManager.setSoundEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  // Listen to playback state changes
  useEffect(() => {
    const unsubscribe = hauntedVoiceManager.subscribe((state) => {
      if (state.isPlaying && onPlaybackStartedRef.current) {
        onPlaybackStartedRef.current();
      }
    });

    // Attempt initial playback if enabled
    if (isSoundEnabled) {
      hauntedVoiceManager.attemptAutoplay();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Hidden audio element for reliable DOM presence and inspection
  return (
    <audio
      id="haunted-voice-audio"
      src={audioUrl}
      preload="auto"
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  );
}
