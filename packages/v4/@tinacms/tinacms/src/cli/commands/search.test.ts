import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ResolvedConfig, asResolvedConfig } from '../../config';
import { definePlugin } from '../../core/plugin';
import { buildSearchRecord } from '../../core/search/record';
import { SearchError } from '../../core/search/contract';
import { defineSearchPlugin } from '../../plugins/search/search.plugin';
import type { SearchIndexProvider } from '../../core/search/index-contract';
import type { CollectionSchema } from '../../core/schema/types';
import { createLocalDataLayer } from '../../plugins/content/local/server/local-data-layer';
import { runCli } from '../index';
import { codecFor } from '../../plugins/fields/rich-text/rich-text-codecs';

vi.mock(
  '../../plugins/fields/rich-text/rich-text-codecs',
  async (importActual) => {
    const actual =
      await importActual<
        typeof import('../../plugins/fields/rich-text/rich-text-codecs')
      >();
    return { ...actual, codecFor: vi.fn(actual.codecFor) };
  }
);

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
        fields: [{ name: 'title', weight: 3, value: 'Alpha' }],
      },
      {
        ref: { collection: 'post', path: 'content/post/b.json' },
        fields: [{ name: 'title', weight: 3, value: 'Beta' }],
      },
    ]);
    expect(out).toEqual([
      'post: 2 documents',
      'page: 0 documents',
      'Indexed 2 documents.',
    ]);
    expect(events).toEqual(['init', 'replace', 'destroy']);
  });

  it('reindexes only the provider of the plugin that overrides search', async () => {
    await writeDoc('content/post/a.json', '{"title":"Alpha"}');
    const loser = providerWith();
    const winner = providerWith();
    const config = asResolvedConfig({
      plugins: [
        defineSearchPlugin({
          name: 'test:a',
          fields: { page: { title: 1 } },
          server: async () => ({ default: loser }),
        }),
        defineSearchPlugin({
          name: 'test:b',
          fields: { post: { title: 3 } },
          server: async () => ({ default: winner }),
          overrides: [{ capability: 'search' }],
        }),
      ],
      schema: { collections: [collection('post'), collection('page')] },
    });

    const { code } = await reindex(config);

    expect(code).toBe(0);
    expect(loser.replace).not.toHaveBeenCalled();
    expect(winner.replace).toHaveBeenCalledTimes(1);
    expect(winner.replace.mock.calls[0][0]).toEqual([
      {
        ref: { collection: 'post', path: 'content/post/a.json' },
        fields: [{ name: 'title', weight: 3, value: 'Alpha' }],
      },
    ]);
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

describe('tinacms search reindex and the schema', () => {
  const site = (withPath = true): CollectionSchema => ({
    name: 'site',
    ...(withPath ? { path: 'content' } : {}),
    format: 'json',
    fields: [{ name: 'title', type: 'string' }],
  });
  const seedNested = async () => {
    await writeDoc('content/home.json', '{"title":"Home"}');
    await writeDoc('content/about.json', '{"title":"About"}');
    await writeDoc('content/posts/a.json', '{"title":"Post A"}');
  };
  const listed = async (
    collection: CollectionSchema,
    schema: CollectionSchema[]
  ) => {
    const layer = createLocalDataLayer({
      rootDir: rootDir,
      collections: schema.filter(({ path: folder }) => folder),
    });
    return (await layer.list(collection.name)).map(({ path: p }) => ({
      collection: collection.name,
      path: p,
    }));
  };

  it('indexes only the documents the collection owns, with the refs content.list gives', async () => {
    await seedNested();
    const schema = [site(), collection('post'), collection('author', false)];
    schema[1] = { ...collection('post'), path: 'content/posts' };
    const provider = providerWith();
    const { code } = await reindex(
      configWith(provider, {
        fields: { site: { title: 1 } },
        collections: schema,
      })
    );
    expect(code).toBe(0);
    const refs = provider.replace.mock.calls[0][0].map(({ ref }) => ref);
    expect(refs).toEqual(await listed(site(), schema));
    expect(refs.some(({ path: p }) => p.startsWith('content/posts/'))).toBe(
      false
    );
  });

  it('sends the nested files as post records, never as site, when post is searchable too', async () => {
    await seedNested();
    const schema = [site(), { ...collection('post'), path: 'content/posts' }];
    const provider = providerWith();
    await reindex(
      configWith(provider, {
        fields: { site: { title: 1 }, post: { title: 1 } },
        collections: schema,
      })
    );
    const refs = provider.replace.mock.calls[0][0].map(({ ref }) => ref);
    expect(refs).toContainEqual({
      collection: 'post',
      path: 'content/posts/a.json',
    });
    expect(refs).not.toContainEqual({
      collection: 'site',
      path: 'content/posts/a.json',
    });
  });

  it('still exits 1 for a searchable collection with no path', async () => {
    const provider = providerWith();
    const { code, err } = await reindex(
      configWith(provider, {
        fields: { site: { title: 1 } },
        collections: [site(false)],
      })
    );
    expect(code).toBe(1);
    expect(err.join()).toContain('content-collection-no-path');
  });
});

describe('tinacms search reindex source documents', () => {
  const article = (name: string, format: 'mdx' | 'md'): CollectionSchema => ({
    name,
    path: `content/${name}`,
    format,
    fields: [
      { name: 'title', type: 'string' },
      { name: 'intro', type: 'rich-text' },
      { name: 'body', type: 'rich-text', isBody: true },
    ],
  });
  it.each([
    ['mdx', '<Cta label="secret prop" />\n\n'],
    ['md', ''],
  ] as const)(
    'hands over the source text of %s bodies as read, markup included',
    async (format, jsx) => {
      await writeDoc(
        `content/doc/a.${format}`,
        `---\ntitle: T\n---\n\nHello **bold** world.\n\n${jsx}![alt words](/x.png)\n\n[link text](https://u.example)\n`
      );
      const provider = providerWith();
      const { code } = await reindex(
        configWith(provider, {
          fields: { doc: { title: 1, body: 1 } },
          collections: [article('doc', format)],
        })
      );
      expect(code).toBe(0);
      const [record] = provider.replace.mock.calls[0][0];
      expect(record.fields).toEqual([
        { name: 'title', weight: 1, value: 'T' },
        {
          name: 'body',
          weight: 1,
          value: `Hello **bold** world.\n\n${jsx}![alt words](/x.png)\n\n[link text](https://u.example)\n`,
        },
      ]);
    }
  );

  it.each(['mdx', 'md'] as const)(
    'hands over the same record as a save through the local data layer, in %s',
    async (format) => {
      const layer = createLocalDataLayer({
        rootDir,
        collections: [article('doc', format)],
      });
      const saved = await layer.update('doc', `content/doc/a.${format}`, {
        title: 'T',
        body: 'Hello <b>bold</b> &amp; more\n\nSecond',
      });
      await layer.close();
      const provider = providerWith();
      await reindex(
        configWith(provider, {
          fields: { doc: { title: 2, intro: 1, body: 1 } },
          collections: [article('doc', format)],
        })
      );
      const [record] = provider.replace.mock.calls[0][0];
      expect(record).toEqual(
        buildSearchRecord(
          article('doc', format),
          record.ref.path,
          saved.document,
          { title: 2, intro: 1, body: 1 }
        )
      );
      expect(record.fields.map(({ name }) => name)).toEqual(['title', 'body']);
    }
  );

  it('leaves out a configured field named like an Object.prototype member when the file lacks it, and keeps it when present', async () => {
    await writeDoc('content/doc/a.mdx', '---\ntitle: T\n---\n\nbody\n');
    await writeDoc(
      'content/doc/b.mdx',
      '---\ntitle: T\nconstructor: own\n---\n\nbody\n'
    );
    const provider = providerWith();
    const withProto: CollectionSchema = {
      ...article('doc', 'mdx'),
      fields: [
        { name: 'title', type: 'string' },
        { name: 'constructor', type: 'string' },
        { name: 'valueOf', type: 'string' },
        { name: 'body', type: 'rich-text', isBody: true },
      ],
    };
    await reindex(
      configWith(provider, {
        fields: { doc: { title: 3, constructor: 1, valueOf: 1 } },
        collections: [withProto],
      })
    );
    const [a, b] = provider.replace.mock.calls[0][0];
    expect(a.fields).toEqual([{ name: 'title', weight: 3, value: 'T' }]);
    expect(b.fields).toEqual([
      { name: 'title', weight: 3, value: 'T' },
      { name: 'constructor', weight: 1, value: 'own' },
    ]);
  });

  it('indexes a body the rich-text codec would refuse, as read', async () => {
    await writeDoc(
      'content/doc/a.mdx',
      '---\ntitle: T\n---\n\n<Callout>unclosed\n'
    );
    const provider = providerWith();
    const { code } = await reindex(
      configWith(provider, {
        fields: { doc: { body: 1 } },
        collections: [article('doc', 'mdx')],
      })
    );
    expect(code).toBe(0);
    expect(provider.replace.mock.calls[0][0][0].fields).toEqual([
      { name: 'body', weight: 1, value: '<Callout>unclosed\n' },
    ]);
    expect(codecFor).not.toHaveBeenCalled();
  });

  it('leaves an empty body out', async () => {
    await writeDoc('content/doc/a.mdx', '---\ntitle: T\n---\n');
    const provider = providerWith();
    await reindex(
      configWith(provider, {
        fields: { doc: { title: 1, body: 1 } },
        collections: [article('doc', 'mdx')],
      })
    );
    expect(
      provider.replace.mock.calls[0][0][0].fields.map(({ name }) => name)
    ).toEqual(['title']);
  });
});

describe('tinacms search reindex flags', () => {
  it('refuses --check before loading the config, and never replaces', async () => {
    const provider = providerWith();
    const ssrLoadModule = vi.fn(async () => ({
      default: configWith(provider),
    }));
    const err: string[] = [];
    const code = await runCli(
      ['search', 'reindex', '--check', '--root', rootDir],
      {
        cwd: rootDir,
        log: () => {},
        logError: (message) => err.push(message),
        loader: { ssrLoadModule },
      }
    );
    expect(code).toBe(1);
    expect(err.join()).toContain('--check');
    expect(ssrLoadModule).not.toHaveBeenCalled();
    expect(provider.replace).not.toHaveBeenCalled();
  });

  it('refuses an argument after reindex before loading the config, and never replaces', async () => {
    const provider = providerWith();
    const ssrLoadModule = vi.fn(async () => ({
      default: configWith(provider),
    }));
    const err: string[] = [];
    const code = await runCli(
      ['search', 'reindex', 'extra', '--root', rootDir],
      {
        cwd: rootDir,
        log: () => {},
        logError: (message) => err.push(message),
        loader: { ssrLoadModule },
      }
    );
    expect(code).toBe(1);
    expect(err.join()).toContain('Unexpected argument "extra".');
    expect(err.join()).toContain('tinacms <command>');
    expect(ssrLoadModule).not.toHaveBeenCalled();
    expect(provider.replace).not.toHaveBeenCalled();
  });

  it('gives the flag message when both a flag and an argument are wrong', async () => {
    const err: string[] = [];
    const code = await runCli(['search', 'reindex', '--check', 'extra'], {
      cwd: rootDir,
      log: () => {},
      logError: (message) => err.push(message),
    });
    expect(code).toBe(1);
    expect(err.join()).toContain('--check');
    expect(err.join()).not.toContain('Unexpected argument');
  });

  it('refuses a flag it does not know', async () => {
    const err: string[] = [];
    const code = await runCli(['search', 'reindex', '--dry-run'], {
      cwd: rootDir,
      log: () => {},
      logError: (message) => err.push(message),
    });
    expect(code).toBe(1);
    expect(err.join()).toContain('--dry-run');
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
      `import { defineSearchPlugin } from ${JSON.stringify(`${src}/plugins/search/search.plugin`)};
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
