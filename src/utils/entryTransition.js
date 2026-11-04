/**
 * Cinematic entry transition timing and media cleanup helpers.
 * Shared by App.jsx and the automated tests so the tests exercise real code.
 */

export const COVERING_DURATION_MS = 520;
export const REVEAL_DURATION_MS = 400;
export const TOTAL_TRANSITION_MS = COVERING_DURATION_MS + REVEAL_DURATION_MS;

/**
 * Releases a video element's decoder and network resources.
 * Returns true when an element was released.
 */
export function releaseVideoElement(videoEl) {
  if (!videoEl) return false;

  try {
    videoEl.pause();
    videoEl.removeAttribute('src');

    const sources = typeof videoEl.querySelectorAll === 'function'
      ? videoEl.querySelectorAll('source')
      : [];
    sources.forEach((source) => source.removeAttribute('src'));

    if (typeof videoEl.load === 'function') {
      videoEl.load();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Finds and releases the full-screen intro video, if present.
 */
export function releaseIntroVideoElement(root = typeof document !== 'undefined' ? document : null) {
  if (!root || typeof root.querySelector !== 'function') return false;
  const videoEl = root.querySelector('.intro-fullscreen-video-bg video');
  return releaseVideoElement(videoEl);
}
