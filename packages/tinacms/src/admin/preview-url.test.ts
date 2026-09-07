import { describe, expect, it } from 'vitest';
import { resolvePreviewPath } from './preview-url';

const ORIGIN = 'https://editor.example';

describe('resolvePreviewPath', () => {
  it('keeps an ordinary path', () => {
    expect(resolvePreviewPath('blog/post', ORIGIN)).toEqual({
      path: '/blog/post',
      offOrigin: false,
    });
  });

  it('keeps the query and the fragment', () => {
    expect(resolvePreviewPath('blog/post?draft=1#top', ORIGIN).path).toBe(
      '/blog/post?draft=1#top'
    );
  });

  it('reports an empty splat as the root rather than as a rejection', () => {
    expect(resolvePreviewPath('', ORIGIN)).toEqual({
      path: '/',
      offOrigin: false,
    });
    expect(resolvePreviewPath(undefined, ORIGIN)).toEqual({
      path: '/',
      offOrigin: false,
    });
  });

  it('falls back to the root when no origin is available', () => {
    expect(resolvePreviewPath('blog/post', '')).toEqual({
      path: '/',
      offOrigin: false,
    });
  });

  // Each value below resolves to a different origin when it is joined to the
  // base with a leading slash. The URL parser folds `\` into `/` and drops
  // leading tabs, so these must be rejected after resolution, not by filtering.
  it.each([
    ['leading slash', '/other.example'],
    ['double slash', '//other.example'],
    ['backslashes', '\\\\other.example'],
    ['slash then backslash', '/\\other.example'],
    ['leading tab', '\t//other.example'],
    ['trailing path', '//other.example/admin'],
  ])('rejects an off-origin value (%s)', (_label, splat) => {
    const { path, offOrigin } = resolvePreviewPath(splat, ORIGIN);

    expect(path).toBe('/');
    expect(offOrigin).toBe(true);
    expect(new URL(path, ORIGIN).origin).toBe(ORIGIN);
  });

  it('treats an absolute URL as a path segment', () => {
    const { path, offOrigin } = resolvePreviewPath(
      'https://other.example',
      ORIGIN
    );

    expect(offOrigin).toBe(false);
    expect(new URL(path, ORIGIN).origin).toBe(ORIGIN);
  });
});
