import { afterEach, describe, expect, it, vi } from 'vitest';
import { toUserId } from '../../../core/auth/contract';
import type { MediaSlice } from '../../../core/media/contract';
import type { SliceSet, SliceState } from '../../../core/plugin';
import { MEDIA_ERROR_HEADER, localMediaPlugin } from './local-media.plugin';

interface RecordedRequest {
  url: string;
  method: string;
  body: unknown;
  authorization: string | null;
}

const signedInAs = (token: string): SliceState => ({
  status: 'signed-in',
  user: { id: toUserId('ada') },
  roles: ['editor'],
  getToken: async () => token,
  login: async () => {},
  logout: async () => {},
});

const createSliceHarness = async (
  responseBody: unknown,
  ok = true,
  failure: { status: number; headers?: Record<string, string> } = {
    status: 500,
  },
  auth?: SliceState
) => {
  const requests: RecordedRequest[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      requests.push({
        url,
        method: init.method ?? 'GET',
        body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
        authorization: new Headers(init.headers).get('authorization'),
      });
      return {
        ok,
        status: ok ? 200 : failure.status,
        text: async () => 'boom',
        headers: new Headers(failure.headers),
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
  state = sliceCreator(set, () => ({
    media: state,
    ...(auth ? { auth } : {}),
  }));
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

  it('gets a page of a folder', async () => {
    const page = { items: [{ path: 'a.png', kind: 'file' }] };
    const harness = await createSliceHarness(page);
    expect(await harness.slice().list('posts', { limit: 10 })).toEqual(page);
    expect(harness.requests[0].url).toBe('/test/media?folder=posts&limit=10');
    expect(harness.requests[0].method).toBe('GET');
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

  it('reports an unknown failure as backend-failure', async () => {
    const harness = await createSliceHarness(null, false);
    await expect(
      harness.slice().upload(new File(['x'], 'x.png'))
    ).rejects.toMatchObject({ code: 'backend-failure', detail: 'boom' });
  });

  it('reports a 413 as too-large', async () => {
    const harness = await createSliceHarness(null, false, { status: 413 });
    await expect(
      harness.slice().upload(new File(['x'], 'x.png'))
    ).rejects.toMatchObject({ code: 'too-large' });
  });

  it('keeps the code the server reports', async () => {
    const harness = await createSliceHarness(null, false, {
      status: 400,
      headers: { [MEDIA_ERROR_HEADER]: 'not-found' },
    });
    await expect(harness.slice().delete('old.png')).rejects.toMatchObject({
      code: 'not-found',
    });
  });
});

describe('media slice with an auth plugin', () => {
  it('sends the bearer token on an upload, a list and a delete', async () => {
    const harness = await createSliceHarness(
      { path: 'a.png', items: [] },
      true,
      undefined,
      signedInAs('tok')
    );
    await harness.slice().upload(new File(['x'], 'a.png'));
    await harness.slice().list('');
    await harness.slice().delete('a.png');
    expect(harness.requests.map(({ authorization }) => authorization)).toEqual([
      'Bearer tok',
      'Bearer tok',
      'Bearer tok',
    ]);
  });

  it('sends no authorization header with no auth plugin', async () => {
    const harness = await createSliceHarness(null);
    await harness.slice().delete('a.png');
    expect(harness.requests[0].authorization).toBeNull();
  });
});
