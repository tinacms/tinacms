/**
 * Vanilla port of useTina's quick-edit click handler from
 * packages/tinacms/src/react.tsx (the mouseDownHandler block).
 *
 * - Adds the same dashed-outline overlay CSS the React hook installs.
 * - On click, finds `[data-tina-field]` (or `[data-tina-field-overlay]`) on
 *   the target or its ancestors and posts `{type:'field:selected', fieldName}`
 *   to the admin so the sidebar focuses the matching form field.
 * - Listens for `{type:'quickEditEnabled', value}` from the admin to toggle
 *   the overlay on/off, matching React behaviour.
 */
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
  let enabled = false;

  document.addEventListener(
    'click',
    (event) => {
      if (!enabled) return;
      const fieldName = resolveFieldName(event.target);
      if (!fieldName) return;
      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage(
        { type: 'field:selected', fieldName },
        window.location.origin,
      );
    },
    true,
  );

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
