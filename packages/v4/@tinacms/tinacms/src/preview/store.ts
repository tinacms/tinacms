import type { TinaDocument } from '../core/schema/types';
import { type PreviewConnection, connectToEditor } from './connection';

export interface CreatePreviewStoreOptions {
  allowedOrigin?: string;
  previewWindow?: Window;
  editorWindow?: Window;
}

export interface PreviewStore {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => TinaDocument | null;
  getServerSnapshot: () => null;
}

export function createPreviewStore({
  allowedOrigin,
  previewWindow,
  editorWindow,
}: CreatePreviewStoreOptions = {}): PreviewStore {
  const preview = previewWindow ?? globalThis.window;
  const editor = editorWindow ?? preview?.parent;
  const embedded = Boolean(preview && editor && editor !== preview);

  let streamed: TinaDocument | null = null;
  let connection: PreviewConnection | null = null;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => streamed,
    getServerSnapshot: () => null,
    subscribe: (onChange) => {
      if (!embedded) return () => {};
      listeners.add(onChange);
      connection ??= connectToEditor({
        previewWindow: preview,
        editorWindow: editor,
        allowedOrigin: allowedOrigin ?? preview.origin,
        onValues: (values) => {
          streamed = values;
          for (const listener of listeners) listener();
        },
      });
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) {
          connection?.disconnect();
          connection = null;
        }
      };
    },
  };
}
