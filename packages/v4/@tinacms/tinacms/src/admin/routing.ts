export type AdminRoute =
  | { view: 'home' }
  | { view: 'media' }
  | { view: 'tools' }
  | { view: 'settings' }
  | { view: 'collections'; unsavedOnly?: boolean }
  | { view: 'collection'; collection: string; side?: true }
  | { view: 'folder'; collection: string; folder: string }
  | { view: 'document'; collection: string; path: string }
  | { view: 'screen'; screen: string; segments: string[] };

export const COLLECTIONS_ROUTE: AdminRoute = { view: 'collections' };
export const HOME_ROUTE: AdminRoute = { view: 'home' };

const COLLECTIONS_PREFIX = 'collections';
const SCREENS_PREFIX = 'screens';
const UNSAVED_ONLY = '?unsaved';
const SIDE = '?side';
const FOLDER_SEGMENT = 'folder';

export const formatAdminRoute = (route: AdminRoute): string => {
  if (route.view === 'home') return '#/';
  if (route.view === 'collections')
    return `#/${COLLECTIONS_PREFIX}${route.unsavedOnly ? UNSAVED_ONLY : ''}`;
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
    return `#/${COLLECTIONS_PREFIX}/${collection}${route.side ? SIDE : ''}`;
  if (route.view === 'folder') {
    if (route.folder === '') return `#/${COLLECTIONS_PREFIX}/${collection}`;
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
    return query === 'unsaved'
      ? { view: 'collections', unsavedOnly: true }
      : COLLECTIONS_ROUTE;
  }
  if (!head) return HOME_ROUTE;
  if (prefix === SCREENS_PREFIX)
    return { view: 'screen', screen: head, segments: rest };
  if (prefix !== COLLECTIONS_PREFIX) return HOME_ROUTE;
  const [docPath, ...folderParts] = rest;
  if (!docPath) {
    return query === 'side'
      ? { view: 'collection', collection: head, side: true }
      : { view: 'collection', collection: head };
  }
  if (docPath === FOLDER_SEGMENT) {
    return folderParts.length === 0
      ? { view: 'collection', collection: head }
      : { view: 'folder', collection: head, folder: folderParts.join('/') };
  }
  return { view: 'document', collection: head, path: docPath };
};
