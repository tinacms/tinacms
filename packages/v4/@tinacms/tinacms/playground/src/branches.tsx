import { TinaAdmin } from '@tinacms/tinacms/admin';
import { defineConfig, definePlugin, localMediaPlugin } from '@tinacms/tinacms';
import { createRoot } from 'react-dom/client';
import { pageCollection, postCollection } from '../tina/config';
import './index.css';

const params = new URLSearchParams(location.search);
const protectedBranch = params.get('protected') === '1';
const branchName = params.get('branch') ?? 'feature/news';
const signedIn = params.get('account') === '1';

// Home states for manual checks and the e2e tests:
// `docs=N` lists N posts, `dates=0` leaves out who and when, `long=1` uses long
// names, `pr=<url>` gives the branch a pull request, `slow=1` never answers,
// and `fail=lists` or `fail=branches` makes that read fail.
const documentCount = Number(params.get('docs') ?? 0);
const withDates = params.get('dates') !== '0';
const longNames = params.get('long') === '1';
const pullRequestUrl = params.get('pr') ?? undefined;
const slow = params.get('slow') === '1';
const failing = params.get('fail');

const AUTHORS = ['Priya Raman', 'Josh Berman', 'Ada Lovelace'];
const HOUR = 3_600_000;
const never = new Promise<never>(() => {});

const posts = Array.from({ length: documentCount }, (_, index) => ({
  path: longNames
    ? `content/posts/a-document-with-a-really-long-file-name-that-must-wrap-on-a-phone-number-${index + 1}.mdx`
    : `content/posts/post-${String(index + 1).padStart(2, '0')}.mdx`,
  ...(withDates
    ? {
        updatedAt: new Date(Date.now() - (index + 1) * 5 * HOUR).toISOString(),
        lastAuthor: { name: AUTHORS[index % AUTHORS.length] ?? 'Editor' },
      }
    : {}),
}));

const collections = longNames
  ? [
      {
        ...postCollection,
        label:
          'Posts-and-announcements-and-a-really-long-collection-name-without-a-space',
      },
      pageCollection,
    ]
  : [postCollection, pageCollection];

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
          list: async () => {
            if (slow) return never;
            if (failing === 'branches') throw new Error('offline');
            return [
              { name: 'main', protected: true },
              { name: branchName, protected: protectedBranch, pullRequestUrl },
            ];
          },
          defaultBranch: async () => branchName,
        },
        list: async (collection: string) => {
          if (slow) return never;
          if (failing === 'lists') throw new Error('offline');
          return collection === 'post' ? posts : [];
        },
        get: async (_collection: string, path: string) => {
          if (!posts.some((post) => post.path === path)) return null;
          return { path, document: { title: path } };
        },
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
  schema: { collections },
});

const root = document.getElementById('root');
if (!root) throw new Error('branches.html is missing #root');
createRoot(root).render(<TinaAdmin config={config} preview='/preview.html' />);
