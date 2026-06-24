import { buildCorsOriginCheck, isOriginAllowed } from './cors';

describe('buildCorsOriginCheck', () => {
  const check = (
    fn: ReturnType<typeof buildCorsOriginCheck>,
    origin: string | undefined
  ): Promise<boolean> =>
    new Promise((resolve) => {
      fn(origin, (_err, allow) => resolve(!!allow));
    });

  describe('default (no allowedOrigins)', () => {
    const fn = buildCorsOriginCheck();

    it('allows requests with no Origin header', async () => {
      expect(await check(fn, undefined)).toBe(true);
    });

    it('allows http://localhost', async () => {
      expect(await check(fn, 'http://localhost')).toBe(true);
    });

    it('allows http://localhost:3000', async () => {
      expect(await check(fn, 'http://localhost:3000')).toBe(true);
    });

    it('allows http://127.0.0.1:4001', async () => {
      expect(await check(fn, 'http://127.0.0.1:4001')).toBe(true);
    });

    it('allows http://[::1]:4001', async () => {
      expect(await check(fn, 'http://[::1]:4001')).toBe(true);
    });

    it('blocks https://evil.com', async () => {
      expect(await check(fn, 'https://evil.com')).toBe(false);
    });

    it('blocks http://172.20.0.5:3000 (private IP without keyword)', async () => {
      expect(await check(fn, 'http://172.20.0.5:3000')).toBe(false);
    });
  });

  describe('with exact origin strings', () => {
    const fn = buildCorsOriginCheck(['https://my-codespace.github.dev']);

    it('allows the configured origin', async () => {
      expect(await check(fn, 'https://my-codespace.github.dev')).toBe(true);
    });

    it('still allows localhost', async () => {
      expect(await check(fn, 'http://localhost:3000')).toBe(true);
    });

    it('blocks other origins', async () => {
      expect(await check(fn, 'https://evil.com')).toBe(false);
    });
  });

  describe('with "private" keyword', () => {
    const fn = buildCorsOriginCheck(['private']);

    it('allows 10.x.x.x (RFC 1918)', async () => {
      expect(await check(fn, 'http://10.0.0.1:3000')).toBe(true);
    });

    it('allows 172.16-31.x.x (RFC 1918)', async () => {
      expect(await check(fn, 'http://172.20.0.5:4001')).toBe(true);
    });

    it('allows 192.168.x.x (RFC 1918)', async () => {
      expect(await check(fn, 'http://192.168.1.100:3000')).toBe(true);
    });

    it('blocks 172.15.x.x (not RFC 1918)', async () => {
      expect(await check(fn, 'http://172.15.0.1:3000')).toBe(false);
    });

    it('blocks 172.32.x.x (not RFC 1918)', async () => {
      expect(await check(fn, 'http://172.32.0.1:3000')).toBe(false);
    });

    it('blocks public IPs', async () => {
      expect(await check(fn, 'http://8.8.8.8:3000')).toBe(false);
    });

    it('blocks domains', async () => {
      expect(await check(fn, 'https://evil.com')).toBe(false);
    });

    it('still allows localhost', async () => {
      expect(await check(fn, 'http://localhost:3000')).toBe(true);
    });
  });

  describe('with "private" keyword plus extra origins', () => {
    const fn = buildCorsOriginCheck([
      'private',
      'https://my-codespace.github.dev',
    ]);

    it('allows private IPs', async () => {
      expect(await check(fn, 'http://192.168.1.5:3000')).toBe(true);
    });

    it('allows the extra origin', async () => {
      expect(await check(fn, 'https://my-codespace.github.dev')).toBe(true);
    });

    it('blocks other origins', async () => {
      expect(await check(fn, 'https://evil.com')).toBe(false);
    });
  });

  describe('with RegExp entries', () => {
    const fn = buildCorsOriginCheck([/^https:\/\/.*\.preview\.app$/]);

    it('allows matching origins', async () => {
      expect(await check(fn, 'https://foo.preview.app')).toBe(true);
    });

    it('blocks non-matching origins', async () => {
      expect(await check(fn, 'https://evil.com')).toBe(false);
    });
  });
});

describe('isOriginAllowed', () => {
  it('allows requests with no Origin header', () => {
    expect(isOriginAllowed(undefined)).toBe(true);
  });

  it('allows localhost regardless of port', () => {
    expect(isOriginAllowed('http://localhost:3000')).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:4001')).toBe(true);
    expect(isOriginAllowed('http://[::1]:4001')).toBe(true);
  });

  it('blocks disallowed cross-origins', () => {
    expect(isOriginAllowed('http://evil.test:8000')).toBe(false);
    expect(isOriginAllowed('https://evil.com')).toBe(false);
  });

  it('honors configured exact origins', () => {
    const allowed = ['https://my-codespace.github.dev'];
    expect(isOriginAllowed('https://my-codespace.github.dev', allowed)).toBe(
      true
    );
    expect(isOriginAllowed('https://evil.com', allowed)).toBe(false);
  });

  it('honors the "private" keyword', () => {
    expect(isOriginAllowed('http://192.168.1.100:3000', ['private'])).toBe(true);
    expect(isOriginAllowed('http://8.8.8.8:3000', ['private'])).toBe(false);
  });

  it('honors RegExp entries', () => {
    const allowed = [/^https:\/\/.*\.preview\.app$/];
    expect(isOriginAllowed('https://foo.preview.app', allowed)).toBe(true);
    expect(isOriginAllowed('https://evil.com', allowed)).toBe(false);
  });
});
