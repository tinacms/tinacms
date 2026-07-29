// The location of the editor, as a URL.
//
// This uses hash routing. It does not use path routing, and it does not use component
// state. The build writes the admin to static files, and a plain folder serves them. In
// v3 that folder is `public/admin`. A path router therefore needs a server rewrite for
// each deep link, and a hash needs nothing from the host. Component state would be
// simpler, and wrong. A reload would return the editor to the collection list, and a
// link to a document would not work for anyone else.

export type AdminRoute =
  | { view: 'collections' }
  | { view: 'collection'; collection: string }
  | { view: 'document'; collection: string; path: string };

export const COLLECTIONS_ROUTE: AdminRoute = { view: 'collections' };

// The id of a document is a path that holds slashes, for example
// `content/posts/hello.mdx`. It is therefore encoded as one segment, and not spread
// across the route. Without that, the route grammar and the document path would share
// one separator.
export const formatAdminRoute = (route: AdminRoute): string => {
  if (route.view === 'collections') return '#/';
  const collection = encodeURIComponent(route.collection);
  if (route.view === 'collection') return `#/collections/${collection}`;
  return `#/collections/${collection}/${encodeURIComponent(route.path)}`;
};

// decodeURIComponent throws a URIError on a malformed escape such as `100%`. This runs
// during render, so an unguarded throw white-screens the admin — for a hash a user can
// type, which is the case the fallback below exists for.
const decodeSegment = (segment: string): string | null => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
};

export const parseAdminRoute = (hash: string): AdminRoute => {
  const raw = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const decoded = raw.map(decodeSegment);
  if (decoded.some((segment) => segment === null)) return COLLECTIONS_ROUTE;
  const segments = decoded as string[];
  const [prefix, collection, path] = segments;
  // An unknown route goes to the collection list, and not to an error page. A stale
  // hash, or one typed by hand, is a navigation mistake and not a fault.
  if (prefix !== 'collections' || !collection) return COLLECTIONS_ROUTE;
  if (!path) return { view: 'collection', collection };
  return { view: 'document', collection, path };
};
