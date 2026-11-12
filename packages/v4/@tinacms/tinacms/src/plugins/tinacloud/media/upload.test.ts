import { afterEach, describe, expect, it, vi } from 'vitest';
import { type FakeXhr, stubXhr } from '../../../test/fake-xhr';
import { TINACLOUD_ASSETS_URL, createTinaCloudClient } from '../client';
import { AuthError } from '../../../core/auth/contract';
import { MediaError } from '../../../core/media/contract';
import { uploadMedia } from './upload';

const client = createTinaCloudClient({
  clientId: 'abc',
  getToken: () => 'secret',
});

const stubFetch = (...responses: (Response | Error)[]) => {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
    const next = responses.shift();
    if (!next) throw new Error('unexpected fetch');
    if (next instanceof Error) throw next;
    return next;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const s3Xml = (code: string, message: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<Error>\n<Code>${code}</Code>\n<Message>${message}</Message>\n</Error>`;

const stubPut = (status = 200, text = '') =>
  stubXhr((xhr) => queueMicrotask(() => xhr.respond(status, text))).sent;

const signed = () =>
  json({ signedUrl: 'https://s3.test/signed', requestId: 'r-1' });

const png = new File(['x'], 'hero.png', { type: 'image/png' });

const offline = () => new TypeError('Failed to fetch');

const expectNoAnswer = (failure: unknown) => {
  expect(failure).toBeInstanceOf(Error);
  expect(failure).not.toBeInstanceOf(MediaError);
  expect(failure).not.toMatchObject({ name: 'AbortError' });
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('uploadMedia', () => {
  it('gets a signed URL, puts the file, then waits for the request', async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(signed(), json({ error: false }));
    const puts = stubPut();
    const done = uploadMedia(client, 'feat/x', png, 'posts');
    await vi.advanceTimersByTimeAsync(1000);
    expect(await done).toBe('posts/hero.png');

    const [getCall, pollCall] = fetchMock.mock.calls;
    expect(getCall[0]).toBe(
      `${TINACLOUD_ASSETS_URL}/v1/abc/upload_url/posts/hero.png?branch=feat%2Fx`
    );
    expect(new Headers(getCall[1]?.headers).get('Authorization')).toBe(
      'Bearer secret'
    );
    expect(puts).toHaveLength(1);
    expect(puts[0].url).toBe('https://s3.test/signed');
    expect(puts[0].method).toBe('PUT');
    expect(puts[0].body).toBe(png);
    expect(puts[0].requestHeaders).toEqual({ 'content-type': 'image/png' });
    expect(pollCall[0]).toContain('/request-status/abc/r-1');
  });

  it('uploads under the sanitized name', async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(signed(), json({ error: false }));
    const puts = stubPut();
    const done = uploadMedia(
      client,
      undefined,
      new File(['x'], 'my hero?.png')
    );
    await vi.advanceTimersByTimeAsync(1000);
    expect(await done).toBe('my-hero.png');
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${TINACLOUD_ASSETS_URL}/v1/abc/upload_url/my-hero.png`
    );
    expect(puts[0].requestHeaders).toEqual({
      'content-type': 'application/octet-stream',
    });
  });

  it('reports a 412 for the upload URL as name-taken and sends no bytes', async () => {
    stubFetch(json({ message: 'File already exists' }, 412));
    const puts = stubPut();
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code: 'name-taken',
      detail: 'File already exists',
    });
    expect(puts).toHaveLength(0);
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [404, 'not-found'],
    [413, 'too-large'],
    [500, 'backend-failure'],
  ])('reports a %i for the upload URL as %s', async (status, code) => {
    stubFetch(json({ message: 'No' }, status));
    const puts = stubPut();
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code,
    });
    expect(puts).toHaveLength(0);
  });

  it('reports an S3 error with its message', async () => {
    stubFetch(signed());
    stubPut(400, s3Xml('AccessDenied', 'Request has expired'));
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code: 'backend-failure',
      detail: 'Request has expired',
    });
  });

  it('reports an S3 EntityTooLarge as too-large', async () => {
    stubFetch(signed());
    stubPut(400, s3Xml('EntityTooLarge', 'Your proposed upload is big'));
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code: 'too-large',
    });
  });

  it('rejects an upload URL request that got no answer with an error that is no MediaError', async () => {
    stubFetch(offline());
    const puts = stubPut();
    expectNoAnswer(
      await uploadMedia(client, undefined, png).catch((cause: unknown) => cause)
    );
    expect(puts).toHaveLength(0);
  });

  it('rejects a token request that got no answer with an error that is no MediaError', async () => {
    const fetchMock = stubFetch();
    const offlineClient = createTinaCloudClient({
      clientId: 'abc',
      getToken: () => {
        throw new AuthError('network');
      },
    });
    expectNoAnswer(
      await uploadMedia(offlineClient, undefined, png).catch(
        (cause: unknown) => cause
      )
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a PUT that the network drops with an error that is no MediaError', async () => {
    stubFetch(signed());
    stubXhr((xhr) => queueMicrotask(() => xhr.fail()));
    expectNoAnswer(
      await uploadMedia(client, undefined, png).catch((cause: unknown) => cause)
    );
  });

  it('reports a response with no signed URL as backend-failure', async () => {
    stubFetch(json({ requestId: 'r-1' }));
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code: 'backend-failure',
      detail: 'TinaCloud returned no upload URL.',
    });
  });

  describe('after the PUT answered 2xx', () => {
    const settleAfter = async (ms: number, ...polls: (Response | Error)[]) => {
      vi.useFakeTimers();
      stubFetch(signed(), ...polls);
      stubXhr((xhr) =>
        queueMicrotask(() => {
          xhr.finishUpload();
          xhr.respond(200);
        })
      );
      const onProgress = vi.fn();
      const settled = uploadMedia(client, undefined, png, '', {
        onProgress,
      }).catch((cause: unknown) => cause);
      await vi.advanceTimersByTimeAsync(ms);
      const failure = await settled;
      expect(onProgress).toHaveBeenLastCalledWith(1);
      return failure;
    };

    it('reports a request that TinaCloud says failed as backend-failure', async () => {
      const failure = await settleAfter(
        1000,
        json({ error: true, message: 'Commit failed' })
      );
      expect(failure).toBeInstanceOf(MediaError);
      expect(failure).toMatchObject({
        code: 'backend-failure',
        detail: 'Commit failed',
      });
    });

    it.each([401, 403])(
      'reports a %i during the wait as unauthorized',
      async (status) => {
        const failure = await settleAfter(
          1000,
          json({ message: 'No' }, status)
        );
        expect(failure).toBeInstanceOf(MediaError);
        expect(failure).toMatchObject({ code: 'unauthorized' });
      }
    );

    it('rejects a poll that got no answer with an error that is no MediaError', async () => {
      expectNoAnswer(await settleAfter(1000, offline()));
    });

    it('rejects a poll that TinaCloud answers with a 500 with an error that is no MediaError', async () => {
      expectNoAnswer(await settleAfter(1000, json({ message: 'No' }, 500)));
    });

    it('rejects a wait that runs out of time with an error that is no MediaError', async () => {
      const failure = await settleAfter(
        31_000,
        ...Array.from({ length: 31 }, () => json({}))
      );
      expectNoAnswer(failure);
      expect(failure).toMatchObject({
        message: expect.stringContaining('did not finish'),
      });
    });
  });

  describe('with upload options', () => {
    const startPut = async (signal?: AbortSignal) => {
      const fetchMock = stubFetch(signed(), json({ error: false }));
      const { sent } = stubXhr();
      const onProgress = vi.fn();
      const done = uploadMedia(client, undefined, png, '', {
        onProgress,
        signal,
      });
      await vi.waitFor(() => expect(sent).toHaveLength(1));
      const xhr: FakeXhr = sent[0];
      return { xhr, done, onProgress, fetchMock };
    };

    it('reports rising progress from 0 to 1 during the PUT', async () => {
      const { xhr, done, onProgress } = await startPut();
      expect(onProgress.mock.calls).toEqual([[0]]);
      xhr.progress(1, 2);
      xhr.finishUpload();
      xhr.respond(200);
      expect(await done).toBe('hero.png');
      expect(onProgress.mock.calls.map(([fraction]) => fraction)).toEqual([
        0, 0.5, 1,
      ]);
    });

    it('stops the PUT with an AbortError when the signal aborts mid-body', async () => {
      const controller = new AbortController();
      const { xhr, done, fetchMock } = await startPut(controller.signal);
      xhr.progress(1, 2);
      controller.abort();
      const failure = await done.catch((cause: unknown) => cause);
      expect(failure).toBeInstanceOf(DOMException);
      expect(failure).toMatchObject({ name: 'AbortError' });
      expect(failure).not.toBeInstanceOf(MediaError);
      expect(xhr.aborted).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('sends no PUT when the signal aborts during the upload URL request', async () => {
      const controller = new AbortController();
      const fetchMock = vi.fn(async () => {
        controller.abort();
        return signed();
      });
      vi.stubGlobal('fetch', fetchMock);
      const { sent } = stubXhr();
      const failure = await uploadMedia(client, undefined, png, '', {
        signal: controller.signal,
      }).catch((cause: unknown) => cause);
      expect(failure).toBeInstanceOf(DOMException);
      expect(failure).toMatchObject({ name: 'AbortError' });
      expect(sent).toHaveLength(0);
    });

    it('sends nothing for a signal that is already aborted', async () => {
      const fetchMock = stubFetch(signed());
      const { sent } = stubXhr();
      await expect(
        uploadMedia(client, undefined, png, '', {
          signal: AbortSignal.abort(),
        })
      ).rejects.toMatchObject({ name: 'AbortError' });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(sent).toHaveLength(0);
    });

    it('ignores an abort after every byte is sent, and waits for the request', async () => {
      const controller = new AbortController();
      const { xhr, done, fetchMock } = await startPut(controller.signal);
      xhr.finishUpload();
      controller.abort();
      expect(xhr.aborted).toBe(false);
      xhr.respond(200);
      expect(await done).toBe('hero.png');
      expect(fetchMock.mock.calls[1][0]).toContain('/request-status/abc/r-1');
    });
  });
});
