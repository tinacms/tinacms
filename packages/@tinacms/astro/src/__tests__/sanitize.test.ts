import { describe, expect, it } from 'vitest';
import { sanitizeHref, sanitizeImageSrc } from '../sanitize';

describe('sanitizeHref', () => {
  it('blocks javascript: scheme', () => {
    expect(sanitizeHref('javascript:alert(1)')).toBe('#');
    expect(sanitizeHref('JavaScript:alert(1)')).toBe('#');
    expect(sanitizeHref('  javascript:alert(1)  ')).toBe('#');
  });

  it('blocks data: and vbscript: schemes', () => {
    expect(sanitizeHref('data:text/html,<script>alert(1)</script>')).toBe('#');
    expect(sanitizeHref('vbscript:msgbox(1)')).toBe('#');
  });

  it('blocks protocol-relative URLs', () => {
    expect(sanitizeHref('//evil.com/path')).toBe('#');
  });

  it('allows http(s) URLs', () => {
    expect(sanitizeHref('https://tina.io')).toBe('https://tina.io');
    expect(sanitizeHref('http://tina.io/x')).toBe('http://tina.io/x');
  });

  it('allows mailto:', () => {
    expect(sanitizeHref('mailto:hi@tina.io')).toBe('mailto:hi@tina.io');
  });

  it('allows relative, root-relative, and fragment paths', () => {
    expect(sanitizeHref('/about')).toBe('/about');
    expect(sanitizeHref('./relative')).toBe('./relative');
    expect(sanitizeHref('../up')).toBe('../up');
    expect(sanitizeHref('#section')).toBe('#section');
  });

  it('returns fallback for non-strings, empty, or invalid', () => {
    expect(sanitizeHref(null)).toBe('#');
    expect(sanitizeHref(undefined)).toBe('#');
    expect(sanitizeHref('')).toBe('#');
    expect(sanitizeHref('   ')).toBe('#');
    expect(sanitizeHref(42)).toBe('#');
    expect(sanitizeHref('not a url')).toBe('#');
  });

  it('honours a custom fallback', () => {
    expect(sanitizeHref('javascript:alert(1)', '/safe')).toBe('/safe');
  });
});

describe('sanitizeImageSrc', () => {
  it('allows http(s) URLs', () => {
    expect(sanitizeImageSrc('https://cdn.tina.io/x.png')).toBe(
      'https://cdn.tina.io/x.png'
    );
  });

  it('allows relative paths', () => {
    expect(sanitizeImageSrc('/uploads/x.png')).toBe('/uploads/x.png');
    expect(sanitizeImageSrc('./local.png')).toBe('./local.png');
    expect(sanitizeImageSrc('../up.png')).toBe('../up.png');
  });

  it('blocks protocol-relative and dangerous schemes', () => {
    expect(sanitizeImageSrc('//evil.com/x.png')).toBe('');
    expect(sanitizeImageSrc('javascript:alert(1)')).toBe('');
    expect(sanitizeImageSrc('data:image/png;base64,xxx')).toBe('');
  });

  it('returns empty for non-strings, empty, or invalid', () => {
    expect(sanitizeImageSrc(null)).toBe('');
    expect(sanitizeImageSrc(undefined)).toBe('');
    expect(sanitizeImageSrc('')).toBe('');
    expect(sanitizeImageSrc(42)).toBe('');
  });
});
