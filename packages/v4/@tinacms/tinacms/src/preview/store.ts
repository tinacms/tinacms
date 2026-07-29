// The preview connection as a store, which is the shape every framework already knows how
// to consume: subscribe to changes, read a snapshot.
//
// React reads it with useSyncExternalStore, Svelte with its store contract, Vue with a
// shallowRef, a plain script by calling subscribe. The rules that would otherwise be
// rewritten in each of those — that a page outside the editor connects to nothing, that
// nothing has streamed until the editor says so, that the last subscriber closes the
// connection — live here once.

import type { TinaDocument } from '../core/schema/types';
import { type PreviewConnection, connectToEditor } from './connection';

export interface CreatePreviewStoreOptions {
  // The origin of the editor. It defaults to the origin of the page. A cross-origin
  // embed is an explicit choice, and is never '*'.
  allowedOrigin?: string;
  // Both default to the globals. They are named so a test, or a host that renders
  // somewhere other than a browser tab, can drive the boundary.
  previewWindow?: Window;
  editorWindow?: Window;
}

export interface PreviewStore {
  // Start listening, and get back the unsubscribe. On a page that is not embedded in the
  // editor this connects to nothing and the unsubscribe is a no-op.
  subscribe: (onChange: () => void) => () => void;
  // The document the editor streamed most recently, or null if it has streamed none. The
  // reference only changes when a new one arrives, which is what a store consumer needs
  // to decide whether anything happened.
  getSnapshot: () => TinaDocument | null;
  // Nothing has streamed during a server render, by definition.
  getServerSnapshot: () => null;
}

export function createPreviewStore({
  allowedOrigin,
  previewWindow,
  editorWindow,
}: CreatePreviewStoreOptions = {}): PreviewStore {
  const preview = previewWindow ?? globalThis.window;
  const editor = editorWindow ?? preview?.parent;
  // A page opened on its own is its own parent. There is no editor to talk to, so the
  // store never adds a listener and never announces itself.
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
      // One connection for the store, opened by the first subscriber. Two views of the
      // same preview should not each announce themselves to the editor.
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
