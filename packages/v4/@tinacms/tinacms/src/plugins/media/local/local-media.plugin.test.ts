import { afterEach, describe, expect, it, vi } from 'vitest';
import { MEDIA_EXTENSIONS } from '../../media-manager/media-types';
import { toUserId } from '../../../core/auth/contract';
import { MediaError, type MediaSlice } from '../../../core/media/contract';
import type { SliceSet, SliceState } from '../../../core/plugin';
import { type FakeXhr, stubXhr } from '../../../test/fake-xhr';
import { MEDIA_ERROR_HEADER, localMediaPlugin } from './local-media.plugin';

interface RecordedRequest {
  url: string;
  method: string;
  body: unknown;
  authorization: string | null;
}

const signedInAs = (token: string, sendsTokenToSite = true): SliceState => ({
  sendsTokenToSite,
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
  stubXhr((xhr) => {
    requests.push({
      url: xhr.url,
      method: xhr.method,
      body: xhr.body,
      authorization: xhr.requestHeaders.authorization ?? null,
    });
    queueMicrotask(() => {
      if (ok) {
        xhr.respond(200, JSON.stringify(responseBody));
      } else {
        xhr.respond(failure.status, 'boom', failure.headers);
      }
    });
  });
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

  it('mounts a slice with the five media operations and its features', async () => {
    const harness = await createSliceHarness(null);
    expect(Object.keys(harness.slice()).sort()).toEqual([
      'delete',
      'features',
      'list',
      'rename',
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
    expect(request.method).toBe('POST');
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

  it('posts a rename op and returns the new path', async () => {
    const harness = await createSliceHarness({ path: 'posts/new.png' });
    expect(await harness.slice().rename?.('old.png', 'posts/new.png')).toBe(
      'posts/new.png'
    );
    expect(harness.requests[0].body).toEqual({
      op: 'rename',
      from: 'old.png',
      to: 'posts/new.png',
    });
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

  it('keeps the code the server reports for an upload', async () => {
    const harness = await createSliceHarness(null, false, {
      status: 400,
      headers: { [MEDIA_ERROR_HEADER]: 'name-taken' },
    });
    await expect(
      harness.slice().upload(new File(['x'], 'x.png'))
    ).rejects.toMatchObject({ code: 'name-taken', detail: 'boom' });
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

describe('media slice upload options', () => {
  const startUpload = async (signal?: AbortSignal) => {
    const harness = await createSliceHarness(null);
    const { sent } = stubXhr();
    const onProgress = vi.fn();
    const done = harness
      .slice()
      .upload(new File(['jpeg'], 'hero.jpg'), 'posts', { onProgress, signal });
    await vi.waitFor(() => expect(sent).toHaveLength(1));
    const xhr: FakeXhr = sent[0];
    return { xhr, done, onProgress };
  };

  it('accepts files up to 24 MB', async () => {
    const harness = await createSliceHarness(null);
    expect(harness.slice().features?.maxSize).toBe(24 * 1024 * 1024);
  });

  it('accepts exactly the extensions of the media type table', async () => {
    const harness = await createSliceHarness(null);
    const { features } = harness.slice();
    expect(features?.acceptedExtensions).toEqual([...MEDIA_EXTENSIONS]);
    expect(features?.acceptedMimeTypes).toBeUndefined();
  });

  it('reports rising progress from 0 to 1 and returns the path of the server', async () => {
    const { xhr, done, onProgress } = await startUpload();
    xhr.progress(1, 4);
    xhr.progress(3, 4);
    xhr.finishUpload();
    xhr.respond(200, JSON.stringify({ path: 'posts/hero.jpg' }));
    expect(await done).toBe('posts/hero.jpg');
    expect(onProgress.mock.calls.map(([fraction]) => fraction)).toEqual([
      0, 0.25, 0.75, 1,
    ]);
  });

  it('stops the request with an AbortError when the signal aborts mid-body', async () => {
    const controller = new AbortController();
    const { xhr, done } = await startUpload(controller.signal);
    xhr.progress(1, 4);
    controller.abort();
    await expect(done).rejects.toMatchObject({ name: 'AbortError' });
    expect(xhr.aborted).toBe(true);
  });

  it('sends no request for a signal that is already aborted', async () => {
    const harness = await createSliceHarness(null);
    const { sent } = stubXhr();
    await expect(
      harness
        .slice()
        .upload(new File(['x'], 'x.png'), '', { signal: AbortSignal.abort() })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(sent).toHaveLength(0);
  });

  it('ignores an abort after every byte is sent', async () => {
    const controller = new AbortController();
    const { xhr, done } = await startUpload(controller.signal);
    xhr.finishUpload();
    controller.abort();
    expect(xhr.aborted).toBe(false);
    xhr.respond(200, JSON.stringify({ path: 'posts/hero.jpg' }));
    expect(await done).toBe('posts/hero.jpg');
  });

  it('rejects a connection that drops mid-body with an error that is no MediaError', async () => {
    const { xhr, done, onProgress } = await startUpload();
    xhr.progress(1, 4);
    xhr.fail();
    const failure = await done.catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(Error);
    expect(failure).not.toBeInstanceOf(MediaError);
    expect(failure).not.toMatchObject({ name: 'AbortError' });
    expect(onProgress).not.toHaveBeenCalledWith(1);
  });

  it.each(['', '<html>proxy</html>', '{"path":'])(
    'rejects a 2xx with the unreadable body %j with an error that is no MediaError',
    async (body) => {
      const { xhr, done, onProgress } = await startUpload();
      xhr.finishUpload();
      xhr.respond(200, body);
      const failure = await done.catch((cause: unknown) => cause);
      expect(failure).toBeInstanceOf(Error);
      expect(failure).not.toBeInstanceOf(MediaError);
      expect(onProgress).toHaveBeenLastCalledWith(1);
    }
  );
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

  it('sends no token when the auth plugin has no server segment', async () => {
    const harness = await createSliceHarness(
      null,
      true,
      undefined,
      signedInAs('tok', false)
    );
    await harness.slice().delete('a.png');
    expect(harness.requests[0].authorization).toBeNull();
  });
});
