/**
 * The available package managers a user can use.
 * To add a new supported package manager, add the usage command to this list.
 * The `PackageManager` type will be automatically updated as a result.
 */
export const PKG_MANAGERS = ['npm', 'yarn', 'pnpm', 'bun'] as const;
export type PackageManager = (typeof PKG_MANAGERS)[number];
