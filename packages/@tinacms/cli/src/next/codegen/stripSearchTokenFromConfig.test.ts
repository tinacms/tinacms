import { stripSearchTokenFromConfig } from './stripSearchTokenFromConfig';

describe('stripSearchTokenFromConfig', () => {
  it('strips indexerToken from search.tina', () => {
    const config = {
      branch: 'main',
      search: {
        tina: {
          indexerToken: 'secret-token-abc123',
          stopwordLanguages: ['eng'],
          fuzzyEnabled: true,
        },
      },
    };
    const result = stripSearchTokenFromConfig(config);

    expect(result.search).toBeDefined();
    expect((result.search as any).tina).not.toHaveProperty('indexerToken');
    expect((result.search as any).tina.stopwordLanguages).toEqual(['eng']);
    expect((result.search as any).tina.fuzzyEnabled).toBe(true);
  });

  it('removes search entirely when search.tina is absent', () => {
    const config = {
      branch: 'main',
      search: {
        searchClient: { someCustomClient: true },
        indexBatchSize: 50,
      },
    };
    const result = stripSearchTokenFromConfig(config);

    expect(result).not.toHaveProperty('search');
    expect(result.branch).toBe('main');
  });

  it('returns config unchanged when there is no search key', () => {
    const config = {
      branch: 'main',
      clientId: 'abc',
      token: 'xyz',
    };
    const result = stripSearchTokenFromConfig(config);

    expect(result).toEqual(config);
  });

  it('drops indexBatchSize and maxSearchIndexFieldLength from search', () => {
    const config = {
      search: {
        tina: {
          indexerToken: 'secret',
          fuzzyEnabled: false,
        },
        indexBatchSize: 100,
        maxSearchIndexFieldLength: 5000,
      },
    };
    const result = stripSearchTokenFromConfig(config);
    const search = result.search as any;

    expect(search).toEqual({ tina: { fuzzyEnabled: false } });
    expect(search).not.toHaveProperty('indexBatchSize');
    expect(search).not.toHaveProperty('maxSearchIndexFieldLength');
  });

  it('preserves key order of the original config', () => {
    const config = {
      branch: 'main',
      clientId: 'my-client',
      search: {
        tina: { indexerToken: 'secret', fuzzyEnabled: true },
      },
      token: 'my-token',
    };
    const result = stripSearchTokenFromConfig(config);
    const keys = Object.keys(result);

    expect(keys).toEqual(['branch', 'clientId', 'search', 'token']);
  });

  it('does not mutate the input object', () => {
    const config = {
      branch: 'main',
      search: {
        tina: {
          indexerToken: 'secret-token',
          stopwordLanguages: ['eng'],
        },
      },
    };
    const original = JSON.parse(JSON.stringify(config));
    stripSearchTokenFromConfig(config);

    expect(config).toEqual(original);
  });

  it('handles search.tina with only indexerToken (all stripped)', () => {
    const config = {
      search: {
        tina: { indexerToken: 'only-secret' },
      },
    };
    const result = stripSearchTokenFromConfig(config);

    expect((result.search as any).tina).toEqual({});
    expect((result.search as any).tina).not.toHaveProperty('indexerToken');
  });

  it('handles search.tina with fuzzyOptions preserved', () => {
    const config = {
      search: {
        tina: {
          indexerToken: 'secret',
          fuzzyOptions: {
            maxDistance: 3,
            minSimilarity: 0.5,
            useTranspositions: true,
          },
        },
      },
    };
    const result = stripSearchTokenFromConfig(config);
    const tina = (result.search as any).tina;

    expect(tina).not.toHaveProperty('indexerToken');
    expect(tina.fuzzyOptions).toEqual({
      maxDistance: 3,
      minSimilarity: 0.5,
      useTranspositions: true,
    });
  });

  it('token value does not appear in serialized output', () => {
    const secret = 'super-secret-indexer-token-xyz789';
    const config = {
      branch: 'main',
      search: {
        tina: {
          indexerToken: secret,
          stopwordLanguages: ['eng'],
        },
        indexBatchSize: 10,
      },
      token: 'auth-token',
    };
    const result = stripSearchTokenFromConfig(config);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain(secret);
    expect(serialized).toContain('eng');
    expect(serialized).toContain('auth-token');
  });

  it('handles empty search object', () => {
    const config = { branch: 'main', search: {} };
    const result = stripSearchTokenFromConfig(config);

    expect(result).not.toHaveProperty('search');
    expect(result.branch).toBe('main');
  });
});
