import { useCallback, useSyncExternalStore } from 'react';
import { type AdminRoute, formatAdminRoute, parseAdminRoute } from './routing';

// `location.hash` is external mutable state that React does not own — the back
// button and a pasted link both change it behind the component tree. useSyncExternalStore
// is the primitive for exactly that; a useState mirror would miss both.
const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

const readHash = () => window.location.hash;
// The server has no location, and the admin is client-rendered — the collection
// list is what it would show before hydration anyway.
const readHashOnServer = () => '';

export interface AdminNavigation {
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
}

export const useAdminRoute = (): AdminNavigation => {
  const hash = useSyncExternalStore(subscribe, readHash, readHashOnServer);
  const navigate = useCallback((route: AdminRoute) => {
    // Assigning the hash rather than pushState: it produces the history entry the
    // back button expects and fires hashchange, so there is one path in and out.
    window.location.hash = formatAdminRoute(route);
  }, []);
  return { route: parseAdminRoute(hash), navigate };
};
