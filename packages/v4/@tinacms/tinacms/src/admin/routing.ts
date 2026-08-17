export type AdminRoute =
  | { view: 'collections' }
  | { view: 'collection'; collection: string }
  | { view: 'document'; collection: string; path: string }
  | { view: 'screen'; screen: string; segments: string[] };

export const COLLECTIONS_ROUTE: AdminRoute = { view: 'collections' };

const COLLECTIONS_PREFIX = 'collections';
const SCREENS_PREFIX = 'screens';

export const formatAdminRoute = (route: AdminRoute): string => {
  if (route.view === 'collections') return '#/';
  if (route.view === 'screen') {
    const parts = [route.screen, ...route.segments].map(encodeURIComponent);
    return `#/${SCREENS_PREFIX}/${parts.join('/')}`;
  }
  const collection = encodeURIComponent(route.collection);
  if (route.view === 'collection')
    return `#/${COLLECTIONS_PREFIX}/${collection}`;
  return `#/${COLLECTIONS_PREFIX}/${collection}/${encodeURIComponent(route.path)}`;
};

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
  if (!head) return COLLECTIONS_ROUTE;
  if (prefix === SCREENS_PREFIX)
    return { view: 'screen', screen: head, segments: rest };
  if (prefix !== COLLECTIONS_PREFIX) return COLLECTIONS_ROUTE;
  const [path] = rest;
  if (!path) return { view: 'collection', collection: head };
  return { view: 'document', collection: head, path };
};
