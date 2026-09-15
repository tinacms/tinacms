import type { ConfigManager } from '../config-manager';
import {
  getAdminApiURL,
  getAllowedHosts,
  getAllowedOrigins,
  getDevServerUrl,
} from './devServerUrl';

const stub = (
  server?: Record<string, unknown>,
  contentApiUrlOverride?: string
) =>
  ({
    config: { server, contentApiUrlOverride },
  }) as unknown as ConfigManager;

describe('getDevServerUrl', () => {
  it('falls back to localhost when server.url is unset', () => {
    expect(getDevServerUrl(stub(), 4001)).toBe('http://localhost:4001');
  });

  it('uses server.url when set', () => {
    expect(
      getDevServerUrl(stub({ url: 'https://mycontainer.test' }), 4001)
    ).toBe('https://mycontainer.test');
  });

  it('strips a trailing slash so concatenated paths are not doubled', () => {
    expect(
      getDevServerUrl(stub({ url: 'https://mycontainer.test/' }), 4001)
    ).toBe('https://mycontainer.test');
  });

  it('keeps a non-default port', () => {
    expect(
      getDevServerUrl(stub({ url: 'http://mycontainer.test:8080' }), 4001)
    ).toBe('http://mycontainer.test:8080');
  });

  it('ignores a path on server.url, since basePath owns subpaths', () => {
    expect(
      getDevServerUrl(stub({ url: 'https://mycontainer.test/admin' }), 4001)
    ).toBe('https://mycontainer.test');
  });

  it('throws a named config error when server.url has no protocol', () => {
    expect(() =>
      getDevServerUrl(stub({ url: 'mycontainer.test' }), 4001)
    ).toThrow(/Invalid `server.url`/);
  });
});

describe('getAdminApiURL', () => {
  it('defaults to the localhost graphql endpoint', () => {
    expect(getAdminApiURL(stub(), 4001)).toBe('http://localhost:4001/graphql');
  });

  it('follows server.url so the browser can reach the API', () => {
    expect(
      getAdminApiURL(stub({ url: 'https://mycontainer.test' }), 4001)
    ).toBe('https://mycontainer.test/graphql');
  });

  it('lets contentApiUrlOverride win over server.url', () => {
    expect(
      getAdminApiURL(
        stub({ url: 'https://mycontainer.test' }, 'https://proxy.test/graphql'),
        4001
      )
    ).toBe('https://proxy.test/graphql');
  });
});

describe('getAllowedHosts', () => {
  it('is empty when server.url is unset, matching the Vite default', () => {
    expect(getAllowedHosts(stub())).toEqual([]);
  });

  it('allows the configured host through Vite host checking', () => {
    expect(getAllowedHosts(stub({ url: 'https://mycontainer.test' }))).toEqual([
      'mycontainer.test',
    ]);
  });

  it('excludes the port, which Vite strips before matching', () => {
    expect(
      getAllowedHosts(stub({ url: 'http://mycontainer.test:8080' }))
    ).toEqual(['mycontainer.test']);
  });
});

describe('getAllowedOrigins', () => {
  it('is empty when nothing is configured', () => {
    expect(getAllowedOrigins(stub())).toEqual([]);
  });

  it('passes configured allowedOrigins through untouched', () => {
    expect(
      getAllowedOrigins(stub({ allowedOrigins: ['https://my-site.test'] }))
    ).toEqual(['https://my-site.test']);
  });

  it('seeds the admin origin so its own writes are not rejected', () => {
    // The admin is served from server.url, so POST /graphql carries that
    // Origin and the state-changing guard would 403 it.
    expect(
      getAllowedOrigins(stub({ url: 'https://mycontainer.test' }))
    ).toEqual(['https://mycontainer.test']);
  });

  it('keeps both the configured origins and the admin origin', () => {
    expect(
      getAllowedOrigins(
        stub({
          url: 'https://mycontainer.test',
          allowedOrigins: ['https://my-site.test'],
        })
      )
    ).toEqual(['https://my-site.test', 'https://mycontainer.test']);
  });

  it('preserves RegExp and the private keyword alongside the admin origin', () => {
    const re = /^https:\/\/.*\.test$/;
    expect(
      getAllowedOrigins(
        stub({
          url: 'https://mycontainer.test',
          allowedOrigins: ['private', re],
        })
      )
    ).toEqual(['private', re, 'https://mycontainer.test']);
  });

  it('does not mutate the configured array', () => {
    const allowedOrigins = ['https://my-site.test'];
    getAllowedOrigins(
      stub({ url: 'https://mycontainer.test', allowedOrigins })
    );

    expect(allowedOrigins).toEqual(['https://my-site.test']);
  });
});
