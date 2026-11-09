import { useSyncExternalStore } from 'react';

// Below this width the form bar spans the screen and a toast in the corner would
// cover Save, so toasts stack their actions.
const NARROW_QUERY = '(max-width: 1023px)';
const SHORT_QUERY = '(max-height: 400px)';
// A keyboard that only shrinks the visual viewport leaves the layout viewport tall.
const KEYBOARD_MIN_SHRINK = 120;

const useMedia = (query: string) =>
  useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false
  );

export const useNarrow = () => useMedia(NARROW_QUERY);

const isEditable = (element: Element | null) =>
  element instanceof HTMLElement &&
  (element.isContentEditable ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLInputElement &&
      !['button', 'checkbox', 'radio', 'submit'].includes(element.type)));

function subscribeKeyboard(notify: () => void) {
  document.addEventListener('focusin', notify);
  document.addEventListener('focusout', notify);
  window.visualViewport?.addEventListener('resize', notify);
  return () => {
    document.removeEventListener('focusin', notify);
    document.removeEventListener('focusout', notify);
    window.visualViewport?.removeEventListener('resize', notify);
  };
}

// True while an editable field has focus on a screen the keyboard has shrunk, as a
// short window or as a visual viewport. A short screen alone is just landscape.
function keyboardOpen() {
  if (!isEditable(document.activeElement)) return false;
  const visual = window.visualViewport;
  const shrunk = visual
    ? window.innerHeight - visual.height >= KEYBOARD_MIN_SHRINK
    : false;
  return shrunk || window.matchMedia(SHORT_QUERY).matches;
}

export const useKeyboardOpen = () =>
  useSyncExternalStore(subscribeKeyboard, keyboardOpen, () => false);
