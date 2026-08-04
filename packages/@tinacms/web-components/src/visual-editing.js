// Vanilla-JS visual editing for a client-rendered site.
//
// The admin UI runs the preview site in an iframe and talks to it over
// `postMessage`. This module reimplements the exact protocol the React
// `useTina` hook uses (packages/tinacms/src/react.tsx), so the admin sees
// identical traffic:
//
//   1. `{type: 'open', id, query, variables, data}`  — announce the query
//   2. `{type: 'quick-edit', value}`                 — report that the DOM
//      has `[data-tina-field]` markers
//   3. `{type: 'quickEditEnabled', value}`           — admin toggles visual
//      editing; we enable the click-to-focus handler
//   4. `{type: 'updateData', id, data}`              — content edited in the
//      admin; we re-render the page
//   5. `{type: 'field:selected', fieldName}`         — user clicked a
//      `[data-tina-field]` element; admin opens that form field
//   6. `{type: 'close', id}`                         — page is going away
//
// Unlike React, we build the DOM by hand, and web components (like the
// `tina-markdown` rich-text renderer) render into shadow DOM. `closest()`
// cannot cross a shadow boundary, so the click handler walks
// `event.composedPath()` instead — the composed path includes every shadow
// host, which is where we attach the `data-tina-field` marker.

import { tinaField } from '@tinacms/bridge';

import {
  QUICK_EDIT_BODY_CLASS,
  QUICK_EDIT_CSS,
} from '@tinacms/bridge/quick-edit-css';

import { addMetadata, hashFromQuery } from '@tinacms/bridge/metadata';

export { tinaField };

/**
 * Create a visual-editing session for one page.
 *
 * @param {object} options
 * @param {() => Promise<{data: object, query: string, variables: object}>} options.query
 *   A generated-client query (e.g. `() => client.queries.postConnection()`).
 * @param {(data: object) => void} options.render
 *   Rebuilds the page DOM from metadata-stamped data. Called with the
 *   initial fetch result and again with every admin `updateData` payload.
 */
export function createTina({ query, render }) {
  let id = null;
  let quickEditEnabled = false;

  async function init() {
    const result = await query();
    id = hashFromQuery(
      JSON.stringify({ query: result.query, variables: result.variables })
    );

    // Stamp every object in the result with `_content_source` so `tinaField()`
    // can derive `data-tina-field` values from it. The stamp mutates the data
    // shape, so only the render path sees it — the `open` message carries the
    // raw result instead.
    render(addMetadata(id, structuredClone(result.data), []));

    post({ type: 'open', id, ...result });

    window.addEventListener('message', onMessage);
    window.addEventListener('beforeunload', onBeforeUnload);
  }

  function onMessage(event) {
    if (!isFromAdmin(event)) return;

    if (event.data.type === 'quickEditEnabled') {
      setQuickEditEnabled(event.data.value);
    }

    if (event.data.id === id && event.data.type === 'updateData') {
      render(addMetadata(id, structuredClone(event.data.data), []));
      reportQuickEdit();
    }
  }

  function setQuickEditEnabled(enabled) {
    if (enabled === quickEditEnabled) return;
    quickEditEnabled = enabled;

    if (enabled) {
      injectQuickEditCss();
      document.addEventListener('click', onQuickEditClick, true);
    } else {
      removeQuickEditCss();
      document.removeEventListener('click', onQuickEditClick, true);
    }
  }

  // Capture-phase listener so the click never reaches the page's own handlers.
  // Walks the composed path rather than `closest()`: `tina-markdown` renders
  // into an open shadow root, and only the composed path (which includes the
  // shadow host) can be searched for the `data-tina-field` marker.
  function onQuickEditClick(event) {
    const fieldName = resolveFieldName(event.composedPath());
    if (!fieldName) return;

    event.preventDefault();
    event.stopPropagation();
    post({ type: 'field:selected', fieldName });
  }

  function onBeforeUnload() {
    if (id) post({ type: 'close', id });
  }

  function reportQuickEdit() {
    const hasMarkers = !!document.querySelector('[data-tina-field]');
    post({ type: 'quick-edit', value: hasMarkers });
  }

  function post(message) {
    window.parent.postMessage(message, window.location.origin);
  }

  function isFromAdmin(event) {
    if (event.source !== window.parent) return false;
    if (event.origin !== window.location.origin) return false;
    return true;
  }

  return { init };
}

function resolveFieldName(path) {
  for (const node of path) {
    if (!(node instanceof Element)) continue;
    const attributeName = node
      .getAttributeNames()
      .find((name) => name.startsWith('data-tina-field'));
    if (attributeName) {
      const value = node.getAttribute(attributeName);
      if (value) return value;
    }
  }
  return null;
}

function injectQuickEditCss() {
  const style = document.createElement('style');
  style.textContent = QUICK_EDIT_CSS;
  style.id = 'tina-quick-edit-style';
  document.head.appendChild(style);
  document.body.classList.add(QUICK_EDIT_BODY_CLASS);
}

function removeQuickEditCss() {
  document.getElementById('tina-quick-edit-style')?.remove();
  document.body.classList.remove(QUICK_EDIT_BODY_CLASS);
}
