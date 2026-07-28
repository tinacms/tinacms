import { TinaAdmin } from '@tinacms/tinacms/admin';
import { TinaProvider, usePreviewConnection } from '@tinacms/tinacms/react';
import { useRef } from 'react';
import config from '../tina/config';

// The site side of visual editing: usePreviewConnection streams the open form's
// values into the iframe and turns a click in there into the active field.
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

// The whole playground app now. Everything that used to live here — the collection's
// fields, the document tabs, the status badge, the save button — comes from the admin
// shell instead, driven by tina/config.ts.
export function App() {
  return (
    <TinaProvider config={config}>
      <TinaAdmin preview={<PreviewPane />} />
    </TinaProvider>
  );
}
