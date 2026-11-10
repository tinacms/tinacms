import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DocumentEntry } from '../../core/content/contract';
import type { TinaDocument } from '../../core/schema/types';
import {
  type MediaUsageDeps,
  type UnsavedDocument,
  findMediaUsage,
} from './media-usage';

const docs: Record<string, TinaDocument> = {
  'posts/image.md': { hero: 'a/hero.jpg' },
  'posts/body.md': { body: 'See ![x](/uploads/a/hero.jpg) here' },
  'posts/other.md': { hero: 'b/other.jpg' },
};

const entry = (path: string): DocumentEntry => ({
  path,
  title: path,
  document: docs[path] ?? {},
});

function makeDeps(overrides: Partial<MediaUsageDeps> = {}) {
  const search = vi.fn(async (_query: string) =>
    Object.keys(docs).map((ref) => ({ ref }))
  );
  const get = vi.fn(async (_c: string, path: string) =>
    path in docs ? entry(path) : null
  );
  const list = vi.fn(async () =>
    Object.keys(docs).map((path) => ({ path, title: `Title ${path}` }))
  );
  const deps: MediaUsageDeps = {
    resolveUrl: (path) => `/uploads/${path}`,
    search: { search },
    content: { get, list },
    collections: ['post'],
    unsaved: [],
    ...overrides,
  };
  return { deps, search, get, list };
}

const live = () => new AbortController().signal;

afterEach(() => vi.useRealTimers());

describe('findMediaUsage', () => {
  it('finds a document by its image field and one by its body URL', async () => {
    const { deps, search } = makeDeps();
    const result = await findMediaUsage(deps, ['a/hero.jpg'], live());
    expect(result.searched).toBe(true);
    expect(result.uses.get('a/hero.jpg')?.map((u) => u.documentPath)).toEqual([
      'posts/image.md',
      'posts/body.md',
    ]);
    expect(search).toHaveBeenCalledWith('hero.jpg');
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
    const image = uses?.filter((u) => u.documentPath === 'posts/image.md');
    expect(image).toEqual([
      {
        title: 'Title posts/image.md',
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

  it('drops a ref that matches no listed document', async () => {
    const { deps, get } = makeDeps({
      search: { search: async () => [{ ref: 'unknown-ref' }] },
    });
    const result = await findMediaUsage(deps, ['a/hero.jpg'], live());
    expect(result.searched).toBe(true);
    expect(result.uses.get('a/hero.jpg')).toBeUndefined();
    expect(get).not.toHaveBeenCalled();
  });

  it('keeps a hit only when the re-read document uses the file', async () => {
    const { deps } = makeDeps();
    const result = await findMediaUsage(deps, ['b/other.jpg'], live());
    expect(result.uses.get('b/other.jpg')?.map((u) => u.documentPath)).toEqual([
      'posts/other.md',
    ]);
  });

  it('runs at most 4 searches at once and re-reads at most 20 hits per file', async () => {
    const paths = Array.from({ length: 20 }, (_, i) => `f/${i}.jpg`);
    const resolvers: Array<() => void> = [];
    let inFlight = 0;
    let peak = 0;
    const many = Array.from({ length: 30 }, (_, i) => `d/${i}.md`);
    const search = vi.fn(async (_q: string) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise<void>((resolve) => resolvers.push(resolve));
      inFlight--;
      return many.map((ref) => ({ ref }));
    });
    const get = vi.fn();
    const { deps } = makeDeps({
      search: { search },
      content: {
        get: async (c, p) => {
          get(c, p);
          return { path: p, document: {} };
        },
        list: async () => many.map((path) => ({ path })),
      },
    });
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
    expect(get).toHaveBeenCalledTimes(20 * 20);
  });

  it('resolves searched:false with unsaved uses after 10 seconds', async () => {
    vi.useFakeTimers();
    const { deps } = makeDeps({
      search: { search: () => new Promise(() => {}) },
      unsaved: [
        { path: 'posts/new.md', title: 'New', values: { hero: 'a/hero.jpg' } },
      ],
    });
    const pending = findMediaUsage(deps, ['a/hero.jpg'], live());
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(result.searched).toBe(false);
    expect(result.uses.get('a/hero.jpg')?.map((u) => u.mine)).toEqual([true]);
  });

  it('returns no late saved result after the signal aborts', async () => {
    let release: (hits: { ref: string }[]) => void = () => {};
    const { deps } = makeDeps({
      search: {
        search: () => new Promise((resolve) => (release = resolve)),
      },
    });
    const controller = new AbortController();
    const pending = findMediaUsage(deps, ['a/hero.jpg'], controller.signal);
    await vi.waitFor(() => expect(release).not.toBeUndefined());
    controller.abort();
    const result = await pending;
    release([{ ref: 'posts/image.md' }]);
    expect(result).toEqual({ searched: false, uses: new Map() });
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

  it('returns searched:false instead of throwing when search or content fails', async () => {
    const failingSearch = makeDeps({
      search: {
        search: async () => {
          throw new Error('down');
        },
      },
    });
    expect(
      (await findMediaUsage(failingSearch.deps, ['a/hero.jpg'], live()))
        .searched
    ).toBe(false);
    const failingContent = makeDeps({
      content: {
        list: async () => {
          throw new Error('down');
        },
        get: async () => null,
      },
    });
    expect(
      (await findMediaUsage(failingContent.deps, ['a/hero.jpg'], live()))
        .searched
    ).toBe(false);
  });
});
