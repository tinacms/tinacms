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
  it('posts a list op and returns the entries', async () => {
    const harness = await createSliceHarness(ENTRIES);
    const listed = await harness.slice().list('post');
    expect(harness.requests).toEqual([{ op: 'list', collection: 'post' }]);
    expect(listed).toEqual(ENTRIES);
  });

  it('posts a get op for one document', async () => {
    const harness = await createSliceHarness(ENTRIES[0]);
    const entry = await harness.slice().get('post', 'content/posts/hello.mdx');
    expect(harness.requests).toEqual([
      { op: 'get', collection: 'post', path: 'content/posts/hello.mdx' },
    ]);
    expect(entry).toEqual(ENTRIES[0]);
  });

  it('posts an update op and returns the persisted entry', async () => {
    const persisted: DocumentEntry = {
      path: 'content/posts/hello.mdx',
      document: { title: 'Renamed', category: 'not-in-schema' },
    };
    const harness = await createSliceHarness(persisted);
    const saved = await harness
      .slice()
      .update('post', 'content/posts/hello.mdx', { title: 'Renamed' });
    expect(harness.requests).toEqual([
      {
        op: 'update',
        collection: 'post',
        path: 'content/posts/hello.mdx',
        value: { title: 'Renamed' },
      },
    ]);
    expect(saved).toEqual(persisted);
  });

  it('surfaces a failed request as a rejection (form stays dirty)', async () => {
    const harness = await createSliceHarness(null, false);
    await expect(
      harness.slice().update('post', 'content/posts/hello.mdx', {})
    ).rejects.toThrow(/update failed \(500\): boom/);
  });

  it('writes no store state, because it holds no cache', async () => {
    const harness = await createSliceHarness(ENTRIES);
    await harness.slice().list('post');
    expect(Object.keys(harness.slice())).toEqual(['list', 'get', 'update']);
  });
});
