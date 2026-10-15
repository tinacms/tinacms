import { TinaAdmin } from '@tinacms/tinacms/admin';
import { createRoot } from 'react-dom/client';
import config from './config';
import './admin.css';

// The admin route. TinaAdmin supplies the whole editor: the collections, the document
// form, the save button, and the preview pane. `preview` names the page of this site
// that renders the open document.
const root = document.getElementById('root');
if (!root) throw new Error('admin/index.html is missing #root');
createRoot(root).render(<TinaAdmin config={config} preview='/' />);
