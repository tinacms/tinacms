import { afterEach, describe, expect, it, vi } from 'vitest';
import { TINACLOUD_ASSETS_URL, createTinaCloudClient } from '../client';
import { uploadMedia } from './upload';

const client = createTinaCloudClient({
  clientId: 'abc',
  getToken: () => 'secret',
});

const stubFetch = (...responses: Response[]) => {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
    const next = responses.shift();
    if (!next) throw new Error('unexpected fetch');
    return next;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const s3Xml = (code: string, message: string) =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<Error>\n<Code>${code}</Code>\n<Message>${message}</Message>\n</Error>`,
    { status: 400 }
  );

const signed = () =>
  json({ signedUrl: 'https://s3.test/signed', requestId: 'r-1' });

const png = new File(['x'], 'hero.png', { type: 'image/png' });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('uploadMedia', () => {
  it('gets a signed URL, puts the file, then waits for the request', async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(
      signed(),
      new Response(null, { status: 200 }),
      json({ error: false })
    );
    const done = uploadMedia(client, 'feat/x', png, 'posts');
    await vi.advanceTimersByTimeAsync(1000);
    expect(await done).toBe('posts/hero.png');

    const [getCall, putCall, pollCall] = fetchMock.mock.calls;
    expect(getCall[0]).toBe(
      `${TINACLOUD_ASSETS_URL}/v1/abc/upload_url/posts/hero.png?branch=feat%2Fx`
    );
    expect(new Headers(getCall[1]?.headers).get('Authorization')).toBe(
      'Bearer secret'
    );
    expect(putCall[0]).toBe('https://s3.test/signed');
    expect(putCall[1]?.method).toBe('PUT');
    expect(putCall[1]?.body).toBe(png);
    const putHeaders = new Headers(putCall[1]?.headers);
    expect(putHeaders.get('Content-Type')).toBe('image/png');
    expect(putHeaders.get('Authorization')).toBeNull();
    expect(pollCall[0]).toContain('/request-status/abc/r-1');
  });

  it('uploads under the sanitized name', async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(
      signed(),
      new Response(null, { status: 200 }),
      json({ error: false })
    );
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
    expect(
      new Headers(fetchMock.mock.calls[1][1]?.headers).get('Content-Type')
    ).toBe('application/octet-stream');
  });

  it('keeps the message of a 412 in the detail', async () => {
    stubFetch(json({ message: 'Branch is protected' }, 412));
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code: 'backend-failure',
      detail: expect.stringContaining('Branch is protected'),
    });
  });

  it('reports an S3 error with its message', async () => {
    stubFetch(signed(), s3Xml('AccessDenied', 'Request has expired'));
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code: 'backend-failure',
      detail: 'Request has expired',
    });
  });

  it('reports an S3 EntityTooLarge as too-large', async () => {
    stubFetch(signed(), s3Xml('EntityTooLarge', 'Your proposed upload is big'));
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code: 'too-large',
    });
  });

  it('reports a response with no signed URL as backend-failure', async () => {
    stubFetch(json({ requestId: 'r-1' }));
    await expect(uploadMedia(client, undefined, png)).rejects.toMatchObject({
      code: 'backend-failure',
      detail: 'TinaCloud returned no upload URL.',
    });
  });

  it('reports a request that never finishes as backend-failure', async () => {
    vi.useFakeTimers();
    stubFetch(
      signed(),
      new Response(null, { status: 200 }),
      ...Array.from({ length: 31 }, () => json({}))
    );
    const done = uploadMedia(client, undefined, png);
    const assertion = expect(done).rejects.toMatchObject({
      code: 'backend-failure',
      detail: expect.stringContaining('did not finish'),
    });
    await vi.advanceTimersByTimeAsync(31_000);
    await assertion;
  });
});
