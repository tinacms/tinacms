import { describe, expect, it } from 'vitest';
import {
  displayAddress,
  isHashOnlyChange,
  parseAddress,
} from './preview-address';

const ORIGIN = 'http://localhost:3000';
const hrefOf = (typed: string) => {
  const parsed = parseAddress(typed, ORIGIN);
  return parsed?.ok ? parsed.url.href : parsed;
};

describe('displayAddress', () => {
  it('drops the scheme and keeps path, search and hash', () => {
    expect(displayAddress('http://localhost:3000/posts/x?a=1#top')).toBe(
      'localhost:3000/posts/x?a=1#top'
    );
  });
});

describe('parseAddress', () => {
  it('reads the shown address, edited', () => {
    expect(hrefOf('localhost:3000/posts/other')).toBe(
      'http://localhost:3000/posts/other'
    );
    expect(hrefOf('localhost:3000')).toBe('http://localhost:3000/');
  });

  it('reads a path on the preview origin, with or without the slash', () => {
    expect(hrefOf('/posts/other')).toBe('http://localhost:3000/posts/other');
    expect(hrefOf('posts/other')).toBe('http://localhost:3000/posts/other');
  });

  it('reads a full URL on the preview origin', () => {
    expect(hrefOf('http://localhost:3000/a')).toBe('http://localhost:3000/a');
  });

  it('does not take a host that only starts with the preview host', () => {
    expect(hrefOf('localhost:30001/x')).toEqual({ ok: false });
  });

  it('refuses another origin, a protocol-relative address and other schemes', () => {
    for (const typed of [
      'https://other.test/',
      '//other.test/',
      'javascript:alert(1)',
      'data:text/html,x',
      'mailto:a@b.test',
      'ftp://localhost:3000/',
      '/\\other.test',
    ]) {
      const parsed = parseAddress(typed, ORIGIN);
      if (typed === '/\\other.test') {
        expect(parsed?.ok && parsed.url.origin).toBe(ORIGIN);
      } else {
        expect(parsed).toEqual({ ok: false });
      }
    }
  });

  it('does nothing for empty text', () => {
    expect(parseAddress('   ', ORIGIN)).toBeNull();
  });
});

describe('isHashOnlyChange', () => {
  it('is true only when the new address has a different hash', () => {
    const a = 'http://localhost:3000/p';
    expect(isHashOnlyChange(a, `${a}#x`)).toBe(true);
    expect(isHashOnlyChange(`${a}#x`, a)).toBe(false);
    expect(isHashOnlyChange(a, a)).toBe(false);
    expect(isHashOnlyChange(a, 'http://localhost:3000/q#x')).toBe(false);
  });
});
