export type { AdminScreen, AdminScreenProps } from '../core/screen/contract';
export { TinaAdmin, type TinaAdminProps } from './admin';
export { useAdminScreens, useGlobalNav, useTinaSchema } from './hooks';
export {
  type AdminRoute,
  COLLECTIONS_ROUTE,
  formatAdminRoute,
  parseAdminRoute,
} from './routing';
export { type AdminNavigation, useAdminRoute } from './use-admin-route';
