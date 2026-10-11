import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';
import {
  TINA_FIELD_ATTR,
  activateMessage,
  isValuesMessage,
  readyMessage,
} from './protocol';

export interface ConnectToEditorOptions {
  previewWindow: Window;
  editorWindow: Window;
  allowedOrigin: string;
  onValues: (values: TinaDocument) => void;
}

export interface PreviewConnection {
  disconnect: () => void;
}

export const connectToEditor = ({
  previewWindow,
  editorWindow,
  allowedOrigin,
  onValues,
}: ConnectToEditorOptions): PreviewConnection => {
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
