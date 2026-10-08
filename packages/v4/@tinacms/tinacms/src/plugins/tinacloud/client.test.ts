import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  TINACLOUD_CONTENT_URL,
  TINACLOUD_IDENTITY_URL,
  TinaCloudError,
  createTinaCloudClient,
} from './client';

const client = (token: { value?: string } = { value: 'secret' }) =>
  createTinaCloudClient({ clientId: 'abc', getToken: async () => token.value });

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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('authedFetch', () => {
  it('sends the token as a bearer header and returns the JSON body', async () => {
    const fetchMock = stubFetch(json({ ok: 1 }));
    expect(
      await client().authedFetch('https://x.test/a', {
        headers: { 'content-type': 'application/json' },
      })
    ).toEqual({ ok: 1 });
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer secret');
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('throws a 401 TinaCloudError without calling fetch when no token is available', async () => {
    const fetchMock = stubFetch();
    await expect(
      client({}).authedFetch('https://x.test/a')
    ).rejects.toMatchObject({ name: 'TinaCloudError', status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws the status and body of a non-2xx response', async () => {
    stubFetch(json({ message: 'expired' }, 401));
    await expect(
      client().authedFetch('https://x.test/a')
    ).rejects.toMatchObject({ status: 401, body: { message: 'expired' } });
  });

  it('keeps a body that is not JSON as text', async () => {
    stubFetch(new Response('<html>bad gateway</html>', { status: 502 }));
    await expect(
      client().authedFetch('https://x.test/a')
    ).rejects.toMatchObject({ status: 502, body: '<html>bad gateway</html>' });
  });

  it('reports a network failure with no status', async () => {
    stubFetch(new TypeError('Failed to fetch'));
    const failure = await client()
      .authedFetch('https://x.test/a')
      .catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(TinaCloudError);
    expect(failure).toMatchObject({
      status: undefined,
      message: expect.stringContaining('Failed to fetch'),
    });
  });
});

describe('waitForRequest', () => {
  it('polls the request status every second until it succeeds', async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(json({}), json({ error: false }));
    const done = client().waitForRequest('req-1');
    await vi.advanceTimersByTimeAsync(2000);
    await done;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${TINACLOUD_CONTENT_URL}/request-status/abc/req-1`
    );
  });

  it('throws the message of a request that failed', async () => {
    vi.useFakeTimers();
    stubFetch(json({ error: true, message: 'Commit failed' }));
    const done = client().waitForRequest('req-1');
    const assertion = expect(done).rejects.toMatchObject({
      name: 'TinaCloudError',
      message: 'Commit failed',
    });
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it('times out after 30 seconds', async () => {
    vi.useFakeTimers();
    stubFetch(...Array.from({ length: 31 }, () => json({})));
    const done = client().waitForRequest('req-1');
    const assertion = expect(done).rejects.toThrow(/did not finish/);
    await vi.advanceTimersByTimeAsync(31_000);
    await assertion;
  });
});

describe('getProject', () => {
  it('fetches the project once and shares the result', async () => {
    const fetchMock = stubFetch(
      json({ defaultBranch: 'main', mediaBranch: 'main', role: 'admin' })
    );
    const tinaCloud = client();
    const [first, second] = await Promise.all([
      tinaCloud.getProject(),
      tinaCloud.getProject(),
    ]);
    expect(first).toEqual({ defaultBranch: 'main', mediaBranch: 'main' });
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${TINACLOUD_IDENTITY_URL}/v2/apps/abc`
    );
  });

  it('retries after a failure', async () => {
    stubFetch(json({}, 500), json({ defaultBranch: 'main' }));
    const tinaCloud = client();
    await expect(tinaCloud.getProject()).rejects.toMatchObject({ status: 500 });
    await expect(tinaCloud.getProject()).resolves.toEqual({
      defaultBranch: 'main',
    });
  });

  it('rejects a project in an unknown format', async () => {
    stubFetch(json({ defaultBranch: 42 }));
    await expect(client().getProject()).rejects.toThrow(/unknown format/);
  });
});
