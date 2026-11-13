import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchError } from '../../../core/search/contract';
import { createTinaCloudSearchProvider } from './tinacloud-search.server';

vi.mock('../../../server/runtime-access', () => ({
  currentServerRuntime: () => ({ collections: [{ name: 'post', path: 'p' }] }),
}));
vi.mock('../../../server/request-context', () => ({
  requestContext: () => ({
    authProvider: 'tina:tinacloud',
    request: new Request('http://x.local', {
      headers: { authorization: 'Bearer editor-jwt' },
    }),
  }),
}));

afterEach(() => vi.unstubAllGlobals());

const refused = async (publicToken?: string) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('no', { status: 403 }))
  );
  const provider = createTinaCloudSearchProvider({ clientId: 'abc' }, {
    fields: { post: {} },
    publicToken,
    branch: 'main',
  } as never);
  return provider.query({ query: 'x', limit: 1 }).then(
    () => undefined,
    (cause: unknown) => cause
  );
};

describe('TinaCloud search error detail (AC12)', () => {
  it('names TINA_PUBLIC_SEARCH_TOKEN but not its value when the public token is refused', async () => {
    const error = await refused('pub-token');
    expect(error).toBeInstanceOf(SearchError);
    const { code, detail } = error as SearchError;
    expect(code).toBe('unavailable');
    expect(detail).toContain('TINA_PUBLIC_SEARCH_TOKEN');
    expect(detail).not.toContain('pub-token');
  });

  it('asks the editor to sign in again on the editor path', async () => {
    const error = await refused();
    expect((error as SearchError).detail).toContain('Sign in');
    expect((error as SearchError).detail).not.toContain('editor-jwt');
  });
});
