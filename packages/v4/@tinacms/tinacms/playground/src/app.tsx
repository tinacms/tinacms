import { TinaAdmin } from '@tinacms/tinacms/admin';
import config from '../tina/config';

/**
 * `?preview=/declared.html?post=...` points the preview pane at another playground page.
 * `?preview=none` mounts the admin with no preview.
 */
const previewUrl = (): string | undefined => {
  const requested = new URLSearchParams(location.search).get('preview');
  if (requested === 'none') return undefined;
  return requested?.startsWith('/') && !requested.startsWith('//')
    ? requested
    : '/preview.html';
};

export function App() {
  return <TinaAdmin config={config} preview={previewUrl()} />;
}
