import { useRef, useSyncExternalStore } from 'react';
import type { TinaDocument } from '../../core/schema/types';
import { type PreviewStore, createPreviewStore } from '../../preview/store';

export interface UseTinaOptions<T extends TinaDocument> {
  // The document as the site rendered it, in the SSR or the static build. This is the
  // whole document when the page is outside the editor.
  data: T;
  // The origin of the editor. It defaults to the origin of the page. A cross-origin
  // embed is an explicit choice, and is never '*'.
  allowedOrigin?: string;
}

export interface UseTinaResult<T extends TinaDocument> {
  data: T;
  // True once the editor has streamed values into this preview.
  isEditing: boolean;
}

// The site-side hook for visual editing (the v4 part of #6944), and the React binding of
// ../../preview/store. The store holds what is true of every framework — that a page
// outside the editor connects to nothing, that the editor's document supersedes the one
// the site rendered — and this file holds the one thing that is React's: reading a
// subscribe/getSnapshot pair, which useSyncExternalStore takes as it stands.
//
// There is one document for each connection. The tina:values message carries no document
// identity, as the protocol header states, so every useTina on the page adopts the same
// hosted form. A page with more than one document needs the discriminator that arrives
// with multi-form editing.
export function useTina<T extends TinaDocument = TinaDocument>({
  data,
  allowedOrigin,
}: UseTinaOptions<T>): UseTinaResult<T> {
  const store = usePreviewStore(allowedOrigin);
  const streamed = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  // The wire carries the document in the shape that the caller asserted for `data`. This
  // is a cast at a serialization boundary.
  return { data: (streamed as T | null) ?? data, isEditing: streamed !== null };
}

// One store for the life of the hook, rebuilt only when the origin it connects to
// changes. Not useMemo: React may discard a memo, and discarding this one would drop the
// document the editor has already streamed.
function usePreviewStore(allowedOrigin: string | undefined): PreviewStore {
  const heldStore = useRef<{
    allowedOrigin?: string;
    store: PreviewStore;
  }>(null);
  if (!heldStore.current || heldStore.current.allowedOrigin !== allowedOrigin) {
    heldStore.current = {
      allowedOrigin,
      store: createPreviewStore({ allowedOrigin }),
    };
  }
  return heldStore.current.store;
}
