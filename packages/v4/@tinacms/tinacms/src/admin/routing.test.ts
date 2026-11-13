import { describe, expect, it } from 'vitest';
import {
  type AdminRoute,
  COLLECTIONS_ROUTE,
  formatAdminRoute,
  HOME_ROUTE,
  parseAdminRoute,
} from './routing';

describe('admin routing', () => {
  const routes: AdminRoute[] = [
    { view: 'collections' },
    { view: 'home' },
    { view: 'media' },
    { view: 'tools' },
    { view: 'settings' },
    { view: 'collections', unsavedOnly: true },
    { view: 'collection', collection: 'post' },
    { view: 'collection', collection: 'post', maximised: true },
    { view: 'collections', maximised: true },
    { view: 'folder', collection: 'post', folder: 'a' },
    { view: 'folder', collection: 'post', folder: 'a/b' },
    { view: 'folder', collection: 'post', folder: 'folder' },
    { view: 'folder', collection: 'post', folder: 'v1.2/folder/x y' },
    { view: 'document', collection: 'post', path: 'content/posts/hello.mdx' },
    { view: 'screen', screen: 'media', segments: [] },
    { view: 'screen', screen: 'media', segments: ['photos', '2026'] },
  ];

  it.each(routes)('round-trips $view', (route) => {
    expect(parseAdminRoute(formatAdminRoute(route))).toEqual(route);
  });

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

  it.each(['', '#', '#/', '#/nonsense', '#/home', '#/changes'])(
    'opens Home for %j',
    (hash) => {
      expect(parseAdminRoute(hash)).toEqual(HOME_ROUTE);
    }
  );

  it.each(['#/collections', '#/collections/'])(
    'opens the collection list for %j',
    (hash) => {
      expect(parseAdminRoute(hash)).toEqual(COLLECTIONS_ROUTE);
    }
  );

  it('writes Home as the landing hash', () => {
    expect(formatAdminRoute(HOME_ROUTE)).toBe('#/');
  });

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

  it.each(['#/screens', '#/screens/'])('falls back for %j', (hash) => {
    expect(parseAdminRoute(hash)).toEqual(HOME_ROUTE);
  });
});

describe('parseAdminRoute on input a user can type', () => {
  it.each([
    '#/collections/100%',
    '#/collections/post/%E0%A4%A',
    '#/collections/%',
  ])('falls back rather than throwing on %j', (hash) => {
    expect(() => parseAdminRoute(hash)).not.toThrow();
    expect(parseAdminRoute(hash)).toEqual(HOME_ROUTE);
  });

  it('writes each folder part as its own encoded segment', () => {
    expect(
      formatAdminRoute({ view: 'folder', collection: 'post', folder: 'a/b c' })
    ).toBe('#/collections/post/folder/a/b%20c');
    expect(
      formatAdminRoute({
        view: 'collection',
        collection: 'post',
        maximised: true,
      })
    ).toBe('#/collections/post?max');
  });

  it('writes ?max alone, never with ?unsaved, and keeps the minimised addresses plain', () => {
    expect(formatAdminRoute({ view: 'collections', maximised: true })).toBe(
      '#/collections?max'
    );
    expect(
      formatAdminRoute({
        view: 'collections',
        maximised: true,
        unsavedOnly: true,
      })
    ).toBe('#/collections?max');
    expect(parseAdminRoute('#/collections?max')).toEqual({
      view: 'collections',
      maximised: true,
    });
    expect(parseAdminRoute('#/collections')).toEqual({ view: 'collections' });
    expect(parseAdminRoute('#/collections/post')).toEqual({
      view: 'collection',
      collection: 'post',
    });
    expect(parseAdminRoute('#/collections?unsaved')).toEqual({
      view: 'collections',
      unsavedOnly: true,
    });
  });

  it('reads a folder address with no parts as the collection', () => {
    expect(parseAdminRoute('#/collections/post/folder')).toEqual({
      view: 'collection',
      collection: 'post',
      maximised: true,
    });
    expect(
      formatAdminRoute({ view: 'folder', collection: 'post', folder: '' })
    ).toBe('#/collections/post?max');
  });

  it('still reads a document address as a document', () => {
    expect(parseAdminRoute('#/collections/post/folder.mdx')).toEqual({
      view: 'document',
      collection: 'post',
      path: 'folder.mdx',
    });
  });
});
