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
