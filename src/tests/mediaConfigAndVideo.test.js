import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  MEDIA_CONFIG,
  getAssetUrl,
  getIntroVideoUrl,
  getIntroPosterUrl,
  getHauntedVoiceAudioUrl
} from '../config/media';

const publicFile = (relativePath) => path.resolve(process.cwd(), 'public', relativePath);

describe('Media Configuration', () => {
  it('defines valid dimensions and paths for intro video', () => {
    expect(MEDIA_CONFIG.intro.id).toBe('horror-intro');
    expect(MEDIA_CONFIG.intro.width).toBe(1920);
    expect(MEDIA_CONFIG.intro.height).toBe(1080);
    expect(MEDIA_CONFIG.intro.aspectRatio).toBe('16/9');
    expect(MEDIA_CONFIG.intro.videoRelativePath).toBe('assets/videos/horror-intro.mp4');
    expect(MEDIA_CONFIG.intro.posterRelativePath).toBe('assets/videos/horror-intro-poster.jpg');
  });

  it('does not retain the unused Joker background asset', () => {
    expect(MEDIA_CONFIG.joker).toBeUndefined();
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

    expect(typeof getHauntedVoiceAudioUrl()).toBe('string');
    expect(getHauntedVoiceAudioUrl()).toContain('haunted-voice.mp3');
  });

  it('references media files that actually exist in public/', () => {
    expect(fs.existsSync(publicFile(MEDIA_CONFIG.intro.videoRelativePath))).toBe(true);
    expect(fs.existsSync(publicFile(MEDIA_CONFIG.intro.posterRelativePath))).toBe(true);
    expect(fs.existsSync(publicFile(MEDIA_CONFIG.hauntedVoice.audioRelativePath))).toBe(true);
  });
});
