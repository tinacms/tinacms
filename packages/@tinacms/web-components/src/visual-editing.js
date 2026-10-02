import { tinaField } from '@tinacms/bridge';
export { tinaField };

import {
  QUICK_EDIT_BODY_CLASS,
  QUICK_EDIT_CSS,
} from '@tinacms/bridge/quick-edit-css';

import { addMetadata, hashFromQuery } from '@tinacms/bridge/metadata';

/**
 * @typedef {'open' | 'quick-edit' | 'quickEditEnabled' | 'field:selected' | 'close'} type
 */

/**
 * @typedef {Object} CreateTinaOptions
 * @property {() => Promise<{data: object, query: string, variables: object}>} query
 *   A generated-client query (e.g. `() => client.queries.postConnection()`).
 * @property {(data: object) => void} render
 *   Rebuilds the page DOM from metadata-stamped data. Called with the
 *   initial fetch result and again with every admin `updateData` payload.
 */

/**
 * Create a visual-editing session for one page.
 * @param {CreateTinaOptions} options
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
    // shape, so only the render path sees it - the `open` message carries the
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
