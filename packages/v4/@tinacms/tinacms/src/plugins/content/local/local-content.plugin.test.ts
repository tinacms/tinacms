import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  ContentSlice,
  DocumentEntry,
} from '../../../core/content/contract';
import type { SliceSet, SliceState } from '../../../core/plugin';
import { localContentPlugin } from './local-content.plugin';

const ENTRIES: DocumentEntry[] = [
  { path: 'content/posts/hello.mdx', document: { title: 'Hello' } },
  { path: 'content/posts/second.mdx', document: { title: 'Second' } },
];

// Minimal slice harness: the namespace-scoped `set` the store hands a slice.
const createSliceHarness = async (responseBody: unknown, ok = true) => {
  const requests: unknown[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      requests.push(JSON.parse(init.body as string));
      return {
        ok,
        status: ok ? 200 : 500,
        text: async () => 'boom',
        json: async () => responseBody,
      };
    })
  );
  const manifest = localContentPlugin({ url: '/test/content' });
  const clientModule = await manifest.client?.();
  const sliceCreator = clientModule?.default.slice;
  if (!sliceCreator) throw new Error('local-content plugin has no slice');
  let state: SliceState = {};
  const set: SliceSet = (partial) => {
    state = {
      ...state,
      ...(typeof partial === 'function' ? partial(state) : partial),
    };
  };
  state = sliceCreator(set, () => ({ content: state }));
  return {
    requests,
    slice: () => state as unknown as ContentSlice,
  };
};

afterEach(() => vi.unstubAllGlobals());

describe('content slice', () => {
  it('loadDocuments posts a list op and caches the result', async () => {
    const harness = await createSliceHarness(ENTRIES);
    const loaded = await harness.slice().loadDocuments('post');
    expect(harness.requests).toEqual([{ op: 'list', collection: 'post' }]);
    expect(loaded).toEqual(ENTRIES);
    expect(harness.slice().documents).toEqual({ post: ENTRIES });
  });

  it('saveDocument posts an update op and caches the persisted entry', async () => {
    // The server merges unknown fields into the persisted document — the cache
    // must hold what came back, not the raw form value.
    const persisted: DocumentEntry = {
      path: 'content/posts/hello.mdx',
      document: { title: 'Renamed', category: 'not-in-schema' },
    };
    const harness = await createSliceHarness(persisted);
    // Seed the cache as if a list had run.
    harness.slice().documents.post = [...ENTRIES];
    const saved = await harness
      .slice()
      .saveDocument('post', 'content/posts/hello.mdx', { title: 'Renamed' });
    expect(harness.requests).toEqual([
      {
        op: 'update',
        collection: 'post',
        path: 'content/posts/hello.mdx',
        value: { title: 'Renamed' },
      },
    ]);
    expect(saved).toEqual(persisted);
    expect(harness.slice().documents).toEqual({
      post: [persisted, ENTRIES[1]],
    });
  });

  it('saveDocument appends the persisted entry when the path is not cached', async () => {
    const persisted: DocumentEntry = {
      path: 'content/posts/new.mdx',
      document: { title: 'New' },
    };
    const harness = await createSliceHarness(persisted);
    harness.slice().documents.post = [...ENTRIES];
    const saved = await harness
      .slice()
      .saveDocument('post', 'content/posts/new.mdx', { title: 'New' });
    expect(saved).toEqual(persisted);
    expect(harness.slice().documents).toEqual({
      post: [...ENTRIES, persisted],
    });
  });

  it('surfaces a failed request as a rejection (form stays dirty)', async () => {
    const harness = await createSliceHarness(null, false);
    await expect(
      harness.slice().saveDocument('post', 'content/posts/hello.mdx', {})
    ).rejects.toThrow(/update failed \(500\): boom/);
  });
});
