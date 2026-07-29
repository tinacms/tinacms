import { useEffect, useState } from 'react';
import type { TinaDocument } from '../../core/schema/types';
import { connectToEditor } from '../../preview/connection';

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

// The site-side hook for visual editing (the v4 part of #6944). On a page by itself, it
// does nothing. It adds no listener, it sends no ready message, and the props pass
// through. Inside the editor iframe, it announces that it is ready, adopts every
// document that arrives, and sends a click on a tinaField element up as an activate
// message.
//
// There is one document for each connection. The tina:values message carries no document
// identity, as the protocol header states, so every useTina on the page adopts the same
// hosted form. A page with more than one document needs the discriminator that arrives
// with multi-form editing.
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
      // The wire carries the document in the shape that the caller asserted for
      // `data`. This is a cast at a serialization boundary.
      onValues: (values) => setStreamed(values as T),
    });
    return () => connection.disconnect();
  }, [allowedOrigin]);

  return { data: streamed ?? data, isEditing: streamed !== null };
}
