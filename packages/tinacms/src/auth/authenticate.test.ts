import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticate, AUTH_TOKEN_KEY, PKCE_STORAGE_KEY } from './authenticate';

const CLIENT_ID = 'test-client-id';
const IDENTITY_API_URL = 'https://api.example';

let originalHref: string;

beforeEach(() => {
  originalHref = window.location.href;
  Object.defineProperty(window, 'location', {
    value: new URL('https://mysite.com/admin'),
    writable: true,
  });
  localStorage.clear();
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: new URL(originalHref),
    writable: true,
  });
  localStorage.clear();
});

describe('authenticate', () => {
  it('stores PKCE data in localStorage', async () => {
    const promise = authenticate(CLIENT_ID, IDENTITY_API_URL);

    // The function redirects, so it never resolves. We catch the navigation.
    await vi.waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(PKCE_STORAGE_KEY));
      expect(stored).toBeTruthy();
      expect(stored.client_id).toBe(CLIENT_ID);
      expect(stored.identity_api_url).toBe(IDENTITY_API_URL);
      expect(stored.code_verifier).toHaveLength(128);
      expect(stored.state).toBeTruthy();
    });
  });

  it('generates a valid code_challenge from code_verifier', async () => {
    await authenticate(CLIENT_ID, IDENTITY_API_URL);

    const stored = JSON.parse(localStorage.getItem(PKCE_STORAGE_KEY));
    expect(stored.code_verifier).toMatch(/^[A-Za-z0-9]{128}$/);
    expect(stored.state).toMatch(/^[A-Za-z0-9]{40}$/);
  });

  it('redirects to the authorize endpoint', async () => {
    await authenticate(CLIENT_ID, IDENTITY_API_URL);

    const redirectUrl = new URL(window.location.href);
    expect(redirectUrl.origin + redirectUrl.pathname).toBe(
      `${IDENTITY_API_URL}/v2/auth/tinacms`
    );
    expect(redirectUrl.searchParams.get('response_type')).toBe('code');
    expect(redirectUrl.searchParams.get('client_id')).toBe(CLIENT_ID);
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'https://mysite.com/admin'
    );
    expect(redirectUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(redirectUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(redirectUrl.searchParams.get('state')).toBeTruthy();
  });

  it('uses the correct redirect_uri based on current page', async () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://mysite.com:3000/editor'),
      writable: true,
    });

    await authenticate(CLIENT_ID, IDENTITY_API_URL);

    const redirectUrl = new URL(window.location.href);
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'https://mysite.com:3000/editor'
    );
  });

  it('exports the auth token key', () => {
    expect(AUTH_TOKEN_KEY).toBe('tinacms-auth');
  });
});
