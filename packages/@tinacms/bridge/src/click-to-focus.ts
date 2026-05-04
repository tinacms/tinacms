/**
 * Vanilla port of useTina's quick-edit click handler from
 * packages/tinacms/src/react.tsx.
 *
 * Behaviour difference vs React useTina: the bridge defaults `enabled` to
 * true so links / buttons inside data-tina-field regions never accidentally
 * navigate while in the editor iframe. The React hook gates on
 * `quickEditEnabled` (admin-controlled), but that state is `false` for most
 * sidebar layouts and the resulting link-navigation behaviour is a
 * footgun in this example. The admin can still disable click capture by
 * sending `{type:'quickEditEnabled', value:false}`.
 */
import { debug } from './debug';
const STYLE_ID = '__tina-bridge-quick-edit-style';
const BODY_CLASS = '__tina-quick-editing-enabled';

const QUICK_EDIT_CSS = `
  [data-tina-field] {
    outline: 2px dashed rgba(34,150,254,0.5);
    transition: box-shadow ease-out 150ms;
  }
  [data-tina-field]:hover {
    box-shadow: inset 100vi 100vh rgba(34,150,254,0.3);
    outline: 2px solid rgba(34,150,254,1);
    cursor: pointer;
  }
  [data-tina-field-overlay] {
    outline: 2px dashed rgba(34,150,254,0.5);
    position: relative;
  }
  [data-tina-field-overlay]:hover {
    cursor: pointer;
    outline: 2px solid rgba(34,150,254,1);
  }
  [data-tina-field-overlay]::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 20;
    transition: opacity ease-out 150ms;
    background-color: rgba(34,150,254,0.3);
    opacity: 0;
  }
  [data-tina-field-overlay]:hover::after {
    opacity: 1;
  }
`;

export function initClickToFocus(): void {
  let enabled = true;

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
        window.location.origin,
      );
    },
    true,
  );

  // Optional admin override — the React hook also installs / removes the
  // visible outline based on this flag, so respect the visual side too.
  window.addEventListener('message', (event) => {
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
