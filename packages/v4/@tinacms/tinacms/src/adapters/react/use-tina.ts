import { useRef, useSyncExternalStore } from 'react';
import type { TinaDocument } from '../../core/schema/types';
import { type PreviewStore, createPreviewStore } from '../../preview/store';

export interface UseTinaOptions<T extends TinaDocument> {
  data: T;
  allowedOrigin?: string;
}

export interface UseTinaResult<T extends TinaDocument> {
  data: T;
  isEditing: boolean;
}

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

  return { data: (streamed as T | null) ?? data, isEditing: streamed !== null };
}

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
