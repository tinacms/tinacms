// Browser-only entry — `@tinacms/tinacms/admin`. The Admin UI shell a host mounts
// inside a TinaProvider. Everything it renders comes from the compiled schema, so a
// host writes no per-collection code.

export { TinaAdmin, type TinaAdminProps } from './admin';
export { useTinaSchema } from './hooks';
export {
  type AdminRoute,
  COLLECTIONS_ROUTE,
  formatAdminRoute,
  parseAdminRoute,
} from './routing';
export { type AdminNavigation, useAdminRoute } from './use-admin-route';
