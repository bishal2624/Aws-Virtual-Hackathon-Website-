import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

let scrollLockCount = 0;
let previousBodyOverflow = '';

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
}

/**
 * Traps keyboard focus inside an open dialog, closes on Escape, and restores
 * focus to the element that opened the dialog when it unmounts.
 *
 * Attach the returned ref to the dialog's content container.
 */
export function useDialogFocusTrap(isOpen, { onEscape, lockScroll = true } = {}) {
  const containerRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
      .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');

    const firstFocusable = getFocusable()[0];
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    if (lockScroll) lockBodyScroll();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        if (onEscapeRef.current) onEscapeRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (lockScroll) unlockBodyScroll();

      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [isOpen, lockScroll]);

  return containerRef;
}
