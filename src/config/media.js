/**
 * Single source of truth for media configuration.
 * Strictly follows Section 2 and Section 3 of project requirements.
 * Resolves paths using import.meta.env.BASE_URL to support both root and non-root deployments.
 */

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';

/**
 * Normalizes and builds a public asset URL respecting Vite's base path.
 * @param {string} relativePath - Path relative to the public directory.
 * @param {string} [version] - Optional version query string for cache busting.
 * @returns {string} The resolved absolute public URL.
 */
export function getAssetUrl(relativePath, version) {
  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const url = `${cleanBase}${cleanPath}`;
  return version ? `${url}?v=${encodeURIComponent(version)}` : url;
}

export const MEDIA_CONFIG = {
  intro: {
    id: 'horror-intro',
    label: 'Cinematic Horror Intro Video',
    videoRelativePath: 'assets/videos/horror-intro.mp4',
    posterRelativePath: 'assets/videos/horror-intro-poster.jpg',
    webmRelativePath: null,
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    version: '1.0.0',
    objectFit: 'cover',
    objectPosition: {
      desktop: '28% center',
      tablet: '35% center',
      mobile: '48.5% 28%'
    }
  },
  joker: {
    id: 'joker-background',
    label: 'Joker Background Video',
    videoRelativePath: 'assets/videos/joker-background.mp4',
    posterRelativePath: 'assets/videos/joker-background-poster.jpg',
    webmRelativePath: null,
    width: 1080,
    height: 1920,
    aspectRatio: '9/16',
    version: '1.0.0',
    objectFit: 'cover',
    objectPosition: {
      desktop: 'center 20%',
      tablet: 'center 20%',
      mobile: 'center top'
    }
  },
  hauntedVoice: {
    id: 'haunted-voice',
    label: 'Cinematic Haunted Voice Recording',
    audioRelativePath: 'assets/audio/haunted-voice.mp3',
    version: null
  }
};

export function getIntroVideoUrl() {
  return getAssetUrl(MEDIA_CONFIG.intro.videoRelativePath, MEDIA_CONFIG.intro.version);
}

export function getIntroPosterUrl() {
  return getAssetUrl(MEDIA_CONFIG.intro.posterRelativePath, MEDIA_CONFIG.intro.version);
}

export function getJokerVideoUrl() {
  return getAssetUrl(MEDIA_CONFIG.joker.videoRelativePath, MEDIA_CONFIG.joker.version);
}

export function getJokerPosterUrl() {
  return getAssetUrl(MEDIA_CONFIG.joker.posterRelativePath, MEDIA_CONFIG.joker.version);
}

export function getHauntedVoiceAudioUrl() {
  return getAssetUrl(MEDIA_CONFIG.hauntedVoice.audioRelativePath, MEDIA_CONFIG.hauntedVoice.version);
}
