import type { Cache } from './index';

const getRootPath = (pathParts: string[], path: any) => {
  if (pathParts.length === 0) return null;
  const isWindows = path.sep === '\\';
  const root = pathParts[0];
  return isWindows ? `${root}${path.sep}` : `${path.sep}${root}`;
};

export const makeCacheDir = async (
  dir: string,
  fs: any,
  path: any,
  os: any
): Promise<string | null> => {
  const normalizedDir = path.normalize(dir);
  const pathParts = normalizedDir.split(path.sep).filter(Boolean);
  const cacheHash = pathParts[pathParts.length - 1];

  const rootPath = getRootPath(pathParts, path);
  const rootExists = rootPath && fs.existsSync(rootPath);
  const cacheDir = rootExists
    ? normalizedDir
    : path.join(os.tmpdir(), cacheHash);

  try {
    fs.mkdirSync(cacheDir, { recursive: true });
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
    const fsModule = await import('node:fs');
    const pathModule = await import('node:path');
    const osModule = await import('node:os');
    const cryptoModule = await import('node:crypto');

    const fs = fsModule.default ?? fsModule;
    const path = pathModule.default ?? pathModule;
    const os = osModule.default ?? osModule;
    const crypto = cryptoModule.default ?? cryptoModule;

    if (typeof path.join !== 'function') {
      console.warn(
        'Warning: Node.js path module not available. Caching will be disabled.'
      );
      return null;
    }

    const cacheDir = await makeCacheDir(dir, fs, path, os);
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
    console.warn(
      'Warning: Failed to initialize cache. Caching will be disabled.',
      e.message
    );
    return null;
  }
};
