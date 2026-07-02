import { useEffect, useState } from 'react';
import type { TinaDocument } from '../core/schema/types';
import { connectToEditor } from './connection';

export interface UseTinaOptions<T extends TinaDocument> {
  // The document as the site rendered it (SSR/static build) — the whole story
  // when the page isn't inside the editor.
  data: T;
  // The editor's origin. Defaults to the page's own origin; cross-origin
  // embedding is an explicit opt-in, never '*'.
  allowedOrigin?: string;
}

export interface UseTinaResult<T extends TinaDocument> {
  data: T;
  // True once the editor has streamed values into this preview.
  isEditing: boolean;
}

// The site-side visual-editing hook (the v4 slice of #6944). Standalone it is
// inert — no listeners, no ready beacon, props flow through untouched. Inside
// the editor iframe it announces readiness, adopts every streamed document, and
// sends clicks on tinaField-marked elements up as activate messages.
//
// One document per connection: tina:values carries no document identity (the
// protocol header pins that), so every useTina on the page adopts the same
// hosted form. A multi-document page needs the envelope discriminator that
// lands with multi-form editing — out of scope here.
export function useTina<T extends TinaDocument = TinaDocument>({
  data,
  allowedOrigin,
}: UseTinaOptions<T>): UseTinaResult<T> {
  const [streamed, setStreamed] = useState<T | null>(null);

  useEffect(() => {
    if (window.parent === window) return;
    const connection = connectToEditor({
      previewWindow: window,
      editorWindow: window.parent,
      allowedOrigin: allowedOrigin ?? window.origin,
      // The wire carries the same schema-shaped document the caller asserted
      // for `data` — a standard serialization-boundary cast.
      onValues: (values) => setStreamed(values as T),
    });
    return () => connection.disconnect();
  }, [allowedOrigin]);

  return { data: streamed ?? data, isEditing: streamed !== null };
}
