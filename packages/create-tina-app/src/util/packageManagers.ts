/**
 * The available package managers a user can use.
 * To add a new supported package manager, add the usage command to this list.
 * The `PackageManager` type will be automatically updated as a result.
 */
export const PKG_MANAGERS = ['pnpm', 'yarn', 'bun', 'npm'] as const;
export type PackageManager = (typeof PKG_MANAGERS)[number];

export const LOCK_FILES: Record<PackageManager, readonly string[]> = {
  pnpm: ['pnpm-lock.yaml'],
  yarn: ['yarn.lock'],
  bun: ['bun.lock', 'bun.lockb'],
  npm: ['package-lock.json'],
};
