/**
 * Vanilla port of useEditState from packages/tinacms/src/react.tsx.
 * Pings the parent window with `{type:'isEditMode'}` and resolves true if
 * the admin replies `{type:'tina:editMode'}` within the timeout.
 *
 * Default timeout is short (500ms) — when the page is loaded standalone
 * (not in the admin iframe) the parent never responds, so we resolve false
 * and exit silently. No JS runs after that.
 */
const EDIT_MODE_TIMEOUT_MS = 500;

export function initEditMode(timeoutMs = EDIT_MODE_TIMEOUT_MS): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.parent === window) return Promise.resolve(false);

  return new Promise((resolve) => {
    let settled = false;
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'tina:editMode') {
        settled = true;
        window.removeEventListener('message', onMessage);
        resolve(true);
      }
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'isEditMode' }, window.location.origin);

    setTimeout(() => {
      if (settled) return;
      window.removeEventListener('message', onMessage);
      resolve(false);
    }, timeoutMs);
  });
}
