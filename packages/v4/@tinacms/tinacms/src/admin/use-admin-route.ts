import { useMemo, useSyncExternalStore } from 'react';
import { type AdminRoute, formatAdminRoute, parseAdminRoute } from './routing';

// The `location.hash` value is external state that React does not own. The back button
// changes it, and so does a pasted link, both outside the component tree.
// useSyncExternalStore is the primitive for that state. A copy in useState would miss
// both changes.
const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

const readHash = () => window.location.hash;
// The server has no location, and the client renders the admin. The collection list is
// what the admin shows before hydration.
const readHashOnServer = () => '';

// This assigns the hash, and does not call pushState. The assignment makes the history
// entry that the back button needs, and it fires hashchange. There is then one path in
// and one path out.
const navigate = (route: AdminRoute) => {
  window.location.hash = formatAdminRoute(route);
};

export interface AdminNavigation {
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
}

export const useAdminRoute = (): AdminNavigation => {
  const hash = useSyncExternalStore(subscribe, readHash, readHashOnServer);
  // Held against the hash, and not rebuilt each render. This is a public hook, and
  // parseAdminRoute returns a fresh object with a fresh `segments` array — so a
  // consumer with `[route]` or `[segments]` in its dependencies would loop.
  const route = useMemo(() => parseAdminRoute(hash), [hash]);
  return { route, navigate };
};
