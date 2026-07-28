// Where the editor is, expressed as a URL.
//
// Hash routing, not path routing, and not component state. The admin is built to
// static files and served from a plain folder (`public/admin` in v3), so a path
// router needs a server rewrite for every deep link — a hash needs nothing from the
// host. Component state would be simpler still and wrong: reloading would drop the
// editor back to the collection list, and no link to a document would survive being
// pasted to a colleague.

export type AdminRoute =
  | { view: 'collections' }
  | { view: 'collection'; collection: string }
  | { view: 'document'; collection: string; path: string };

export const COLLECTIONS_ROUTE: AdminRoute = { view: 'collections' };

// A document's id is a path with slashes in it (`content/posts/hello.mdx`), so it is
// encoded as ONE segment rather than spread across the route — otherwise the route
// grammar and the document path fight over the same separator.
export const formatAdminRoute = (route: AdminRoute): string => {
  if (route.view === 'collections') return '#/';
  const collection = encodeURIComponent(route.collection);
  if (route.view === 'collection') return `#/collections/${collection}`;
  return `#/collections/${collection}/${encodeURIComponent(route.path)}`;
};

export const parseAdminRoute = (hash: string): AdminRoute => {
  const segments = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  const [prefix, collection, path] = segments;
  // Anything unrecognised lands on the collection list rather than an error page: a
  // stale or hand-typed hash is a navigation mistake, not a fault worth a screen.
  if (prefix !== 'collections' || !collection) return COLLECTIONS_ROUTE;
  if (!path) return { view: 'collection', collection };
  return { view: 'document', collection, path };
};
