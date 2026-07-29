import { TinaAdmin } from '@tinacms/tinacms/admin';
import { TinaProvider, usePreviewConnection } from '@tinacms/tinacms/react';
import { useRef } from 'react';
import config from '../tina/config';

// The site side of visual editing. usePreviewConnection streams the values of the open
// form into the iframe, and it turns a click in the iframe into the active field.
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

// The whole playground app. The admin shell now supplies the parts that this file held
// before: the fields of the collection, the document tabs, the status badge, and the save
// button. tina/config.ts drives all of them.
export function App() {
  return (
    <TinaProvider config={config}>
      <TinaAdmin preview={<PreviewPane />} />
    </TinaProvider>
  );
}
