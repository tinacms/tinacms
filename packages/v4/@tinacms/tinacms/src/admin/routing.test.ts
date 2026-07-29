import { describe, expect, it } from 'vitest';
import {
  type AdminRoute,
  COLLECTIONS_ROUTE,
  formatAdminRoute,
  parseAdminRoute,
} from './routing';

describe('admin routing', () => {
  const routes: AdminRoute[] = [
    { view: 'collections' },
    { view: 'collection', collection: 'post' },
    { view: 'document', collection: 'post', path: 'content/posts/hello.mdx' },
    { view: 'screen', screen: 'media', segments: [] },
    { view: 'screen', screen: 'media', segments: ['photos', '2026'] },
  ];

  it.each(routes)('round-trips $view', (route) => {
    expect(parseAdminRoute(formatAdminRoute(route))).toEqual(route);
  });

  // The document id is a path, so its slashes must not read as route separators.
  it('carries a document path as one encoded segment', () => {
    expect(
      formatAdminRoute({
        view: 'document',
        collection: 'post',
        path: 'content/posts/hello.mdx',
      })
    ).toBe('#/collections/post/content%2Fposts%2Fhello.mdx');
  });

  it('round-trips a path with characters a URL would otherwise eat', () => {
    const route: AdminRoute = {
      view: 'document',
      collection: 'post',
      path: 'content/posts/a b & c#d.mdx',
    };
    expect(parseAdminRoute(formatAdminRoute(route))).toEqual(route);
  });

  // A stale or hand-typed hash is a navigation mistake, not a fault.
  it.each(['', '#', '#/', '#/nonsense', '#/collections', '#/collections/'])(
    'falls back to the collection list for %j',
    (hash) => {
      expect(parseAdminRoute(hash)).toEqual(COLLECTIONS_ROUTE);
    }
  );

  it('reads a hash written without the leading slash', () => {
    expect(parseAdminRoute('#collections/post')).toEqual({
      view: 'collection',
      collection: 'post',
    });
  });
});

describe('admin routing for plugin screens', () => {
  it('mounts a screen under its own prefix', () => {
    expect(
      formatAdminRoute({ view: 'screen', screen: 'media', segments: [] })
    ).toBe('#/screens/media');
  });

  // The two prefixes are separate namespaces. A project with a collection called `page`
  // is the case that named this prefix `screens` rather than `pages`.
  it('does not confuse a screen with a collection of the same name', () => {
    expect(parseAdminRoute('#/screens/page')).toEqual({
      view: 'screen',
      screen: 'page',
      segments: [],
    });
    expect(parseAdminRoute('#/collections/page')).toEqual({
      view: 'collection',
      collection: 'page',
    });
  });

  // Each segment is encoded on its own, so a segment holding a slash stays one segment.
  it('keeps a screen segment whole when it holds a slash', () => {
    const route: AdminRoute = {
      view: 'screen',
      screen: 'media',
      segments: ['uploads/2026', 'a b & c'],
    };
    expect(formatAdminRoute(route)).toBe(
      '#/screens/media/uploads%2F2026/a%20b%20%26%20c'
    );
    expect(parseAdminRoute(formatAdminRoute(route))).toEqual(route);
  });

  // A screen prefix with no name is not a screen. It falls back like any stale hash.
  it.each(['#/screens', '#/screens/'])('falls back for %j', (hash) => {
    expect(parseAdminRoute(hash)).toEqual(COLLECTIONS_ROUTE);
  });
});

describe('parseAdminRoute on input a user can type', () => {
  // decodeURIComponent throws a URIError on these, and parseAdminRoute runs during
  // render — so an unguarded throw white-screened the admin.
  it.each([
    '#/collections/100%',
    '#/collections/post/%E0%A4%A',
    '#/collections/%',
  ])('falls back rather than throwing on %j', (hash) => {
    expect(() => parseAdminRoute(hash)).not.toThrow();
    expect(parseAdminRoute(hash)).toEqual(COLLECTIONS_ROUTE);
  });
});
