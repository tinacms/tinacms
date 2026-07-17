import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DocumentEntry } from '../../../core/content/contract';
import type { SliceSet, SliceState } from '../../../core/plugin';
import { type ContentSlice, localContentPlugin } from './local-content.plugin';

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
    expect(harness.slice().documents).toEqual(ENTRIES);
  });

  it('saveDocument posts an update op and refreshes the cache entry', async () => {
    const harness = await createSliceHarness(null);
    // Seed the cache as if a list had run.
    harness.slice().documents.push(...ENTRIES);
    await harness
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
    expect(harness.slice().documents).toEqual([
      { path: 'content/posts/hello.mdx', document: { title: 'Renamed' } },
      ENTRIES[1],
    ]);
  });

  it('surfaces a failed request as a rejection (form stays dirty)', async () => {
    const harness = await createSliceHarness(null, false);
    await expect(
      harness.slice().saveDocument('post', 'content/posts/hello.mdx', {})
    ).rejects.toThrow(/update failed \(500\): boom/);
  });
});
