import { describe, expect, it } from 'vitest';
import { decodeRouteParam } from './utils';

describe('decodeRouteParam', () => {
  it('decodes URL-encoded filenames from admin routes', () => {
    expect(decodeRouteParam('posts/hello%20world')).toBe('posts/hello world');
  });

  it('preserves the param when decoding fails', () => {
    expect(decodeRouteParam('posts/%E0%A4%A')).toBe('posts/%E0%A4%A');
  });
});
