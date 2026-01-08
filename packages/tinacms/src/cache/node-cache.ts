import type { Cache } from './index';

// Type definitions for dynamically imported modules
type FsModule = typeof import('node:fs');
type PathModule = typeof import('node:path');
type OsModule = typeof import('node:os');
type CryptoModule = typeof import('node:crypto');

/**
 * Helper to extract the actual module from a dynamic import result.
 * In ESM, dynamic imports of Node built-ins return namespace objects.
 * The actual module might be on `.default` or directly on the namespace.
 */
const resolveModule = <T>(mod: T | { default: T }): T => {
  // If the module has a default export and it looks like the actual module,
  // prefer that (handles ESM namespace objects)
  if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
    return mod.default as T;
  }
  return mod as T;
};

const getRootPath = (pathParts: string[], pathArg: PathModule) => {
  if (pathParts.length === 0) return null;
  const isWindows = pathArg.sep === '\\';
  const root = pathParts[0];
  return isWindows ? `${root}${pathArg.sep}` : `${pathArg.sep}${root}`;
};

// Exported for testing with dependency injection
// Note: No default parameter values to avoid top-level module resolution
export const makeCacheDir = (
  dir: string,
  fsArg: FsModule,
  pathArg: PathModule,
  osArg: OsModule
): string | null => {
  const normalizedDir = pathArg.normalize(dir);
  const pathParts = normalizedDir.split(pathArg.sep).filter(Boolean);
  const cacheHash = pathParts[pathParts.length - 1];

  const rootPath = getRootPath(pathParts, pathArg);
  const rootExists = rootPath && fsArg.existsSync(rootPath);
  const cacheDir = rootExists
    ? normalizedDir
    : pathArg.join(osArg.tmpdir(), cacheHash);

  try {
    fsArg.mkdirSync(cacheDir, { recursive: true });
  } catch (error) {
    console.warn(
      `Warning: Failed to create cache directory: ${error.message}. Caching will be disabled.`
    );
    return null;
  }

  return cacheDir;
};

export const NodeCache = async (dir: string): Promise<Cache | null> => {
  try {
    // Use node: protocol to clearly signal these are Node.js built-ins
    // This helps bundlers like Turbopack understand these should not be polyfilled
    const [fsModule, pathModule, osModule, cryptoModule] = await Promise.all([
      import('node:fs'),
      import('node:path'),
      import('node:os'),
      import('node:crypto'),
    ]);

    // Resolve modules from ESM namespace objects
    // Dynamic imports return {default, ...namedExports}, we need the actual module
    const fs = resolveModule(fsModule);
    const path = resolveModule(pathModule);
    const os = resolveModule(osModule);
    const crypto = resolveModule(cryptoModule);

    // Verify path module is available and properly resolved
    // This guards against bundler stubs that don't implement the full API
    if (typeof path?.join !== 'function') {
      console.warn(
        'Warning: Node.js path module not available. Caching will be disabled.'
      );
      return null;
    }

    const cacheDir = makeCacheDir(dir, fs, path, os);
    if (cacheDir === null) {
      return null;
    }

    return {
      makeKey: (key: any) => {
        const input =
          key && key instanceof Object ? JSON.stringify(key) : key || '';
        return crypto.createHash('sha256').update(input).digest('hex');
      },
      get: async (key: string) => {
        let readValue: object | undefined;
        const cacheFilename = path.join(cacheDir, key);

        try {
          const data = await fs.promises.readFile(cacheFilename, 'utf-8');
          readValue = JSON.parse(data);
        } catch (e) {
          if (e.code !== 'ENOENT') {
            console.warn(
              `Warning: Failed to read cache file ${cacheFilename}: ${e.message}`
            );
          }
        }

        return readValue;
      },
      set: async (key: string, value: any) => {
        const cacheFilename = path.join(cacheDir, key);

        try {
          await fs.promises.writeFile(cacheFilename, JSON.stringify(value), {
            encoding: 'utf-8',
            flag: 'wx',
          });
        } catch (e) {
          if (e.code !== 'EEXIST') {
            console.warn(
              `Warning: Failed to write cache file ${cacheFilename}: ${e.message}`
            );
          }
        }
      },
    };
  } catch (e) {
    // This handles cases (like Edge runtime) where import('node:fs') might throw
    console.warn(
      'Warning: Failed to initialize cache. Caching will be disabled.',
      e.message
    );
    return null;
  }
};
