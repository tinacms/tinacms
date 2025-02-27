import { sanitizeUrl } from './remarkToPlate';
import { it, expect, describe } from 'vitest';

describe('sanitizeUrl', () => {
  it('should return an empty string for undefined input', () => {
    expect(sanitizeUrl(undefined)).toBe('');
  });

  it('should return the input for an empty string', () => {
    expect(sanitizeUrl('')).toBe('');
  });

  it('should allow http scheme', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('should allow https scheme', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('should allow mailto scheme', () => {
    expect(sanitizeUrl('mailto:user@example.com')).toBe(
      'mailto:user@example.com'
    );
  });

  it('should allow tel scheme', () => {
    expect(sanitizeUrl('tel:1234567890')).toBe('tel:1234567890');
  });

  it('should allow xref scheme', () => {
    expect(sanitizeUrl('xref://example.com')).toBe('xref://example.com');
  });

  it('should block javascript scheme', () => {
    expect(sanitizeUrl('javascript:alert("Hello World")')).toBe('');
  });

  it('should block other invalid schemes', () => {
    expect(sanitizeUrl('ftp://example.com')).toBe('');
  });

  it('should preserve query parameters', () => {
    expect(sanitizeUrl('https://example.com/?utm_source=blog')).toBe(
      'https://example.com?utm_source=blog'
    );
  });

  it('should preserve hash', () => {
    expect(sanitizeUrl('https://example.com/#anchor')).toBe(
      'https://example.com#anchor'
    );
  });

  it('should preserve trailing slash', () => {
    expect(sanitizeUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('should remove trailing slash if not present in original URL', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('should preserve path', () => {
    expect(sanitizeUrl('https://example.com/path')).toBe(
      'https://example.com/path'
    );
  });

  it('should preserve path with trailing slash', () => {
    expect(sanitizeUrl('https://example.com/path/')).toBe(
      'https://example.com/path/'
    );
  });

  it('should handle URL with query parameters and hash', () => {
    expect(sanitizeUrl('https://example.com/?utm_source=blog#anchor')).toBe(
      'https://example.com?utm_source=blog#anchor'
    );
  });

  it('should handle URL with path, query parameters, and hash', () => {
    expect(sanitizeUrl('https://example.com/path?utm_source=blog#anchor')).toBe(
      'https://example.com/path?utm_source=blog#anchor'
    );
  });
});
