import { TinaAdmin } from '@tinacms/tinacms/admin';
import { defineConfig, definePlugin, localMediaPlugin } from '@tinacms/tinacms';
import { createRoot } from 'react-dom/client';
import { postCollection } from '../tina/config';
import './index.css';

const params = new URLSearchParams(location.search);
const protectedBranch = params.get('protected') === '1';
const branchName = params.get('branch') ?? 'feature/news';
const signedIn = params.get('account') === '1';

const auth = definePlugin({
  name: 'playground:branch-auth',
  provides: ['auth'],
  server: async () => ({ default: {} }),
  client: async () => ({
    default: {
      slice: () => ({
        status: 'signed-in' as const,
        user: { id: 'editor', name: 'Editor', email: 'editor@example.com' },
        roles: ['editor'],
        getToken: async () => undefined,
        login: async () => {},
        logout: async () => {},
      }),
    },
  }),
});

const content = definePlugin({
  name: 'playground:branch-content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        branches: {
          list: async () => [
            { name: 'main', protected: true },
            { name: branchName, protected: protectedBranch },
          ],
          defaultBranch: async () => branchName,
        },
        list: async () => [],
        get: async () => null,
        update: async (_collection: string, path: string, value: never) => ({
          path,
          document: value,
        }),
      }),
    },
  }),
});

const config = defineConfig({
  projectName: params.get('project') ?? 'Acme site',
  plugins: [content, localMediaPlugin(), ...(signedIn ? [auth] : [])],
  schema: { collections: [postCollection] },
});

const root = document.getElementById('root');
if (!root) throw new Error('branches.html is missing #root');
createRoot(root).render(<TinaAdmin config={config} preview='/preview.html' />);
