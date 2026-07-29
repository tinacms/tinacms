// The location of the editor, as a URL.
//
// This uses hash routing. It does not use path routing, and it does not use component
// state. The build writes the admin to static files, and a plain folder serves them. In
// v3 that folder is `public/admin`. A path router therefore needs a server rewrite for
// each deep link, and a hash needs nothing from the host. Component state would be
// simpler, and wrong. A reload would return the editor to the collection list, and a
// link to a document would not work for anyone else.

// The `screen` case is the open half of this grammar. The first three views are the
// content model, which the schema generates and the shell renders. A `screen` is a view
// a plugin registered (core/screen/contract.ts), and the shell routes to it without
// knowing what it is. Its trailing `segments` belong to the screen, so a screen can
// navigate within itself and still be linkable.
export type AdminRoute =
  | { view: 'collections' }
  | { view: 'collection'; collection: string }
  | { view: 'document'; collection: string; path: string }
  | { view: 'screen'; screen: string; segments: string[] };

export const COLLECTIONS_ROUTE: AdminRoute = { view: 'collections' };

// The two route prefixes. `collections` is the content model, `screens` is the plugin
// views. They are separate namespaces, so a screen and a collection may share a name.
//
// `screens` and not `pages`: a project can have a collection called `page` — the
// kitchen-sink schema does — and `#/pages/media` sitting beside `#/collections/page`
// reads as though one is a case of the other. They are unrelated.
const COLLECTIONS_PREFIX = 'collections';
const SCREENS_PREFIX = 'screens';

// The id of a document is a path that holds slashes, for example
// `content/posts/hello.mdx`. It is therefore encoded as one segment, and not spread
// across the route. Without that, the route grammar and the document path would share
// one separator.
export const formatAdminRoute = (route: AdminRoute): string => {
  if (route.view === 'collections') return '#/';
  if (route.view === 'screen') {
    // Each segment is encoded on its own, so a segment holding a slash stays one
    // segment. The screen owns what they mean.
    const parts = [route.screen, ...route.segments].map(encodeURIComponent);
    return `#/${SCREENS_PREFIX}/${parts.join('/')}`;
  }
  const collection = encodeURIComponent(route.collection);
  if (route.view === 'collection')
    return `#/${COLLECTIONS_PREFIX}/${collection}`;
  return `#/${COLLECTIONS_PREFIX}/${collection}/${encodeURIComponent(route.path)}`;
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
  const [prefix, head, ...rest] = decoded as string[];
  // An unknown route goes to the collection list, and not to an error page. A stale
  // hash, or one typed by hand, is a navigation mistake and not a fault.
  if (!head) return COLLECTIONS_ROUTE;
  // A screen whose name is not registered still parses. The shell reports that, the
  // same way it reports a collection outside the schema — the route is well-formed, and
  // it names something that is not there.
  if (prefix === SCREENS_PREFIX)
    return { view: 'screen', screen: head, segments: rest };
  if (prefix !== COLLECTIONS_PREFIX) return COLLECTIONS_ROUTE;
  const [path] = rest;
  if (!path) return { view: 'collection', collection: head };
  return { view: 'document', collection: head, path };
};
