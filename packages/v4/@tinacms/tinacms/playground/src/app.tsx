import { TinaAdmin } from '@tinacms/tinacms/admin';
import { TinaProvider, usePreviewConnection } from '@tinacms/tinacms/react';
import { useRef } from 'react';
import config from '../tina/config';

function PreviewPane() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  usePreviewConnection(iframeRef);
  return (
    <iframe
      ref={iframeRef}
      src='/preview.html'
      title='Preview'
      className='size-full border-none'
    />
  );
}

export function App() {
  return (
    <TinaProvider config={config}>
      <TinaAdmin preview={<PreviewPane />} />
    </TinaProvider>
  );
}
