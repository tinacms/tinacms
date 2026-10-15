import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { type AdminRoute, formatAdminRoute, parseAdminRoute } from './routing';

export interface AdminNavigation {
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
}

export const useAdminRoute = (): AdminNavigation => {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const route = useMemo(
    () => parseAdminRoute(`#${location.pathname}`),
    [location.pathname]
  );
  const navigate = useCallback(
    (next: AdminRoute) => routerNavigate(formatAdminRoute(next).slice(1)),
    [routerNavigate]
  );
  return { route, navigate };
};
