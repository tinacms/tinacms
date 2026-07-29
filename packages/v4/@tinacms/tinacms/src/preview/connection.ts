import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';
import {
  TINA_FIELD_ATTR,
  activateMessage,
  isValuesMessage,
  readyMessage,
} from './protocol';

export interface ConnectToEditorOptions {
  // The window of the preview, and the window of the editor that hosts it, which is
  // window.parent. The caller passes them, and this code does not read the globals,
  // so a test can drive the boundary. In happy-dom, window.parent equals window, and
  // the embedded path would otherwise be unreachable.
  previewWindow: Window;
  editorWindow: Window;
  allowedOrigin: string;
  onValues: (values: TinaDocument) => void;
}

export interface PreviewConnection {
  disconnect: () => void;
}

// The preview half of the wire protocol. It adopts every values message from the
// editor. It sends a click on a marked element up as an activate message, which holds
// the address and nothing else (ADR-009 §4). It announces that it is ready once it
// listens. An incoming message must come from the editor window, at the allowed origin,
// so another window cannot reach it.
export const connectToEditor = ({
  previewWindow,
  editorWindow,
  allowedOrigin,
  onValues,
}: ConnectToEditorOptions): PreviewConnection => {
  // This check runs at construction. A '*' origin would post the ready and activate
  // messages to any embedder, and would defeat the origin check on the incoming
  // messages.
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
    // The target of a click is not always an Element, because a synthetic event can
    // target the document. Only an Element has closest().
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
