import { TokenObject } from '../auth/authenticate';
import { TinaCloudAuthProvider } from './authProvider';

const encode = (obj: Record<string, unknown>) =>
  Buffer.from(JSON.stringify(obj)).toString('base64url');

const makeJwt = (payload: Record<string, unknown>) =>
  `${encode({ alg: 'none' })}.${encode(payload)}.sig`;

const nearExpiryAccessToken = makeJwt({
  exp: Math.floor(Date.now() / 1000) + 60,
  client_id: 'client-id',
});

const freshAccessToken = makeJwt({
  exp: Math.floor(Date.now() / 1000) + 3600,
  client_id: 'client-id',
});

const buildProvider = () =>
  new TinaCloudAuthProvider({
    clientId: 'client-id',
    identityApiUrl: 'https://identity.example.com',
    frontendUrl: 'https://app.example.com',
    tokenStorage: 'MEMORY',
  });

const stubFetch = (body: Record<string, unknown>) => {
  const fetchMock = vi.fn().mockResolvedValue({
    status: 200,
    json: vi.fn().mockResolvedValue(body),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('TinaCloudAuthProvider getRefreshedToken', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const seed = (provider: TinaCloudAuthProvider, refreshToken: string) => {
    provider.setToken({
      access_token: nearExpiryAccessToken,
      id_token: 'id-token',
      refresh_token: refreshToken,
    });
  };

  const storedToken = (provider: TinaCloudAuthProvider): TokenObject =>
    provider.token;

  it('keeps the existing refresh token when the response does not include a new one', async () => {
    const provider = buildProvider();
    seed(provider, 'refresh-old');
    const fetchMock = stubFetch({
      access_token: 'new-access',
      id_token: 'new-id',
    });

    await provider.getToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://identity.example.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: expect.stringContaining('grant_type=refresh_token'),
      })
    );
    expect(storedToken(provider)).toEqual({
      access_token: 'new-access',
      id_token: 'new-id',
      refresh_token: 'refresh-old',
    });
  });

  it('persists a rotated refresh token when the response includes one', async () => {
    const provider = buildProvider();
    seed(provider, 'refresh-old');
    stubFetch({
      access_token: 'new-access',
      id_token: 'new-id',
      refresh_token: 'refresh-new',
    });

    await provider.getToken();

    expect(storedToken(provider)).toEqual({
      access_token: 'new-access',
      id_token: 'new-id',
      refresh_token: 'refresh-new',
    });
  });
});

describe('TinaCloudAuthProvider getUser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('skips the currentUser request when no token is stored', async () => {
    const provider = buildProvider();
    const fetchMock = stubFetch({});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const user = await provider.getUser();
    await provider.getUser();

    expect(user).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('fetches currentUser with the stored token', async () => {
    const provider = buildProvider();
    provider.setToken({
      access_token: freshAccessToken,
      id_token: 'id-token',
      refresh_token: 'refresh',
    });
    const fetchMock = stubFetch({ id: 'user-1' });
    const fetchWithToken = vi.spyOn(provider, 'fetchWithToken');

    const user = await provider.getUser();

    expect(user).toEqual({ id: 'user-1' });
    expect(fetchWithToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://identity.example.com/v2/apps/client-id/currentUser'
    );
    expect(new Headers(init.headers).get('Authorization')).toBe(
      `Bearer ${freshAccessToken}`
    );
  });

  it('returns null and logs the status on a non-2xx response', async () => {
    const provider = buildProvider();
    provider.setToken({
      access_token: freshAccessToken,
      id_token: 'id-token',
      refresh_token: 'refresh',
    });
    const fetchMock = vi.fn().mockResolvedValue({
      status: 401,
      json: vi.fn().mockResolvedValue({ error: 'unauthorized' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const user = await provider.getUser();

    expect(user).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('401'),
      'unauthorized'
    );
  });
});

describe('TinaCloudAuthProvider getAccessToken', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when no token is stored', async () => {
    expect(await buildProvider().getAccessToken()).toBeNull();
  });

  it('prefers the access token', async () => {
    const provider = buildProvider();
    provider.setToken({
      access_token: freshAccessToken,
      id_token: 'id-token',
      refresh_token: 'refresh',
    });

    expect(await provider.getAccessToken()).toBe(freshAccessToken);
  });

  it('falls back to the id token', async () => {
    const provider = buildProvider();
    provider.getToken = async () => ({
      access_token: null,
      id_token: 'id-token',
      refresh_token: 'refresh',
    });

    expect(await provider.getAccessToken()).toBe('id-token');
  });
});

describe('TinaCloudAuthProvider getUser resilience', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const withSession = (provider: TinaCloudAuthProvider) => {
    provider.getToken = vi
      .fn()
      .mockResolvedValue({ access_token: freshAccessToken } as TokenObject);
    return provider;
  };

  it('retries once and succeeds after a transient network failure', async () => {
    const provider = withSession(buildProvider());
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        status: 200,
        json: vi.fn().mockResolvedValue({ id: 'user-1' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const user = await provider.getUser();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(user).toEqual({ id: 'user-1' });
  });

  it('throws rather than reporting logged-out when the identity API stays unreachable', async () => {
    const provider = withSession(buildProvider());
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(provider.getUser()).rejects.toThrow('Failed to fetch');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('still reports null for a non-2xx session check', async () => {
    const provider = withSession(buildProvider());
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 401,
        json: vi.fn().mockResolvedValue({ error: 'expired' }),
      })
    );

    const user = await provider.getUser();

    expect(user).toBeNull();
  });
});
