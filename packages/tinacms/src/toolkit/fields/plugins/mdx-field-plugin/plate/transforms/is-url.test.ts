import { isUrl } from './is-url';

describe('isUrl', () => {
  test('validates full URLs with protocol', () => {
    expect(isUrl('http://example.com')).toBe(true);
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('ftp://example.com')).toBe(true);
  });

  test('validates localhost URLs', () => {
    expect(isUrl('http://localhost')).toBe(true);
    expect(isUrl('http://localhost:3000')).toBe(true);
  });

  test('validates email links', () => {
    expect(isUrl('mailto:someone@example.com')).toBe(true);
    expect(isUrl('mailto:someone@example.com?subject=Hello')).toBe(true);
  });

  test('validates local URLs', () => {
    expect(isUrl('/path/to/resource')).toBe(true);
    expect(isUrl('/another/path')).toBe(true);
  });

  test('invalidates non-URLs and malformed URLs', () => {
    expect(isUrl('not a url')).toBe(false);
    expect(isUrl('http://')).toBe(false);
    expect(isUrl('ftp://')).toBe(false);
    expect(isUrl('http://.com')).toBe(false);
  });

  test('handles non-string inputs gracefully', () => {
    expect(isUrl(123)).toBe(false);
    expect(isUrl(null)).toBe(false);
    expect(isUrl(undefined)).toBe(false);
    expect(isUrl({})).toBe(false);
  });

  test('invalidates URLs without protocol if not a local URL', () => {
    expect(isUrl('example.com')).toBe(false);
    expect(isUrl('www.example.com')).toBe(false);
  });

  test('validates bare hash links', () => {
    expect(isUrl('#foo')).toBe(true);
    expect(isUrl('#section1')).toBe(true);
  });

  test('validates tel links', () => {
    expect(isUrl('tel:123')).toBe(true);
    expect(isUrl('tel:1234567')).toBe(true);
  });
});
