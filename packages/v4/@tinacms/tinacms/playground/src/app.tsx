import { TinaAdmin } from '@tinacms/tinacms/admin';
import config from '../tina/config';

export function App() {
  return <TinaAdmin config={config} preview='/preview.html' />;
}
