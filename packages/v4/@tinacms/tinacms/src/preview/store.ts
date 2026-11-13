import type { TinaDocument } from '../core/schema/types';
import { type PreviewBridge, getPreviewBridge } from './bridge';

export interface CreatePreviewStoreOptions {
  allowedOrigin?: string;
  document?: string;
  shared?: boolean;
  previewWindow?: Window;
  editorWindow?: Window;
}

export interface PreviewStore {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => TinaDocument | null;
  getServerSnapshot: () => null;
  syncUrl: () => void;
}

/**
 * One store per `useTina` call: holds the values streamed for its document and
 * registers its declaration with the window's bridge while subscribed.
 */
export function createPreviewStore({
  allowedOrigin,
  document,
  shared,
  previewWindow,
  editorWindow,
}: CreatePreviewStoreOptions = {}): PreviewStore {
  const preview = previewWindow ?? globalThis.window;
  const editor = editorWindow ?? preview?.parent;
  const embedded = Boolean(preview && editor && editor !== preview);

  let streamed: TinaDocument | null = null;
  let bridge: PreviewBridge | null = null;
  let unregister: (() => void) | null = null;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => streamed,
    getServerSnapshot: () => null,
    syncUrl: () => bridge?.syncUrl(),
    subscribe: (onChange) => {
      if (!embedded) return () => {};
      listeners.add(onChange);
      if (!unregister) {
        bridge = getPreviewBridge({
          previewWindow: preview,
          editorWindow: editor,
          allowedOrigin: allowedOrigin ?? preview.origin,
        });
        unregister = bridge.register({
          document,
          shared,
          onValues: (values) => {
            streamed = values;
            for (const listener of listeners) listener();
          },
        });
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) {
          unregister?.();
          unregister = null;
        }
      };
    },
  };
}
