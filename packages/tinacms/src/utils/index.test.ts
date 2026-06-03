import { Client, LocalClient } from '../internalClient';
import { createClient, resolveIsLocalClient } from './index';

describe('resolveIsLocalClient', () => {
  it('forces non-local mode for a relative contentApiUrlOverride', () => {
    expect(
      resolveIsLocalClient({
        isLocalClient: false,
        contentApiUrlOverride: '/api/tina/gql',
      })
    ).toBe(false);
  });

  it('forces non-local mode for an absolute contentApiUrlOverride', () => {
    // parseURL flags any non-TinaCloud absolute host as local; the explicit
    // override must take precedence so the local-mode banner stays hidden.
    expect(
      resolveIsLocalClient({
        isLocalClient: true,
        contentApiUrlOverride: 'https://backend.example.com/api/tina/gql',
      })
    ).toBe(false);
  });

  it('forces non-local mode even when the override targets localhost', () => {
    expect(
      resolveIsLocalClient({
        isLocalClient: true,
        contentApiUrlOverride: 'http://localhost:3000/api/tina/gql',
      })
    ).toBe(false);
  });

  it('keeps local mode for the default dev server when no override is set', () => {
    expect(
      resolveIsLocalClient({
        isLocalClient: true,
        contentApiUrlOverride: undefined,
      })
    ).toBe(true);
  });

  it('keeps non-local mode for a TinaCloud connection when no override is set', () => {
    expect(resolveIsLocalClient({ isLocalClient: false })).toBe(false);
  });

  it('passes through an undefined decision when nothing is configured', () => {
    expect(resolveIsLocalClient({ isLocalClient: undefined })).toBeUndefined();
  });
});

describe('createClient — local mode resolution', () => {
  it('builds a non-local Client for an absolute contentApiUrlOverride (banner hidden)', () => {
    const apiUrl = 'https://backend.example.com/api/tina/gql';
    const client = createClient({
      isLocalClient: resolveIsLocalClient({
        isLocalClient: true,
        contentApiUrlOverride: apiUrl,
      }),
      apiUrl,
      branch: 'main',
      tinaGraphQLVersion: '1.1',
      schema: {
        collections: [],
        config: { contentApiUrlOverride: apiUrl },
      } as any,
    });

    expect(client).toBeInstanceOf(Client);
    expect(client).not.toBeInstanceOf(LocalClient);
    expect(client.isLocalMode).toBe(false);
    expect(client.isCustomContentApi).toBe(true);
    expect(client.contentApiUrl).toBe(apiUrl);
  });

  it('builds a LocalClient for the default dev server (banner shown)', () => {
    const client = createClient({
      isLocalClient: resolveIsLocalClient({ isLocalClient: true }),
      apiUrl: 'http://localhost:4001/graphql',
      tinaGraphQLVersion: '1.1',
    });

    expect(client).toBeInstanceOf(LocalClient);
    expect(client.isLocalMode).toBe(true);
  });
});
