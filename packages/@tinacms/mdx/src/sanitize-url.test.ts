import { describe, expect, it, vi } from 'vitest';
import { sanitizeUrl } from './sanitize-url';

describe('sanitizeUrl', () => {
  it('keeps the schemes on the allow list', () => {
    expect(sanitizeUrl('https://example.com/a/b')).toBe(
      'https://example.com/a/b'
    );
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('mailto:hi@example.com')).toBe('mailto:hi@example.com');
    expect(sanitizeUrl('tel:+61000')).toBe('tel:+61000');
  });

  it('keeps a relative url, which names no scheme', () => {
    expect(sanitizeUrl('/blog/post')).toBe('/blog/post');
    expect(sanitizeUrl('./sibling')).toBe('./sibling');
    expect(sanitizeUrl('../parent')).toBe('../parent');
    expect(sanitizeUrl('image.png')).toBe('image.png');
    expect(sanitizeUrl('#anchor')).toBe('#anchor');
    expect(sanitizeUrl('?q=1')).toBe('?q=1');
  });

  it('returns an empty string for no url', () => {
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl('')).toBe('');
  });

  it('drops a scheme that is not on the allow list', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('');
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
  });

  // A value that names a scheme but does not parse used to be returned as it
  // was. These are the shapes that reach that branch, written as escapes so the
  // invisible characters stay visible in review.
  // Cc (control)
  const NUL = '\u0000';
  const TAB = '\u0009';
  const DEL = '\u007f';
  // Cf (format) — these render as nothing, so they hide a scheme from a reader
  const SOFT_HYPHEN = '\u00ad';
  const ZWSP = '\u200b';
  const ZWJ = '\u200d';
  const LRM = '\u200e';
  const WORD_JOINER = '\u2060';
  const BOM = '\ufeff';

  it.each([
    ['a null byte in the scheme', `java${NUL}script:alert(1)`],
    ['a delete character', `java${DEL}script:alert(1)`],
    ['a tab in the scheme', `java${TAB}script:alert(1)`],
    ['a soft hyphen', `java${SOFT_HYPHEN}script:alert(1)`],
    ['a zero-width space in the scheme', `java${ZWSP}script:alert(1)`],
    ['a zero-width space at the front', `j${ZWSP}avascript:alert(1)`],
    ['a zero-width joiner', `java${ZWJ}script:alert(1)`],
    ['a left-to-right mark', `java${LRM}script:alert(1)`],
    ['a word joiner', `java${WORD_JOINER}script:alert(1)`],
    ['a byte order mark', `java${BOM}script:alert(1)`],
  ])('drops a malformed url that still names a scheme (%s)', (_label, url) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(sanitizeUrl(url)).toBe('');
  });

  it('keeps the query and hash on a bare origin', () => {
    expect(sanitizeUrl('https://example.com?q=1')).toBe(
      'https://example.com?q=1'
    );
    expect(sanitizeUrl('https://example.com#top')).toBe(
      'https://example.com#top'
    );
    expect(sanitizeUrl('https://example.com/')).toBe('https://example.com/');
  });
});
