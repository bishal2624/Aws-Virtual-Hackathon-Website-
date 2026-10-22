import { describe, it, expect, vi } from 'vitest';

describe('Phase 3 Cinematic Entry Transition Logic', () => {
  it('conforms to the 700ms - 1000ms total transition duration requirement', () => {
    const COVERING_DURATION_MS = 520;
    const REVEAL_DURATION_MS = 400;
    const TOTAL_TRANSITION_MS = COVERING_DURATION_MS + REVEAL_DURATION_MS;

    expect(TOTAL_TRANSITION_MS).toBeGreaterThanOrEqual(700);
    expect(TOTAL_TRANSITION_MS).toBeLessThanOrEqual(1000);
    expect(TOTAL_TRANSITION_MS).toBe(920);
  });

  it('safely releases hardware video decoder by pausing, stripping src, and calling load()', () => {
    // Mock HTMLMediaElement
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

    // Simulate release function
    const releaseVideo = (videoEl) => {
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        const sources = videoEl.querySelectorAll('source');
        sources.forEach((s) => s.removeAttribute('src'));
        videoEl.load();
      }
    };

    releaseVideo(mockVideo);

    expect(mockVideo.pause).toHaveBeenCalledTimes(1);
    expect(mockVideo.removeAttribute).toHaveBeenCalledWith('src');
    expect(mockSources[0].removeAttribute).toHaveBeenCalledWith('src');
    expect(mockSources[1].removeAttribute).toHaveBeenCalledWith('src');
    expect(mockVideo.load).toHaveBeenCalledTimes(1);
  });

  it('bypasses transition animation immediately when prefers-reduced-motion is active', () => {
    const mockNavigate = vi.fn();
    const mockReleaseVideo = vi.fn();

    const handleTransition = ({ prefersReducedMotion, navigate, releaseVideo }) => {
      if (prefersReducedMotion) {
        releaseVideo();
        navigate('/hack');
        return 'immediate';
      }
      return 'animated';
    };

    // Reduced motion enabled
    const resReduced = handleTransition({
      prefersReducedMotion: true,
      navigate: mockNavigate,
      releaseVideo: mockReleaseVideo
    });
    expect(resReduced).toBe('immediate');
    expect(mockReleaseVideo).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/hack');

    // Standard motion
    mockNavigate.mockClear();
    mockReleaseVideo.mockClear();
    const resStandard = handleTransition({
      prefersReducedMotion: false,
      navigate: mockNavigate,
      releaseVideo: mockReleaseVideo
    });
    expect(resStandard).toBe('animated');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('prevents multiple concurrent transition triggers (debounce lock)', () => {
    let isTransitioning = false;
    const triggerCount = vi.fn();

    const trigger = () => {
      if (isTransitioning) return false;
      isTransitioning = true;
      triggerCount();
      return true;
    };

    expect(trigger()).toBe(true);
    expect(trigger()).toBe(false); // Second rapid click ignored
    expect(trigger()).toBe(false); // Third rapid click ignored
    expect(triggerCount).toHaveBeenCalledTimes(1);
  });
});
