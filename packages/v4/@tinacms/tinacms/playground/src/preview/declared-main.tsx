import { createRoot } from 'react-dom/client';
import { DeclaredApp } from './declared-app';

const root = document.getElementById('root');
if (!root) throw new Error('declared.html is missing #root');
createRoot(root).render(<DeclaredApp />);
