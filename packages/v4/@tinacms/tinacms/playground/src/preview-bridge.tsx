import type { TinaDocument } from '@tinacms/tinacms';
import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { documentMessage, isReadyMessage } from './preview/bridge';

// Streams the form's values into the preview iframe: post on the iframe's ready
// handshake, re-post on every value change. Values are read straight off RHF (a
// second watch subscriber) — deliberately NOT through the form-store, which owns
// status only. Direct react-hook-form use is playground-local prototyping for the
// real #6944 adapter. Same-origin here, but postMessage is the boundary the
// architecture prescribes, so it's exercised anyway.
export function PreviewBridge() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { watch, getValues } = useFormContext<TinaDocument>();

  useEffect(() => {
    const postDocument = (values: TinaDocument) => {
      iframeRef.current?.contentWindow?.postMessage(
        documentMessage(values),
        window.origin
      );
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.origin) return;
      if (isReadyMessage(event.data)) postDocument(getValues());
    };
    window.addEventListener('message', onMessage);
    // Unlike the form-store sync, reset fires (name undefined) are wanted here —
    // the preview should adopt a re-seeded document too.
    const subscription = watch((values) =>
      postDocument(values as TinaDocument)
    );
    return () => {
      window.removeEventListener('message', onMessage);
      subscription.unsubscribe();
    };
  }, [watch, getValues]);

  return (
    <iframe
      ref={iframeRef}
      src='/preview.html'
      title='Preview'
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  );
}
