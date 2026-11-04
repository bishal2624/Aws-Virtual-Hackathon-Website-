import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MEDIA_CONFIG, getHauntedVoiceAudioUrl } from '../config/media';
import { hauntedVoiceManager } from '../utils/hauntedVoiceManager';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

class MockAudio {
  static instances = [];

  constructor() {
    MockAudio.instances.push(this);
    this.id = '';
    this.src = '';
    this.preload = '';
    this.loop = false;
    this.currentTime = 0;
    this.duration = 374.87;
    this.paused = true;
    this.ended = false;
    this.listeners = {};

    this.addEventListener = vi.fn((event, callback) => {
      (this.listeners[event] ||= []).push(callback);
    });
    this.removeEventListener = vi.fn((event, callback) => {
      this.listeners[event] = (this.listeners[event] || []).filter((fn) => fn !== callback);
    });
    this.play = vi.fn(() => {
      this.paused = false;
      this.ended = false;
      this.emit('play');
      return Promise.resolve();
    });
    this.pause = vi.fn(() => {
      this.paused = true;
      this.emit('pause');
    });
  }

  emit(event) {
    (this.listeners[event] || []).slice().forEach((callback) => callback());
  }
}

function createWindowMock() {
  const listeners = {};
  return {
    listeners,
    addEventListener: vi.fn((event, callback) => {
      (listeners[event] ||= []).push(callback);
    }),
    removeEventListener: vi.fn((event, callback) => {
      listeners[event] = (listeners[event] || []).filter((fn) => fn !== callback);
    }),
    __hauntedVoiceAudio: undefined
  };
}

function dispatchWindowEvent(windowMock, event) {
  (windowMock.listeners[event] || []).slice().forEach((callback) => callback());
}

describe('Haunted Voice Manager', () => {
  let windowMock;

  beforeEach(() => {
    windowMock = createWindowMock();
    globalThis.window = windowMock;
    globalThis.Audio = MockAudio;
    MockAudio.instances = [];
    hauntedVoiceManager.resetForTesting();
    hauntedVoiceManager.isSoundEnabled = true;
  });

  afterEach(() => {
    hauntedVoiceManager.resetForTesting();
    delete globalThis.window;
    delete globalThis.Audio;
  });

  it('points to the authentic public audio path', () => {
    expect(MEDIA_CONFIG.hauntedVoice.id).toBe('haunted-voice');
    expect(MEDIA_CONFIG.hauntedVoice.audioRelativePath).toBe('assets/audio/haunted-voice.mp3');
    expect(getHauntedVoiceAudioUrl()).toContain('assets/audio/haunted-voice.mp3');
  });

  it('creates exactly one Audio instance and binds listeners only once', () => {
    const first = hauntedVoiceManager.getAudioInstance();
    const second = hauntedVoiceManager.getAudioInstance();

    expect(first).toBe(second);
    expect(MockAudio.instances).toHaveLength(1);
    expect(first.src).toContain('haunted-voice.mp3');
    expect(first.loop).toBe(false);

    // play, pause, and ended listeners bound once despite repeated getAudioInstance calls
    expect(first.addEventListener).toHaveBeenCalledTimes(3);
    expect(first.addEventListener.mock.calls.map(([event]) => event).sort()).toEqual(['ended', 'pause', 'play']);
  });

  it('attempts autoplay once and does not restart while already playing', async () => {
    hauntedVoiceManager.attemptAutoplay();
    await flushPromises();

    const audio = hauntedVoiceManager.getAudioInstance();
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(audio.paused).toBe(false);
    expect(hauntedVoiceManager.getState().isPlaying).toBe(true);

    hauntedVoiceManager.attemptAutoplay();
    await flushPromises();
    expect(audio.play).toHaveBeenCalledTimes(1);
  });

  it('sets up a one-time interaction fallback when autoplay is blocked', async () => {
    const audio = hauntedVoiceManager.getAudioInstance();
    audio.play.mockRejectedValueOnce(Object.assign(new Error('Autoplay blocked'), { name: 'NotAllowedError' }));

    hauntedVoiceManager.attemptAutoplay();
    await flushPromises();

    expect(windowMock.listeners.click).toHaveLength(1);
    expect(audio.play).toHaveBeenCalledTimes(1);

    dispatchWindowEvent(windowMock, 'click');
    await flushPromises();

    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(windowMock.listeners.click).toHaveLength(0);
    expect(hauntedVoiceManager.getState().isPlaying).toBe(true);
  });

  it('pauses immediately, preserves position, and cancels fallback when sound is turned off', async () => {
    hauntedVoiceManager.attemptAutoplay();
    await flushPromises();

    const audio = hauntedVoiceManager.getAudioInstance();
    audio.currentTime = 42.5;

    hauntedVoiceManager.setSoundEnabled(false);

    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(42.5);
    expect(hauntedVoiceManager.getState().isPlaying).toBe(false);
    expect(hauntedVoiceManager.getState().isExplicitlyStopped).toBe(true);
    expect(windowMock.listeners.click || []).toHaveLength(0);
  });

  it('does not create an Audio instance when sound is disabled before playback', () => {
    hauntedVoiceManager.setSoundEnabled(false);

    expect(MockAudio.instances).toHaveLength(0);
    expect(hauntedVoiceManager.getState().isSoundEnabled).toBe(false);
  });

  it('resumes from the preserved position on Sound On, and never replays after finishing', async () => {
    hauntedVoiceManager.attemptAutoplay();
    await flushPromises();

    const audio = hauntedVoiceManager.getAudioInstance();
    audio.currentTime = 42.5;

    hauntedVoiceManager.setSoundEnabled(false);
    hauntedVoiceManager.setSoundEnabled(true);
    await flushPromises();

    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(audio.currentTime).toBe(42.5);
    expect(hauntedVoiceManager.getState().isPlaying).toBe(true);

    // Simulate natural completion
    audio.paused = true;
    audio.ended = true;
    audio.emit('ended');
    audio.play.mockClear();

    hauntedVoiceManager.setSoundEnabled(false);
    hauntedVoiceManager.setSoundEnabled(true);
    await flushPromises();

    expect(audio.play).not.toHaveBeenCalled();
    expect(hauntedVoiceManager.getState().isFinished).toBe(true);
  });

  it('catches rejected play promises without throwing unhandled exceptions', async () => {
    const audio = hauntedVoiceManager.getAudioInstance();
    audio.play.mockRejectedValueOnce(new Error('Network error or decode failure'));

    expect(() => hauntedVoiceManager.attemptAutoplay()).not.toThrow();
    await flushPromises();
    expect(hauntedVoiceManager.getState().isPlaying).toBe(false);
  });
});
