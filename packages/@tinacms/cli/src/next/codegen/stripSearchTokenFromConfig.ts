/**
 * Strips `indexerToken` from `search.tina` before serialization to
 * _schema.json / tina-lock.json.
 *
 * @see https://github.com/tinacms/tinacms/security/advisories/GHSA-4qrm-9h4r-v2fx
 */
export function stripSearchTokenFromConfig<T extends object>(config: T): T {
  const cfg = config as Record<string, unknown>;
  if (!cfg?.search) {
    return config;
  }

  // Include search config in lock file, but exclude sensitive indexerToken
  // Only add search if search.tina exists - plain search without tina is not included
  // Preserve original key order by iterating over keys instead of destructuring
  const search = cfg.search as Record<string, unknown> | undefined;
  const tina = search?.tina as Record<string, unknown> | undefined;

  if (tina) {
    const { indexerToken, ...safeSearchConfig } = tina;
    const newConfig: Record<string, unknown> = {};
    for (const key of Object.keys(cfg)) {
      if (key === 'search') {
        newConfig.search = { tina: safeSearchConfig };
      } else {
        newConfig[key] = cfg[key];
      }
    }
    return newConfig as T;
  } else {
    // Remove search key if search.tina doesn't exist (preserving key order)
    const newConfig: Record<string, unknown> = {};
    for (const key of Object.keys(cfg)) {
      if (key !== 'search') {
        newConfig[key] = cfg[key];
      }
    }
    return newConfig as T;
  }
}
