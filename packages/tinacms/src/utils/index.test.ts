import { Client, LocalClient, LocalAuthProvider } from '../internalClient';
import { createClient } from './index';

/**
 * `createClient` turns the `isLocalClient` flag (derived from the resolved
 * content API URL, see `parseURL`) into the client used by the admin UI. The
 * Local Mode banner (`LocalWarning`) shows only when `client.isLocalMode` is
 * true, so these tests assert the banner-driving signal directly.
 */
describe('createClient — Local Mode routing', () => {
  it('does not enter Local Mode for a relative contentApiUrlOverride', () => {
    // A relative `contentApiUrlOverride` resolves to isLocalClient === false.
    const client = createClient({
      isLocalClient: false,
      apiUrl: '/api/tina/gql',
      tinaGraphQLVersion: '1.1',
    });

    expect(client).toBeInstanceOf(Client);
    expect(client).not.toBeInstanceOf(LocalClient);
    expect(client.isLocalMode).toBe(false);
  });

  it('does not enter Local Mode for an absolute (self-hosted) contentApiUrlOverride', () => {
    // An absolute `contentApiUrlOverride` also resolves to isLocalClient === false.
    const client = createClient({
      isLocalClient: false,
      apiUrl: 'https://example.com/api/content',
      tinaGraphQLVersion: '1.1',
    });

    expect(client).toBeInstanceOf(Client);
    expect(client).not.toBeInstanceOf(LocalClient);
    expect(client.isLocalMode).toBe(false);
  });

  it('does not enter Local Mode when an auth provider is configured alongside an absolute contentApiUrlOverride', () => {
    const client = createClient({
      isLocalClient: false,
      apiUrl: 'https://example.com/api/content',
      tinaGraphQLVersion: '1.1',
      schema: {
        collections: [],
        config: {
          contentApiUrlOverride: 'https://example.com/api/content',
          config: { authProvider: new LocalAuthProvider() },
        },
      } as any,
    });

    expect(client).toBeInstanceOf(Client);
    expect(client).not.toBeInstanceOf(LocalClient);
    expect(client.isLocalMode).toBe(false);
  });

  it('stays in Local Mode when there is no contentApiUrlOverride (true local mode)', () => {
    const client = createClient({
      isLocalClient: true,
      tinaGraphQLVersion: '1.1',
    });

    expect(client).toBeInstanceOf(LocalClient);
    expect(client.isLocalMode).toBe(true);
  });
});
