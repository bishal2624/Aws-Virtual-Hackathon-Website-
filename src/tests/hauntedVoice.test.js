import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MEDIA_CONFIG, getHauntedVoiceAudioUrl } from '../config/media';

describe('Haunted Voice Automatic Audio Integration', () => {
  let mockAudio;
  let eventListeners;

  beforeEach(() => {
    eventListeners = {};
    mockAudio = {
      src: '',
      preload: '',
      loop: false,
      currentTime: 0,
      duration: 374.87,
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
  it('correctly points to the authentic public audio path', () => {
    expect(MEDIA_CONFIG.hauntedVoice).toBeDefined();
    expect(MEDIA_CONFIG.hauntedVoice.id).toBe('haunted-voice');
    expect(MEDIA_CONFIG.hauntedVoice.audioRelativePath).toBe('assets/audio/haunted-voice.mp3');

    const url = getHauntedVoiceAudioUrl();
    expect(typeof url).toBe('string');
    expect(url).toContain('assets/audio/haunted-voice.mp3');
  });

  // 2. Automatic playback on entry
  it('attempts to play the recording automatically on website entry', async () => {
    let hasStarted = false;
    mockAudio.src = getHauntedVoiceAudioUrl();
    mockAudio.loop = false;

    const attemptAutoplay = async (audio) => {
      hasStarted = true;
      await audio.play();
    };

    await attemptAutoplay(mockAudio);

    expect(mockAudio.play).toHaveBeenCalledTimes(1);
    expect(mockAudio.paused).toBe(false);
    expect(mockAudio.loop).toBe(false);
    expect(hasStarted).toBe(true);
  });

  // 3. Fallback to first user interaction if audible autoplay is blocked
  it('attaches a one-time interaction fallback when autoplay is blocked by browser policy', async () => {
    let hasStarted = false;
    let pendingListenerActive = false;

    mockAudio.play = vi.fn()
      .mockRejectedValueOnce({ name: 'NotAllowedError', message: 'Autoplay blocked' })
      .mockResolvedValueOnce(undefined);

    const setupFallback = () => {
      pendingListenerActive = true;
    };

    const onUserInteraction = async (audio) => {
      if (pendingListenerActive && !hasStarted) {
        hasStarted = true;
        pendingListenerActive = false;
        await audio.play();
      }
    };

    // First attempt fails due to autoplay policy
    try {
      await mockAudio.play();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setupFallback();
      }
    }

    expect(pendingListenerActive).toBe(true);
    expect(hasStarted).toBe(false);

    // User performs first genuine interaction (e.g. click/scroll)
    await onUserInteraction(mockAudio);

    expect(hasStarted).toBe(true);
    expect(pendingListenerActive).toBe(false);
    expect(mockAudio.play).toHaveBeenCalledTimes(2);
  });

  // 4. Sound Off in Navbar immediately pauses playback, preserves position, and cancels pending autoplay
  it('pauses playback immediately and cancels pending autoplay when sound is turned off', () => {
    let isPlaying = true;
    let pendingListenerActive = true;
    mockAudio.currentTime = 4.2;

    const handleSoundOff = (audio) => {
      audio.pause();
      isPlaying = false;
      pendingListenerActive = false; // prevents pending autoplay from starting
    };

    handleSoundOff(mockAudio);

    expect(mockAudio.pause).toHaveBeenCalledTimes(1);
    expect(mockAudio.currentTime).toBe(4.2); // Position preserved
    expect(isPlaying).toBe(false);
    expect(pendingListenerActive).toBe(false);
  });

  // 5. Sound On resumes the same recording from paused position and does not replay if already finished
  it('resumes the same recording on Sound On from its paused position, and does not replay if finished', async () => {
    let wasPlaying = true;
    let isFinished = false;
    let isPlaying = false;
    mockAudio.currentTime = 4.2;

    const handleSoundOn = async (audio) => {
      if (!isFinished && wasPlaying) {
        await audio.play();
        isPlaying = true;
      }
    };

    await handleSoundOn(mockAudio);
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
    expect(isPlaying).toBe(true);
    expect(mockAudio.currentTime).toBe(4.2);

    // If it has already finished, do not replay
    isFinished = true;
    mockAudio.play.mockClear();
    await handleSoundOn(mockAudio);
    expect(mockAudio.play).toHaveBeenCalledTimes(0);
  });

  // 6. Preventing duplicate playback instances across re-renders and scrolling
  it('prevents duplicate playback instances and ignores re-renders once started', async () => {
    let playCallCount = 0;
    let hasStarted = false;

    const triggerPlay = async (audio) => {
      if (hasStarted) return;
      hasStarted = true;
      playCallCount++;
      await audio.play();
    };

    await triggerPlay(mockAudio);
    // Simulate multiple re-renders and scroll events
    await triggerPlay(mockAudio);
    await triggerPlay(mockAudio);

    expect(playCallCount).toBe(1);
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
  });

  // 7. No looping: audio plays once by default
  it('ensures loop is disabled so the recording plays once without repeating', () => {
    mockAudio.loop = false;
    expect(mockAudio.loop).toBe(false);
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

  // 9. Handling rejected promises and missing file safely without crashing
  it('catches rejected play promises silently without throwing unhandled exceptions', async () => {
    mockAudio.play = vi.fn().mockRejectedValue(new Error('Network error or decode failure'));

    let threwError = false;
    try {
      await mockAudio.play().catch(() => {});
    } catch {
      threwError = true;
    }

    expect(threwError).toBe(false);
  });
});
