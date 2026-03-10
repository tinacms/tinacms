import { filterPublicEnv } from './filterPublicEnv';

const MOCK_ENV: Record<string, string> = {
  // Secrets
  DATABASE_URL: 'postgres://user:password@host:5432/db',
  AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  STRIPE_SECRET_KEY: 'sk_live_abc123secretkey',
  GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  API_KEY: 'super-secret-api-key',
  PRIVATE_KEY: '-----BEGIN RSA PRIVATE KEY-----\nMIIE...',
  SESSION_SECRET: 'keyboard-cat-session-secret',
  TINA_TOKEN: 'tina-cloud-secret-token',

  // System vars
  HOME: '/home/user',
  PATH: '/usr/local/bin:/usr/bin:/bin',
  SHELL: '/bin/bash',
  USER: 'deploy',
  LANG: 'en_US.UTF-8',
  TERM: 'xterm-256color',
  TMPDIR: '/tmp',

  // Allowed: TINA_PUBLIC_*
  TINA_PUBLIC_CLIENT_ID: 'my-tina-client-id',
  TINA_PUBLIC_SITE_URL: 'https://example.com',
  TINA_PUBLIC_IS_LOCAL: 'true',

  // Allowed: NEXT_PUBLIC_*
  NEXT_PUBLIC_ANALYTICS_ID: 'UA-123456789',
  NEXT_PUBLIC_API_URL: 'https://api.example.com',

  // Allowed: exact match
  NODE_ENV: 'production',
  HEAD: 'main',
};

describe('filterPublicEnv', () => {
  it('excludes secret env vars', () => {
    const result = filterPublicEnv(MOCK_ENV);

    expect(result).not.toHaveProperty('DATABASE_URL');
    expect(result).not.toHaveProperty('AWS_SECRET_ACCESS_KEY');
    expect(result).not.toHaveProperty('STRIPE_SECRET_KEY');
    expect(result).not.toHaveProperty('GITHUB_TOKEN');
    expect(result).not.toHaveProperty('API_KEY');
    expect(result).not.toHaveProperty('PRIVATE_KEY');
    expect(result).not.toHaveProperty('SESSION_SECRET');
    expect(result).not.toHaveProperty('TINA_TOKEN');
  });

  it('excludes system env vars', () => {
    const result = filterPublicEnv(MOCK_ENV);

    expect(result).not.toHaveProperty('HOME');
    expect(result).not.toHaveProperty('PATH');
    expect(result).not.toHaveProperty('SHELL');
    expect(result).not.toHaveProperty('USER');
    expect(result).not.toHaveProperty('LANG');
    expect(result).not.toHaveProperty('TERM');
    expect(result).not.toHaveProperty('TMPDIR');
  });

  it('includes TINA_PUBLIC_ prefixed vars', () => {
    const result = filterPublicEnv(MOCK_ENV);

    expect(result).toHaveProperty('TINA_PUBLIC_CLIENT_ID', 'my-tina-client-id');
    expect(result).toHaveProperty(
      'TINA_PUBLIC_SITE_URL',
      'https://example.com'
    );
    expect(result).toHaveProperty('TINA_PUBLIC_IS_LOCAL', 'true');
  });

  it('does not include TINA_ vars without the PUBLIC_ infix', () => {
    const result = filterPublicEnv({
      TINA_TOKEN: 'secret',
      TINA_INTERNAL_KEY: 'also-secret',
      TINA_PUBLIC_OK: 'this-is-fine',
    });

    expect(result).not.toHaveProperty('TINA_TOKEN');
    expect(result).not.toHaveProperty('TINA_INTERNAL_KEY');
    expect(result).toHaveProperty('TINA_PUBLIC_OK', 'this-is-fine');
  });

  it('includes NEXT_PUBLIC_ prefixed vars', () => {
    const result = filterPublicEnv(MOCK_ENV);

    expect(result).toHaveProperty('NEXT_PUBLIC_ANALYTICS_ID', 'UA-123456789');
    expect(result).toHaveProperty(
      'NEXT_PUBLIC_API_URL',
      'https://api.example.com'
    );
  });

  it('does not include NEXT_ vars without the PUBLIC_ infix', () => {
    const result = filterPublicEnv({
      NEXT_SECRET: 'secret',
      NEXT_BUILD_ID: 'also-secret',
      NEXT_PUBLIC_OK: 'this-is-fine',
    });

    expect(result).not.toHaveProperty('NEXT_SECRET');
    expect(result).not.toHaveProperty('NEXT_BUILD_ID');
    expect(result).toHaveProperty('NEXT_PUBLIC_OK', 'this-is-fine');
  });

  it('includes NODE_ENV and HEAD', () => {
    const result = filterPublicEnv(MOCK_ENV);

    expect(result).toHaveProperty('NODE_ENV', 'production');
    expect(result).toHaveProperty('HEAD', 'main');
  });

  it('does not include vars that merely contain NODE_ENV or HEAD as substrings', () => {
    const result = filterPublicEnv({
      MY_NODE_ENV: 'oops',
      NODE_ENV_EXTRA: 'oops',
      OVERHEAD: 'oops',
      MY_HEAD: 'oops',
      HEADER: 'oops',
      NODE_ENV: 'test',
      HEAD: 'develop',
    });

    expect(result).not.toHaveProperty('MY_NODE_ENV');
    expect(result).not.toHaveProperty('NODE_ENV_EXTRA');
    expect(result).not.toHaveProperty('OVERHEAD');
    expect(result).not.toHaveProperty('MY_HEAD');
    expect(result).not.toHaveProperty('HEADER');
    expect(result).toHaveProperty('NODE_ENV', 'test');
    expect(result).toHaveProperty('HEAD', 'develop');
  });

  it('returns only the allowed keys from a mixed environment', () => {
    const result = filterPublicEnv(MOCK_ENV);
    const keys = Object.keys(result).sort();

    expect(keys).toEqual([
      'HEAD',
      'NEXT_PUBLIC_ANALYTICS_ID',
      'NEXT_PUBLIC_API_URL',
      'NODE_ENV',
      'TINA_PUBLIC_CLIENT_ID',
      'TINA_PUBLIC_IS_LOCAL',
      'TINA_PUBLIC_SITE_URL',
    ]);
  });

  it('returns an empty object when env has no matching keys', () => {
    expect(filterPublicEnv({ SECRET: 'value', HOME: '/root' })).toEqual({});
  });

  it('returns an empty object for an empty env', () => {
    expect(filterPublicEnv({})).toEqual({});
  });

  it('does not leak secret values into serialized output', () => {
    const result = filterPublicEnv(MOCK_ENV);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain('postgres://user:password@host:5432/db');
    expect(serialized).not.toContain(
      'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    );
    expect(serialized).not.toContain('sk_live_abc123secretkey');
    expect(serialized).not.toContain('super-secret-api-key');
    expect(serialized).not.toContain('BEGIN RSA PRIVATE KEY');
    expect(serialized).not.toContain('tina-cloud-secret-token');
    expect(serialized).toContain('my-tina-client-id');
    expect(serialized).toContain('production');
  });
});
