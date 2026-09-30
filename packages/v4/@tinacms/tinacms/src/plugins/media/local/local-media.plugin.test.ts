import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MediaSlice } from '../../../core/media/contract';
import type { SliceSet, SliceState } from '../../../core/plugin';
import { localMediaPlugin } from './local-media.plugin';

interface RecordedRequest {
  url: string;
  body: unknown;
}

const createSliceHarness = async (responseBody: unknown, ok = true) => {
  const requests: RecordedRequest[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      requests.push({
        url,
        body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
      });
      return {
        ok,
        status: ok ? 200 : 500,
        text: async () => 'boom',
        json: async () => responseBody,
      };
    })
  );
  const manifest = localMediaPlugin({ url: '/test/media' });
  const clientModule = await manifest.client?.();
  const sliceCreator = clientModule?.default.slice;
  if (!sliceCreator) throw new Error('local-media plugin has no slice');
  let state: SliceState = {};
  const set: SliceSet = (partial) => {
    state = {
      ...state,
      ...(typeof partial === 'function' ? partial(state) : partial),
    };
  };
  state = sliceCreator(set, () => ({ media: state }));
  return { requests, slice: () => state as unknown as MediaSlice };
};

afterEach(() => vi.unstubAllGlobals());

describe('local media plugin', () => {
  it('provides the media capability', () => {
    expect(localMediaPlugin().provides).toEqual(['media']);
  });

  it('mounts a slice with the four media operations', async () => {
    const harness = await createSliceHarness(null);
    expect(Object.keys(harness.slice()).sort()).toEqual([
      'delete',
      'list',
      'resolveUrl',
      'upload',
    ]);
  });
});

describe('media slice', () => {
  it('uploads the file as form data and returns its media path', async () => {
    const harness = await createSliceHarness({ path: 'posts/hero.jpg' });
    const file = new File(['jpeg'], 'hero.jpg');
    expect(await harness.slice().upload(file, 'posts')).toBe('posts/hero.jpg');
    const [request] = harness.requests;
    expect(request.url).toBe('/test/media/upload');
    expect(request.body).toBeInstanceOf(FormData);
    const form = request.body as FormData;
    expect(form.get('folder')).toBe('posts');
    expect((form.get('file') as File).name).toBe('hero.jpg');
  });

  it('posts a list op with the page', async () => {
    const page = { items: [{ path: 'a.png', kind: 'file' }] };
    const harness = await createSliceHarness(page);
    expect(await harness.slice().list('', { limit: 10 })).toEqual(page);
    expect(harness.requests[0].body).toEqual({
      op: 'list',
      folder: '',
      limit: 10,
    });
  });

  it('posts a delete op', async () => {
    const harness = await createSliceHarness(null);
    await harness.slice().delete('old.png');
    expect(harness.requests[0].body).toEqual({ op: 'delete', path: 'old.png' });
  });

  it('resolves a media path to a URL under the media root', async () => {
    const harness = await createSliceHarness(null);
    expect(harness.slice().resolveUrl('posts/my hero.jpg')).toBe(
      '/uploads/posts/my%20hero.jpg'
    );
  });

  it('surfaces a failed upload as a rejection', async () => {
    const harness = await createSliceHarness(null, false);
    await expect(
      harness.slice().upload(new File(['x'], 'x.png'))
    ).rejects.toThrow(/upload failed \(500\): boom/);
  });
});
