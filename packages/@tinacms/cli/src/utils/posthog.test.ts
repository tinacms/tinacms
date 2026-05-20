import { PostHog } from 'posthog-node';
import {
  generateSessionId,
  initializePostHog,
  postHogCapture,
} from './posthog';

describe('generateSessionId', () => {
  it('returns a UUID-formatted string', () => {
    const id = generateSessionId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('returns a different value on each call', () => {
    expect(generateSessionId()).not.toBe(generateSessionId());
  });
});

describe('initializePostHog', () => {
  const realFetch = globalThis.fetch;
  const originalTinaDev = process.env.TINA_DEV;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    if (originalTinaDev === undefined) {
      delete process.env.TINA_DEV;
    } else {
      process.env.TINA_DEV = originalTinaDev;
    }
    warnSpy.mockRestore();
  });

  it('returns null when TINA_DEV=true and never hits the network', async () => {
    process.env.TINA_DEV = 'true';
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    expect(await initializePostHog('https://x')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null when no configEndpoint is provided', async () => {
    delete process.env.TINA_DEV;
    expect(await initializePostHog()).toBeNull();
  });

  it('returns null when the config endpoint returns no api_key', async () => {
    delete process.env.TINA_DEV;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    expect(await initializePostHog('https://x')).toBeNull();
  });

  it('returns null on a network failure (graceful degradation)', async () => {
    delete process.env.TINA_DEV;
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error('ENOTFOUND')) as unknown as typeof fetch;

    expect(await initializePostHog('https://x')).toBeNull();
  });

  it('returns a PostHog instance when an api_key comes back', async () => {
    delete process.env.TINA_DEV;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        api_key: 'phc_test',
        host: 'https://app.posthog.com',
      }),
    }) as unknown as typeof fetch;

    const client = await initializePostHog('https://x');
    expect(client).toBeInstanceOf(PostHog);
    await client?.shutdown();
  });
});

describe('postHogCapture', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('no-ops when the client is null', () => {
    expect(() =>
      postHogCapture(null as unknown as PostHog, 'distinct', 'evt', {})
    ).not.toThrow();
  });

  it('calls client.capture with the given distinctId and event name', () => {
    const capture = jest.fn();
    const client = { capture } as unknown as PostHog;

    postHogCapture(client, 'user-123', 'tinacms-cli-build-invoke', {
      hasLocalOption: true,
    });

    expect(capture).toHaveBeenCalledTimes(1);
    const arg = capture.mock.calls[0][0];
    expect(arg.distinctId).toBe('user-123');
    expect(arg.event).toBe('tinacms-cli-build-invoke');
  });

  it('appends system: tinacms/cli to properties', () => {
    const capture = jest.fn();
    const client = { capture } as unknown as PostHog;

    postHogCapture(client, 'd', 'e', { hasLocalOption: true });

    const arg = capture.mock.calls[0][0];
    expect(arg.properties).toMatchObject({
      hasLocalOption: true,
      system: 'tinacms/cli',
    });
  });

  it('swallows errors thrown by client.capture so telemetry never breaks the CLI', () => {
    const capture = jest.fn().mockImplementation(() => {
      throw new Error('boom');
    });
    const client = { capture } as unknown as PostHog;

    expect(() => postHogCapture(client, 'd', 'e', {})).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();
  });
});
