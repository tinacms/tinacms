import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ResolvedConfig, asResolvedConfig } from '../../config';
import { definePlugin } from '../../core/plugin';
import { SearchError } from '../../core/search/contract';
import { defineSearchPlugin } from '../../core/search/define-search-plugin';
import type { SearchIndexProvider } from '../../core/search/index-contract';
import type { CollectionSchema } from '../../core/schema/types';
import { runCli } from '../index';

let rootDir: string;

const collection = (name: string, withPath = true): CollectionSchema => ({
  name,
  ...(withPath ? { path: `content/${name}` } : {}),
  format: 'json',
  fields: [{ name: 'title', type: 'string' }],
});

const writeDoc = async (relative: string, content: string) => {
  const file = path.join(rootDir, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
};

const providerWith = () => ({
  query: vi.fn<SearchIndexProvider['query']>(async () => []),
  upsert: vi.fn<SearchIndexProvider['upsert']>(async () => {}),
  replace: vi.fn<SearchIndexProvider['replace']>(async () => {}),
});

const configWith = (
  provider: ReturnType<typeof providerWith>,
  options: {
    fields?: Record<string, Record<string, number>>;
    collections?: CollectionSchema[];
    events?: string[];
  } = {}
): ResolvedConfig =>
  asResolvedConfig({
    plugins: [
      defineSearchPlugin({
        name: 'test:search',
        fields: options.fields ?? { post: { title: 3 }, page: { title: 1 } },
        server: async () => ({ default: provider }),
        onInit: () => void options.events?.push('init'),
        onDestroy: () => void options.events?.push('destroy'),
      }),
    ],
    schema: {
      collections: options.collections ?? [
        collection('post'),
        collection('page'),
        collection('author'),
      ],
    },
  });

const reindex = async (config: ResolvedConfig) => {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(['search', 'reindex', '--root', rootDir], {
    cwd: rootDir,
    log: (message) => out.push(message),
    logError: (message) => err.push(message),
    loader: { ssrLoadModule: async () => ({ default: config }) },
  });
  return { code, out, err };
};

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'tina-search-'));
  await mkdir(path.join(rootDir, 'tina'), { recursive: true });
  await writeFile(path.join(rootDir, 'tina', 'config.ts'), '');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(rootDir, { recursive: true, force: true });
});

describe('tinacms search reindex', () => {
  it('replaces the index once with every document of the searchable collections', async () => {
    await writeDoc('content/post/a.json', '{"title":"Alpha"}');
    await writeDoc('content/post/b.json', '{"title":"Beta"}');
    await writeDoc('content/author/ada.json', '{"title":"Ada"}');
    const events: string[] = [];
    const provider = providerWith();
    provider.replace.mockImplementation(
      async () => void events.push('replace')
    );

    const { code, out } = await reindex(configWith(provider, { events }));

    expect(code).toBe(0);
    expect(provider.replace).toHaveBeenCalledTimes(1);
    expect(provider.replace.mock.calls[0][0]).toEqual([
      {
        ref: { collection: 'post', path: 'content/post/a.json' },
        fields: [{ name: 'title', weight: 3, text: 'Alpha' }],
      },
      {
        ref: { collection: 'post', path: 'content/post/b.json' },
        fields: [{ name: 'title', weight: 3, text: 'Beta' }],
      },
    ]);
    expect(out).toEqual([
      'post: 2 documents',
      'page: 0 documents',
      'Indexed 2 documents.',
    ]);
    expect(events).toEqual(['init', 'replace', 'destroy']);
  });

  it('exits 1 when no plugin provides search', async () => {
    const config = asResolvedConfig({
      plugins: [definePlugin({ name: 'test:other' })],
      schema: { collections: [] },
    });
    const { code, err } = await reindex(config);
    expect(code).toBe(1);
    expect(err.join()).toContain('No plugin provides `search`');
  });

  it('exits 1 when the search plugin has no index provider', async () => {
    const config = asResolvedConfig({
      plugins: [
        definePlugin({
          name: 'test:hand-written',
          provides: ['search'],
          client: async () => ({
            default: { slice: () => ({ search: async () => [] }) },
          }),
        }),
      ],
      schema: { collections: [] },
    });
    const { code, err } = await reindex(config);
    expect(code).toBe(1);
    expect(err.join()).toContain('has no index provider');
  });

  it('exits 1 naming the file when a document does not parse, and replaces nothing', async () => {
    await writeDoc('content/post/a.json', '{"title":"Alpha"}');
    await writeDoc('content/post/broken.json', '{ not json');
    const provider = providerWith();
    const { code, err } = await reindex(configWith(provider));
    expect(code).toBe(1);
    expect(err.join()).toContain('content/post/broken.json');
    expect(provider.replace).not.toHaveBeenCalled();
  });

  it('exits 1 when a searchable collection has no path', async () => {
    const provider = providerWith();
    const { code, err } = await reindex(
      configWith(provider, {
        fields: { post: { title: 1 } },
        collections: [collection('post', false)],
      })
    );
    expect(code).toBe(1);
    expect(err.join()).toContain('content-collection-no-path');
    expect(provider.replace).not.toHaveBeenCalled();
  });

  it('exits 1 and keeps the index when every collection is empty', async () => {
    const provider = providerWith();
    const { code, err } = await reindex(configWith(provider));
    expect(code).toBe(1);
    expect(err.join()).toContain('Found no documents to index');
    expect(provider.replace).not.toHaveBeenCalled();
  });

  it('exits 1 with the message of a provider SearchError', async () => {
    await writeDoc('content/post/a.json', '{"title":"Alpha"}');
    const provider = providerWith();
    provider.replace.mockRejectedValue(
      new SearchError('unavailable', 'connect ECONNREFUSED')
    );
    const { code, err } = await reindex(configWith(provider));
    expect(code).toBe(1);
    expect(err.join()).toContain('connect ECONNREFUSED');
  });
});

describe('tinacms search reindex with the real config loader', () => {
  it('imports a TypeScript provider after the config and replaces the index', async () => {
    const src = path.resolve(__dirname, '../..');
    await writeDoc('content/post/a.json', '{"title":"Alpha"}');
    const out = path.join(rootDir, 'replaced.json');
    await writeDoc(
      'tina/search.server.ts',
      `import { writeFileSync } from 'node:fs';
const target: string = ${JSON.stringify(out)};
export default {
  query: async () => [],
  upsert: async () => {},
  replace: async (records: unknown[]) => writeFileSync(target, JSON.stringify(records)),
};
`
    );
    await writeFile(
      path.join(rootDir, 'tina', 'config.ts'),
      `import { defineSearchPlugin } from ${JSON.stringify(`${src}/core/search/define-search-plugin`)};
export default {
  plugins: [
    defineSearchPlugin({
      name: 'test:search',
      fields: { post: { title: 1 } },
      server: () => import('./search.server'),
    }),
  ],
  schema: {
    collections: [
      { name: 'post', path: 'content/post', format: 'json', fields: [{ name: 'title', type: 'string' }] },
    ],
  },
};
`
    );
    const errors: string[] = [];
    const code = await runCli(['search', 'reindex', '--root', rootDir], {
      cwd: rootDir,
      log: () => {},
      logError: (message) => errors.push(message),
    });
    expect(errors).toEqual([]);
    expect(code).toBe(0);
    expect(JSON.parse(await readFile(out, 'utf8'))).toHaveLength(1);
  }, 60_000);
});
