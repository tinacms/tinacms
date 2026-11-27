import { useSyncExternalStore } from 'react';

const SHORT_QUERY = '(max-height: 400px)';
// A keyboard that only shrinks the visual viewport leaves the layout viewport tall.
const KEYBOARD_MIN_SHRINK = 120;

const isEditable = (element: Element | null) =>
  element instanceof HTMLElement &&
  (element.isContentEditable ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLInputElement &&
      !['button', 'checkbox', 'radio', 'submit'].includes(element.type)));

function subscribe(notify: () => void) {
  document.addEventListener('focusin', notify);
  document.addEventListener('focusout', notify);
  window.visualViewport?.addEventListener('resize', notify);
  return () => {
    document.removeEventListener('focusin', notify);
    document.removeEventListener('focusout', notify);
    window.visualViewport?.removeEventListener('resize', notify);
  };
}

function keyboardOpen() {
  if (!isEditable(document.activeElement)) return false;
  const visual = window.visualViewport;
  const shrunk = visual
    ? window.innerHeight - visual.height >= KEYBOARD_MIN_SHRINK
    : false;
  return shrunk || window.matchMedia(SHORT_QUERY).matches;
}

/**
 * True while an editable field has focus on a screen the keyboard has shrunk, as a short
 * window or as a visual viewport. A short screen alone is just landscape. It is true for
 * any editable, so check that the element you care about has focus too.
 */
export function useKeyboardOpen(): boolean {
  return useSyncExternalStore(subscribe, keyboardOpen, () => false);
}
