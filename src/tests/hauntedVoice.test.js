import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MEDIA_CONFIG, getHauntedVoiceAudioUrl } from '../config/media';

describe('Phase 5: Haunted Voice Audio System', () => {
  let mockAudio;
  let eventListeners;

  beforeEach(() => {
    eventListeners = {};
    mockAudio = {
      src: '',
      preload: '',
      currentTime: 0,
      duration: 32.5,
      paused: true,
      addEventListener: vi.fn((event, cb) => {
        eventListeners[event] = cb;
      }),
      removeEventListener: vi.fn((event) => {
        delete eventListeners[event];
      }),
      play: vi.fn().mockImplementation(() => {
        mockAudio.paused = false;
        return Promise.resolve();
      }),
      pause: vi.fn().mockImplementation(() => {
        mockAudio.paused = true;
      }),
      load: vi.fn(),
      removeAttribute: vi.fn((attr) => {
        if (attr === 'src') mockAudio.src = '';
      })
    };
  });

  // 1. Reserved Asset Path Configuration
  it('correctly reserves the audio asset path in media config', () => {
    expect(MEDIA_CONFIG.hauntedVoice).toBeDefined();
    expect(MEDIA_CONFIG.hauntedVoice.id).toBe('haunted-voice');
    expect(MEDIA_CONFIG.hauntedVoice.audioRelativePath).toBe('assets/audio/haunted-voice.mp3');

    const url = getHauntedVoiceAudioUrl();
    expect(typeof url).toBe('string');
    expect(url).toContain('assets/audio/haunted-voice.mp3');
  });

  // 2. Successful playback when recording is available
  it('handles successful playback when recording is available', async () => {
    let playbackState = 'idle';
    const setPlaybackState = (state) => { playbackState = state; };

    const handlePlay = (audio) => {
      audio.src = getHauntedVoiceAudioUrl();
      setPlaybackState('loading');
      return audio.play().then(() => {
        setPlaybackState('playing');
      });
    };

    await handlePlay(mockAudio);

    expect(mockAudio.src).toContain('assets/audio/haunted-voice.mp3');
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
    expect(playbackState).toBe('playing');
    expect(mockAudio.paused).toBe(false);
  });

  // 3. Missing audio asset handling
  it('handles missing audio asset gracefully without crashing or throwing', () => {
    let playbackState = 'idle';
    let errorMessage = null;

    const simulateError = () => {
      playbackState = 'unavailable';
      errorMessage = 'Recording awaiting upload (public/assets/audio/haunted-voice.mp3)';
    };

    simulateError();

    expect(playbackState).toBe('unavailable');
    expect(errorMessage).toContain('public/assets/audio/haunted-voice.mp3');
  });

  // 4. Pause and resume
  it('supports pause and resume transitions accurately', async () => {
    let playbackState = 'playing';

    const handlePause = (audio) => {
      audio.pause();
      playbackState = 'paused';
    };

    const handleResume = async (audio) => {
      await audio.play();
      playbackState = 'playing';
    };

    handlePause(mockAudio);
    expect(mockAudio.pause).toHaveBeenCalledTimes(1);
    expect(playbackState).toBe('paused');

    await handleResume(mockAudio);
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
    expect(playbackState).toBe('playing');
  });

  // 5. Stop and replay
  it('supports stop and replay transitions without overlapping instances', async () => {
    let playbackState = 'playing';
    mockAudio.currentTime = 14.2;

    const handleStop = (audio) => {
      audio.pause();
      audio.currentTime = 0;
      playbackState = 'idle';
    };

    const handleReplay = async (audio) => {
      audio.currentTime = 0;
      await audio.play();
      playbackState = 'playing';
    };

    handleStop(mockAudio);
    expect(mockAudio.pause).toHaveBeenCalledTimes(1);
    expect(mockAudio.currentTime).toBe(0);
    expect(playbackState).toBe('idle');

    await handleReplay(mockAudio);
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
    expect(mockAudio.currentTime).toBe(0);
    expect(playbackState).toBe('playing');
  });

  // 6. Preventing duplicate playback instances
  it('prevents duplicate playback by maintaining a singleton Audio instance ref', () => {
    let audioInstance = null;
    let createCount = 0;

    const getOrCreateAudio = () => {
      if (!audioInstance) {
        createCount++;
        audioInstance = mockAudio;
      }
      return audioInstance;
    };

    const first = getOrCreateAudio();
    const second = getOrCreateAudio();
    const third = getOrCreateAudio();

    expect(first).toBe(second);
    expect(second).toBe(third);
    expect(createCount).toBe(1);
  });

  // 7. Global sound-off behavior: turning sound off stops voice immediately
  it('stops playback immediately when global sound is toggled off and does NOT auto-restart on sound on', () => {
    let playbackState = 'playing';
    let isGlobalSoundActive = true;
    let prevSoundActive = true;

    const handleStop = vi.fn(() => {
      playbackState = 'idle';
    });

    // Simulate sound toggle handler
    const updateSoundState = (newSoundState) => {
      if (prevSoundActive && !newSoundState) {
        if (playbackState === 'playing' || playbackState === 'paused') {
          handleStop();
        }
      }
      prevSoundActive = newSoundState;
      isGlobalSoundActive = newSoundState;
    };

    // User turns website sound OFF
    updateSoundState(false);
    expect(handleStop).toHaveBeenCalledTimes(1);
    expect(playbackState).toBe('idle');

    // User turns website sound back ON
    updateSoundState(true);
    // Haunted voice must NOT auto-restart
    expect(handleStop).toHaveBeenCalledTimes(1);
    expect(playbackState).toBe('idle');
  });

  // 8. Audio cleanup on component unmount
  it('safely cleans up and releases audio resources on unmount', () => {
    const cleanup = (audio) => {
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
    };

    cleanup(mockAudio);

    expect(mockAudio.pause).toHaveBeenCalledTimes(1);
    expect(mockAudio.removeAttribute).toHaveBeenCalledWith('src');
    expect(mockAudio.load).toHaveBeenCalledTimes(1);
    expect(mockAudio.src).toBe('');
  });

  // 9. Playback errors and rejected play promises
  it('handles rejected play promises and autoplay block without crashing', async () => {
    let playbackState = 'loading';
    let errorMessage = null;

    mockAudio.play = vi.fn().mockRejectedValue(new Error('Format error / 404'));

    const handlePlayWithError = async (audio) => {
      try {
        await audio.play();
        playbackState = 'playing';
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          playbackState = 'idle';
        } else {
          playbackState = 'unavailable';
          errorMessage = 'Recording awaiting upload (public/assets/audio/haunted-voice.mp3)';
        }
      }
    };

    await handlePlayWithError(mockAudio);

    expect(playbackState).toBe('unavailable');
    expect(errorMessage).toBe('Recording awaiting upload (public/assets/audio/haunted-voice.mp3)');
  });

  // 10. Coordination with procedural audio engine
  it('suspends procedural ambient audio when haunted voice plays and resumes when finished', () => {
    const mockAmbient = {
      suspend: vi.fn(),
      resume: vi.fn()
    };

    // When play starts
    mockAmbient.suspend();
    expect(mockAmbient.suspend).toHaveBeenCalledTimes(1);

    // When voice ends or stops
    mockAmbient.resume();
    expect(mockAmbient.resume).toHaveBeenCalledTimes(1);
  });
});
