import fetchPostHogConfig from './fetchPostHogConfig';

describe('fetchPostHogConfig', () => {
  const realFetch = globalThis.fetch;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    warnSpy.mockRestore();
  });

  it('returns api_key + host on a 200 JSON response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ api_key: 'phc_test', host: 'https://eu.example' }),
    }) as unknown as typeof fetch;

    expect(await fetchPostHogConfig('https://x')).toEqual({
      POSTHOG_API_KEY: 'phc_test',
      POSTHOG_ENDPOINT: 'https://eu.example',
    });
  });

  it('returns {} on a non-2xx response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    }) as unknown as typeof fetch;

    expect(await fetchPostHogConfig('https://x')).toEqual({});
  });

  it('returns {} on a network error', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error('ENOTFOUND')) as unknown as typeof fetch;

    expect(await fetchPostHogConfig('https://x')).toEqual({});
  });

  it('returns {} when JSON parse fails', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    }) as unknown as typeof fetch;

    expect(await fetchPostHogConfig('https://x')).toEqual({});
  });

  it('passes an AbortSignal to fetch so offline callers do not hang', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ api_key: 'k', host: 'h' }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await fetchPostHogConfig('https://x');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
