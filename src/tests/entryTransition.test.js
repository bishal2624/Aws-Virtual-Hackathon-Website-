import { describe, it, expect, vi } from 'vitest';
import {
  COVERING_DURATION_MS,
  REVEAL_DURATION_MS,
  TOTAL_TRANSITION_MS,
  releaseVideoElement,
  releaseIntroVideoElement
} from '../utils/entryTransition';

describe('Phase 3 Cinematic Entry Transition Logic', () => {
  it('conforms to the 700ms - 1000ms total transition duration requirement', () => {
    expect(TOTAL_TRANSITION_MS).toBe(COVERING_DURATION_MS + REVEAL_DURATION_MS);
    expect(TOTAL_TRANSITION_MS).toBeGreaterThanOrEqual(700);
    expect(TOTAL_TRANSITION_MS).toBeLessThanOrEqual(1000);
    expect(TOTAL_TRANSITION_MS).toBe(920);
  });

  it('releases the hardware video decoder by pausing, stripping src, and calling load()', () => {
    const mockSources = [
      { removeAttribute: vi.fn() },
      { removeAttribute: vi.fn() }
    ];
    const mockVideo = {
      pause: vi.fn(),
      removeAttribute: vi.fn(),
      querySelectorAll: vi.fn().mockReturnValue(mockSources),
      load: vi.fn()
    };

    expect(releaseVideoElement(mockVideo)).toBe(true);

    expect(mockVideo.pause).toHaveBeenCalledTimes(1);
    expect(mockVideo.removeAttribute).toHaveBeenCalledWith('src');
    expect(mockSources[0].removeAttribute).toHaveBeenCalledWith('src');
    expect(mockSources[1].removeAttribute).toHaveBeenCalledWith('src');
    expect(mockVideo.load).toHaveBeenCalledTimes(1);
  });

  it('finds the intro video inside the full-screen background container', () => {
    const mockVideo = {
      pause: vi.fn(),
      removeAttribute: vi.fn(),
      querySelectorAll: vi.fn().mockReturnValue([]),
      load: vi.fn()
    };
    const root = {
      querySelector: vi.fn().mockReturnValue(mockVideo)
    };

    expect(releaseIntroVideoElement(root)).toBe(true);
    expect(root.querySelector).toHaveBeenCalledWith('.intro-fullscreen-video-bg video');
    expect(mockVideo.pause).toHaveBeenCalledTimes(1);
  });

  it('is safe when no video or DOM root is present', () => {
    expect(releaseVideoElement(null)).toBe(false);
    expect(releaseIntroVideoElement(null)).toBe(false);
    expect(releaseIntroVideoElement({ querySelector: () => null })).toBe(false);
  });

  it('returns false instead of throwing when media APIs fail', () => {
    const brokenVideo = {
      pause: () => { throw new Error('decoder error'); },
      removeAttribute: vi.fn(),
      querySelectorAll: vi.fn(),
      load: vi.fn()
    };

    expect(releaseVideoElement(brokenVideo)).toBe(false);
  });
});
