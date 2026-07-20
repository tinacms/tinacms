import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';
import {
  TINA_FIELD_ATTR,
  activateMessage,
  isValuesMessage,
  readyMessage,
} from './protocol';

export interface ConnectToEditorOptions {
  // The preview's own window and its host editor's window (window.parent),
  // injected rather than read from globals so the boundary is testable — in
  // happy-dom window.parent === window and the embedded path would be
  // unreachable otherwise.
  previewWindow: Window;
  editorWindow: Window;
  allowedOrigin: string;
  onValues: (values: TinaDocument) => void;
}

export interface PreviewConnection {
  disconnect: () => void;
}

// The preview half of the wire protocol: adopt every values message the editor
// streams over, send a click on a marked element up as an activate (the address
// and nothing else, ADR-009 §4), and announce readiness once listening. Incoming
// messages must come from the editor window at the allowed origin — a stray
// window can't cross wires.
export const connectToEditor = ({
  previewWindow,
  editorWindow,
  allowedOrigin,
  onValues,
}: ConnectToEditorOptions): PreviewConnection => {
  // Enforced at construction, not by documentation: '*' would post ready and
  // activate messages to any embedder and defeat the incoming origin check.
  invariant(
    allowedOrigin !== '*',
    'preview-allowed-origin-wildcard',
    "allowedOrigin must name the editor's origin — never '*'."
  );
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== allowedOrigin || event.source !== editorWindow) return;
    if (isValuesMessage(event.data)) onValues(event.data.values);
  };
  const onClick = (event: MouseEvent) => {
    // A click target isn't always an Element (a synthetic dispatch can target
    // the document itself), and only Elements have closest.
    if (!(event.target instanceof Element)) return;
    const marked = event.target.closest(`[${TINA_FIELD_ATTR}]`);
    const address = marked?.getAttribute(TINA_FIELD_ATTR);
    if (address) {
      editorWindow.postMessage(activateMessage(address), allowedOrigin);
    }
  };
  previewWindow.addEventListener('message', onMessage);
  previewWindow.document.addEventListener('click', onClick);
  editorWindow.postMessage(readyMessage(), allowedOrigin);
  return {
    disconnect: () => {
      previewWindow.removeEventListener('message', onMessage);
      previewWindow.document.removeEventListener('click', onClick);
    },
  };
};
