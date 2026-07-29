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
