// The browser entry, `@tinacms/tinacms/admin`. It holds the shell of the admin UI, which
// a host mounts inside a TinaProvider. Everything it renders comes from the compiled
// schema, so a host writes no code for a collection.

export type { AdminScreen, AdminScreenProps } from '../core/screen/contract';
export { TinaAdmin, type TinaAdminProps } from './admin';
export { useAdminScreens, useTinaSchema } from './hooks';
export {
  type AdminRoute,
  COLLECTIONS_ROUTE,
  formatAdminRoute,
  parseAdminRoute,
} from './routing';
export { type AdminNavigation, useAdminRoute } from './use-admin-route';
