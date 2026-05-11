/**
 * Vanilla port of useTina's quick-edit click handler from
 * packages/tinacms/src/react.tsx. Click capture stays off until the admin
 * sends `{type:'quickEditEnabled', value:true}`, matching the React hook —
 * a frame outside the admin can't silently swallow clicks before the
 * admin opts in.
 */
import { getAdminOrigin, isFromAdmin } from './config';
import { debug } from './debug';
import {
  QUICK_EDIT_BODY_CLASS as BODY_CLASS,
  QUICK_EDIT_CSS,
  QUICK_EDIT_STYLE_ID as STYLE_ID,
} from './quick-edit-css';

export function initClickToFocus(): void {
  let enabled = false;

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      const tagName = target instanceof Element ? target.tagName : '?';
      if (!enabled) {
        debug('click ignored — quickEdit disabled', tagName);
        return;
      }
      const fieldName = resolveFieldName(target);
      if (!fieldName) {
        debug('click ignored — no data-tina-field ancestor for', tagName);
        return;
      }
      debug('click captured →', fieldName, '(target:', tagName, ')');
      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage(
        { type: 'field:selected', fieldName },
        getAdminOrigin()
      );
    },
    true
  );

  // Optional admin override — the React hook also installs / removes the
  // visible outline based on this flag, so respect the visual side too.
  window.addEventListener('message', (event) => {
    if (!isFromAdmin(event)) return;
    const message = event.data;
    if (!message || message.type !== 'quickEditEnabled') return;
    enabled = !!message.value;
    if (enabled) installStyle();
    else removeStyle();
  });
}

function resolveFieldName(target: EventTarget | null): string | null {
  const el = target instanceof Element ? target : null;
  if (!el) return null;

  const direct = readTinaField(el);
  if (direct) return direct;

  const ancestor = el.closest('[data-tina-field], [data-tina-field-overlay]');
  if (!ancestor) return null;
  return readTinaField(ancestor);
}

function readTinaField(el: Element): string | null {
  for (const name of el.getAttributeNames()) {
    if (name.startsWith('data-tina-field')) {
      const value = el.getAttribute(name);
      if (value) return value;
    }
  }
  return null;
}

function installStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = QUICK_EDIT_CSS;
  document.head.appendChild(style);
  document.body.classList.add(BODY_CLASS);
}

function removeStyle(): void {
  document.getElementById(STYLE_ID)?.remove();
  document.body.classList.remove(BODY_CLASS);
}
