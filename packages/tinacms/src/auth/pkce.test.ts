import { describe, expect, it } from 'vitest';
import { base64UrlEncode, generateCodeChallenge, randomString } from './pkce';

const ALLOWED_CHARS = /^[A-Za-z0-9]+$/;

describe('randomString', () => {
  it('defaults to a length of 40', () => {
    expect(randomString()).toHaveLength(40);
  });

  it('honors a custom length', () => {
    expect(randomString(128)).toHaveLength(128);
    expect(randomString(8)).toHaveLength(8);
  });

  it('only uses URL-safe characters', () => {
    expect(randomString(100)).toMatch(ALLOWED_CHARS);
  });

  it('produces different values across calls', () => {
    const first = randomString();
    const second = randomString();
    expect(first).not.toBe(second);
  });
});

describe('base64UrlEncode', () => {
  it('produces URL-safe output without padding', () => {
    const bytes = new Uint8Array([0xfb, 0xff, 0xbf]);
    expect(base64UrlEncode(bytes.buffer)).toBe('-_-_');
  });

  it('is deterministic for the same input', () => {
    const bytes = new Uint8Array([0x12, 0x34, 0x56]).buffer;
    expect(base64UrlEncode(bytes)).toBe(base64UrlEncode(bytes));
  });
});

describe('generateCodeChallenge', () => {
  // RFC 7636 Appendix B test vector.
  it('matches the RFC 7636 known challenge', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    await expect(generateCodeChallenge(verifier)).resolves.toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    );
  });

  it('produces URL-safe output without padding', async () => {
    const challenge = await generateCodeChallenge('some-verifier');
    expect(challenge).not.toContain('+');
    expect(challenge).not.toContain('/');
    expect(challenge).not.toContain('=');
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('is deterministic for the same verifier', async () => {
    const first = await generateCodeChallenge('some-verifier');
    const second = await generateCodeChallenge('some-verifier');
    expect(first).toBe(second);
  });
});
