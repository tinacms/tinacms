import type { TinaDocument } from '@tinacms/tinacms';
import { useEffect, useState } from 'react';
import { activateMessage, isDocumentMessage, readyMessage } from './bridge';

// Prototype of the #6944 `useTina` hook: announce readiness, then adopt every
// document the parent streams over.
function useTinaPreview(): TinaDocument {
  const [values, setValues] = useState<TinaDocument>({});
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.origin) return;
      if (isDocumentMessage(event.data)) setValues(event.data.values);
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage(readyMessage(), window.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  return values;
}

// Click-to-edit: any click on a marked element sends its address — and only its
// address (ADR-009 §4) — up to the editor.
function useClickToActivate(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const marked = (event.target as Element | null)?.closest(
        '[data-tina-field]'
      );
      const address = marked?.getAttribute('data-tina-field');
      if (address) {
        window.parent.postMessage(activateMessage(address), window.origin);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

export function PostPreview() {
  const post = useTinaPreview();
  useClickToActivate();

  return (
    <article style={{ maxWidth: '42rem', margin: '0 auto', padding: '3rem' }}>
      <span
        data-tina-field='featured'
        style={{
          display: 'inline-block',
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontFamily: 'system-ui, sans-serif',
          background: post.featured ? '#fef3c7' : '#f3f4f6',
          color: post.featured ? '#92400e' : '#6b7280',
        }}
      >
        {post.featured ? '★ Featured' : '☆ Not featured'}
      </span>
      <h1 data-tina-field='title'>{String(post.title ?? '')}</h1>
      <p style={{ color: '#6b7280' }}>
        This preview renders the document streamed from the editor. Click the
        title or the badge to focus its field in the sidebar.
      </p>
    </article>
  );
}
