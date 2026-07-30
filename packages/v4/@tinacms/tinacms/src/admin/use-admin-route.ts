import { useMemo, useSyncExternalStore } from 'react';
import { type AdminRoute, formatAdminRoute, parseAdminRoute } from './routing';

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

const readHash = () => window.location.hash;
const readHashOnServer = () => '';

const navigate = (route: AdminRoute) => {
  window.location.hash = formatAdminRoute(route);
};

export interface AdminNavigation {
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
}

export const useAdminRoute = (): AdminNavigation => {
  const hash = useSyncExternalStore(subscribe, readHash, readHashOnServer);
  const route = useMemo(() => parseAdminRoute(hash), [hash]);
  return { route, navigate };
};
