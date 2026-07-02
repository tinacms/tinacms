import { createRoot } from 'react-dom/client';
import { PostPreview } from './post-preview';

const root = document.getElementById('root');
if (!root) throw new Error('preview.html is missing #root');
createRoot(root).render(<PostPreview />);
