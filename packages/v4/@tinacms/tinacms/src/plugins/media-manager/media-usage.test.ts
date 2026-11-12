import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentError, type DocumentEntry } from '../../core/content/contract';
import {
  type SearchHit,
  type SearchQuery,
  SearchError,
} from '../../core/search/contract';
import type { TinaDocument } from '../../core/schema/types';
import {
  type MediaUsageDeps,
  type UnsavedDocument,
  findMediaUsage,
} from './media-usage';

const docs: Record<string, TinaDocument> = {
  'posts/image.md': { title: 'Image post', hero: 'a/hero.jpg' },
  'posts/body.md': { body: 'See ![x](/uploads/a/hero.jpg) here' },
  'posts/other.md': { hero: 'b/other.jpg' },
};

const hitOf = (path: string, collection = 'post'): SearchHit => ({
  ref: { collection, path },
  score: 1,
  snippet: '',
});

const entry = (path: string): DocumentEntry => ({
  path,
  document: docs[path] ?? {},
});

function makeDeps(overrides: Partial<MediaUsageDeps> = {}) {
  const search = vi.fn(async (_query: string, _options: SearchQuery) =>
    Object.keys(docs).map((path) => hitOf(path))
  );
  const get = vi.fn(async (_c: string, path: string) =>
    path in docs ? entry(path) : null
  );
  const deps: MediaUsageDeps = {
    resolveUrl: (path) => `/uploads/${path}`,
    search: { search },
    content: { get },
    unsaved: [],
    ...overrides,
  };
  return { deps, search, get };
}

const live = () => new AbortController().signal;

afterEach(() => vi.useRealTimers());

describe('findMediaUsage', () => {
  it('finds a document by its image field and one by its body URL, reading each hit back by its ref', async () => {
    const { deps, search, get } = makeDeps();
    const result = await findMediaUsage(deps, ['a/hero.jpg'], live());
    expect(result.searched).toBe(true);
    expect(result.uses.get('a/hero.jpg')).toEqual([
      {
        title: 'Image post',
        collection: 'post',
        documentPath: 'posts/image.md',
        mine: false,
      },
      {
        title: 'posts/body.md',
        collection: 'post',
        documentPath: 'posts/body.md',
        mine: false,
      },
    ]);
    expect(search).toHaveBeenCalledWith('hero.jpg', { limit: 20 });
    expect(get).toHaveBeenCalledWith('post', 'posts/image.md');
  });

  it('shows a document used by saved and unsaved copies once, as saved', async () => {
    const unsaved: UnsavedDocument = {
      path: 'posts/image.md',
      title: 'posts/image.md',
      values: { hero: 'a/hero.jpg' },
    };
    const { deps } = makeDeps({ unsaved: [unsaved] });
    const uses = (await findMediaUsage(deps, ['a/hero.jpg'], live())).uses.get(
      'a/hero.jpg'
    );
    expect(uses?.filter((u) => u.documentPath === 'posts/image.md')).toEqual([
      {
        title: 'Image post',
        collection: 'post',
        documentPath: 'posts/image.md',
        mine: false,
      },
    ]);
  });

  it('marks a document used only by an unsaved edit as mine', async () => {
    const { deps } = makeDeps({
      unsaved: [
        { path: 'posts/new.md', title: 'New', values: { hero: 'c/new.jpg' } },
      ],
    });
    const result = await findMediaUsage(deps, ['c/new.jpg'], live());
    expect(result.uses.get('c/new.jpg')).toEqual([
      {
        title: 'New',
        collection: undefined,
        documentPath: 'posts/new.md',
        mine: true,
      },
    ]);
  });

  it.each([
    ['resolves null', async () => null],
    [
      'rejects not-found',
      async () => {
        throw new ContentError('not-found');
      },
    ],
  ])(
    'drops a hit whose document read %s, and still counts as searched',
    async (_case, get) => {
      const { deps } = makeDeps({ content: { get } });
      const result = await findMediaUsage(deps, ['a/hero.jpg'], live());
      expect(result.searched).toBe(true);
      expect(result.uses.get('a/hero.jpg')).toBeUndefined();
    }
  );

  it('keeps a hit only when the re-read document uses the file', async () => {
    const { deps } = makeDeps();
    const result = await findMediaUsage(deps, ['b/other.jpg'], live());
    expect(result.uses.get('b/other.jpg')?.map((u) => u.documentPath)).toEqual([
      'posts/other.md',
    ]);
  });

  it('gives searched:false with the unsaved uses when search rejects unavailable', async () => {
    const { deps } = makeDeps({
      search: {
        search: async () => {
          throw new SearchError('unavailable');
        },
      },
      unsaved: [
        { path: 'posts/new.md', title: 'New', values: { hero: 'a/hero.jpg' } },
      ],
    });
    const result = await findMediaUsage(deps, ['a/hero.jpg'], live());
    expect(result.searched).toBe(false);
    expect(result.uses.get('a/hero.jpg')?.map((u) => u.mine)).toEqual([true]);
  });

  it('runs at most 4 searches at once, passes limit 20 and no cursor, and re-reads at most 20 hits per file', async () => {
    const paths = Array.from({ length: 20 }, (_, i) => `f/${i}.jpg`);
    const resolvers: Array<() => void> = [];
    let inFlight = 0;
    let peak = 0;
    const many = Array.from({ length: 30 }, (_, i) => hitOf(`d/${i}.md`));
    const search = vi.fn(async (_q: string, _options: SearchQuery) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise<void>((resolve) => resolvers.push(resolve));
      inFlight--;
      return many;
    });
    const get = vi.fn(async (_c: string, p: string) => ({
      path: p,
      document: {},
    }));
    const { deps } = makeDeps({ search: { search }, content: { get } });
    let finished = false;
    const done = findMediaUsage(deps, paths, live()).then((result) => {
      finished = true;
      return result;
    });
    while (!finished) {
      resolvers.splice(0).forEach((resolve) => resolve());
      await new Promise((r) => setTimeout(r, 0));
    }
    await done;
    expect(peak).toBe(4);
    expect(search).toHaveBeenCalledTimes(20);
    for (const [, options] of search.mock.calls) {
      expect(options).toEqual({ limit: 20 });
    }
    expect(get).toHaveBeenCalledTimes(20 * 20);
  });

  it('resolves searched:false with unsaved uses after 10 seconds, and starts no queued search after', async () => {
    vi.useFakeTimers();
    const search = vi.fn(() => new Promise<SearchHit[]>(() => {}));
    const { deps } = makeDeps({
      search: { search },
      unsaved: [
        { path: 'posts/new.md', title: 'New', values: { hero: 'a/hero.jpg' } },
      ],
    });
    const paths = Array.from({ length: 6 }, (_, i) => `a/${i}-hero.jpg`);
    const pending = findMediaUsage(deps, ['a/hero.jpg', ...paths], live());
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(result.searched).toBe(false);
    expect(result.uses.get('a/hero.jpg')?.map((u) => u.mine)).toEqual([true]);
    expect(search).toHaveBeenCalledTimes(4);
  });

  it('starts no content read after an abort and returns no late saved result', async () => {
    let release: (hits: SearchHit[]) => void = () => {};
    const { deps, get } = makeDeps({
      search: {
        search: () => new Promise((resolve) => (release = resolve)),
      },
    });
    const controller = new AbortController();
    const pending = findMediaUsage(deps, ['a/hero.jpg'], controller.signal);
    controller.abort();
    const result = await pending;
    release([hitOf('posts/image.md')]);
    await new Promise((r) => setTimeout(r, 0));
    expect(result).toEqual({ searched: false, uses: new Map() });
    expect(get).not.toHaveBeenCalled();
  });

  it('returns searched:false with unsaved uses when there is no search provider', async () => {
    const { deps } = makeDeps({
      search: null,
      unsaved: [
        {
          path: 'posts/new.md',
          title: 'New',
          values: { body: '/uploads/a/hero.jpg' },
        },
      ],
    });
    const result = await findMediaUsage(deps, ['a/hero.jpg'], live());
    expect(result.searched).toBe(false);
    expect(result.uses.get('a/hero.jpg')).toHaveLength(1);
  });

  it('returns searched:false instead of throwing when a content read fails for another reason', async () => {
    const { deps } = makeDeps({
      content: {
        get: async () => {
          throw new ContentError('network');
        },
      },
    });
    expect((await findMediaUsage(deps, ['a/hero.jpg'], live())).searched).toBe(
      false
    );
  });
});
