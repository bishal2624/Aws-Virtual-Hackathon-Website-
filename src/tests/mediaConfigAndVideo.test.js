import { describe, it, expect } from 'vitest';
import {
  MEDIA_CONFIG,
  getAssetUrl,
  getIntroVideoUrl,
  getIntroPosterUrl,
  getJokerVideoUrl,
  getJokerPosterUrl
} from '../config/media';

describe('Media Configuration', () => {
  it('defines valid dimensions and paths for intro video', () => {
    expect(MEDIA_CONFIG.intro.id).toBe('horror-intro');
    expect(MEDIA_CONFIG.intro.width).toBe(1920);
    expect(MEDIA_CONFIG.intro.height).toBe(1080);
    expect(MEDIA_CONFIG.intro.aspectRatio).toBe('16/9');
    expect(MEDIA_CONFIG.intro.videoRelativePath).toBe('assets/videos/horror-intro.mp4');
    expect(MEDIA_CONFIG.intro.posterRelativePath).toBe('assets/videos/horror-intro-poster.jpg');
  });

  it('defines valid dimensions and focal points for joker background video', () => {
    expect(MEDIA_CONFIG.joker.id).toBe('joker-background');
    expect(MEDIA_CONFIG.joker.width).toBe(1080);
    expect(MEDIA_CONFIG.joker.height).toBe(1920);
    expect(MEDIA_CONFIG.joker.aspectRatio).toBe('9/16');
    expect(MEDIA_CONFIG.joker.videoRelativePath).toBe('assets/videos/joker-background.mp4');
    expect(MEDIA_CONFIG.joker.posterRelativePath).toBe('assets/videos/joker-background-poster.jpg');
    expect(MEDIA_CONFIG.joker.objectPosition.desktop).toBeDefined();
    expect(MEDIA_CONFIG.joker.objectPosition.mobile).toBeDefined();
  });

  it('builds public URLs starting with base path and includes version query if provided', () => {
    const url = getAssetUrl('assets/videos/horror-intro.mp4', '1.0.0');
    expect(url).toContain('assets/videos/horror-intro.mp4?v=1.0.0');

    const unversioned = getAssetUrl('assets/videos/horror-intro.mp4');
    expect(unversioned).toContain('assets/videos/horror-intro.mp4');
    expect(unversioned).not.toContain('?v=');
  });

  it('exports helper functions that return string URLs', () => {
    expect(typeof getIntroVideoUrl()).toBe('string');
    expect(getIntroVideoUrl()).toContain('horror-intro.mp4');

    expect(typeof getIntroPosterUrl()).toBe('string');
    expect(getIntroPosterUrl()).toContain('horror-intro-poster.jpg');

    expect(typeof getJokerVideoUrl()).toBe('string');
    expect(getJokerVideoUrl()).toContain('joker-background.mp4');

    expect(typeof getJokerPosterUrl()).toBe('string');
    expect(getJokerPosterUrl()).toContain('joker-background-poster.jpg');
  });
});
