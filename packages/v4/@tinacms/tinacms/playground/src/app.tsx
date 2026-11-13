import { TinaAdmin } from '@tinacms/tinacms/admin';
import config from '../tina/config';

/** `?preview=/declared.html?post=...` points the preview pane at another playground page. */
const previewUrl = (): string => {
  const requested = new URLSearchParams(location.search).get('preview');
  return requested?.startsWith('/') && !requested.startsWith('//')
    ? requested
    : '/preview.html';
};

export function App() {
  return <TinaAdmin config={config} preview={previewUrl()} />;
}
