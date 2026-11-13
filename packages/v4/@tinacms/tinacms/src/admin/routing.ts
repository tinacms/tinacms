export type AdminRoute =
  | { view: 'home' }
  | { view: 'media' }
  | { view: 'tools' }
  | { view: 'settings' }
  | { view: 'collections'; unsavedOnly?: boolean; maximised?: true }
  | { view: 'collection'; collection: string; maximised?: true }
  | { view: 'folder'; collection: string; folder: string }
  | { view: 'document'; collection: string; path: string }
  | { view: 'screen'; screen: string; segments: string[] };

export const COLLECTIONS_ROUTE: AdminRoute = { view: 'collections' };
export const HOME_ROUTE: AdminRoute = { view: 'home' };

const COLLECTIONS_PREFIX = 'collections';
const SCREENS_PREFIX = 'screens';
const UNSAVED_ONLY = '?unsaved';
const MAXIMISED = '?max';
const FOLDER_SEGMENT = 'folder';

export const formatAdminRoute = (route: AdminRoute): string => {
  if (route.view === 'home') return '#/';
  if (route.view === 'collections') {
    if (route.maximised) {
      return `#/${COLLECTIONS_PREFIX}${MAXIMISED}${route.unsavedOnly ? '&unsaved' : ''}`;
    }
    return `#/${COLLECTIONS_PREFIX}${route.unsavedOnly ? UNSAVED_ONLY : ''}`;
  }
  if (
    route.view === 'media' ||
    route.view === 'tools' ||
    route.view === 'settings'
  )
    return `#/${route.view}`;
  if (route.view === 'screen') {
    const parts = [route.screen, ...route.segments].map(encodeURIComponent);
    return `#/${SCREENS_PREFIX}/${parts.join('/')}`;
  }
  const collection = encodeURIComponent(route.collection);
  if (route.view === 'collection')
    return `#/${COLLECTIONS_PREFIX}/${collection}${route.maximised ? MAXIMISED : ''}`;
  if (route.view === 'folder') {
    if (route.folder === '') {
      return `#/${COLLECTIONS_PREFIX}/${collection}${MAXIMISED}`;
    }
    const parts = route.folder.split('/').map(encodeURIComponent);
    return `#/${COLLECTIONS_PREFIX}/${collection}/${FOLDER_SEGMENT}/${parts.join('/')}`;
  }
  return `#/${COLLECTIONS_PREFIX}/${collection}/${encodeURIComponent(route.path)}`;
};

const decodeSegment = (segment: string): string | null => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
};

// An empty or unknown hash opens Home, the landing screen.
export const parseAdminRoute = (hash: string): AdminRoute => {
  const [path = '', query] = hash.split('?');
  const raw = path.replace(/^#\/?/, '').split('/').filter(Boolean);
  const decoded = raw.map(decodeSegment);
  if (decoded.some((segment) => segment === null)) return HOME_ROUTE;
  const [prefix, head, ...rest] = decoded as string[];
  if (
    !head &&
    (prefix === 'media' || prefix === 'tools' || prefix === 'settings')
  )
    return { view: prefix };
  if (prefix === COLLECTIONS_PREFIX && !head) {
    const flags = (query ?? '').split('&');
    const unsavedOnly = flags.includes('unsaved');
    const maximised = flags.includes('max');
    if (!unsavedOnly && !maximised) return COLLECTIONS_ROUTE;
    return {
      view: 'collections',
      ...(unsavedOnly ? { unsavedOnly: true } : {}),
      ...(maximised ? { maximised: true as const } : {}),
    };
  }
  if (!head) return HOME_ROUTE;
  if (prefix === SCREENS_PREFIX)
    return { view: 'screen', screen: head, segments: rest };
  if (prefix !== COLLECTIONS_PREFIX) return HOME_ROUTE;
  const [docPath, ...folderParts] = rest;
  if (!docPath) {
    return (query ?? '').split('&').includes('max')
      ? { view: 'collection', collection: head, maximised: true }
      : { view: 'collection', collection: head };
  }
  if (docPath === FOLDER_SEGMENT) {
    if (folderParts.length === 0)
      return { view: 'collection', collection: head, maximised: true };
    return { view: 'folder', collection: head, folder: folderParts.join('/') };
  }
  return { view: 'document', collection: head, path: docPath };
};
