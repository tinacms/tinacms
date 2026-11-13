import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { TinaDocument } from '../../core/schema/types';
import { createPreviewStore } from '../../preview/store';
import { tinaField } from '../../preview/protocol';

export interface UseTinaOptions<T extends TinaDocument> {
  data: T;
  /** Path of the document `data` comes from, e.g. `content/posts/hello.mdx`. */
  document?: string;
  /** The document is drawn on many pages (a nav or footer). */
  shared?: boolean;
  allowedOrigin?: string;
}

export interface UseTinaResult<T extends TinaDocument> {
  data: T;
  isEditing: boolean;
  /** `tinaField` bound to this hook's `document`. */
  tinaField: (address: string) => ReturnType<typeof tinaField>;
}

export function useTina<T extends TinaDocument = TinaDocument>({
  data,
  document,
  shared,
  allowedOrigin,
}: UseTinaOptions<T>): UseTinaResult<T> {
  const store = useMemo(
    () => createPreviewStore({ allowedOrigin, document, shared }),
    [allowedOrigin, document, shared]
  );
  const streamed = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  useEffect(() => {
    store.syncUrl();
  });

  return {
    data: (streamed as T | null) ?? data,
    isEditing: streamed !== null,
    tinaField: (address) => tinaField(address, document),
  };
}
