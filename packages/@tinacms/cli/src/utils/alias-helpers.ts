import path from 'path'

/**
 * Converts TypeScript-style `paths` aliases to esbuild-compatible format.
 * @param {string} absoluteBaseUrl - The absolute base URL from tsconfig.
 * @param {Record<string, string[]>} paths - The alias paths from tsconfig.
 * @returns {Record<string, string>} - A mapping of esbuild-compatible aliases.
 */
export function resolveTsPathsToEsbuildAliases(absoluteBaseUrl, paths) {
  /**
    Convert TypeScript-style `paths` aliases to an esbuild-compatible format:
    1. Ensure all alias paths are resolved to absolute paths (required by https://www.npmjs.com/package/esbuild-plugin-alias).
    2. Handle wildcard (`*`) in the alias key by converting it to an esbuild-compatible format.
        - Example: "alias/*" => "absolute/path/to/alias/*".
    3. For non-wildcard aliases, simply resolve the base path.

    Result:
    - `dynamicAliases` will be an object mapping alias keys to their absolute paths, ready for esbuild.
*/
  return Object.entries(paths).reduce((aliases, [aliasKey, aliasPaths]) => {
    // Ignore "@/*" explicitly
    if (aliasKey === '@/*') {
      console.warn('Ignoring "@/*" alias due to potential conflicts.')
      return aliases
    }

    // const hasWildcard = aliasKey.includes('*')
    // const baseAliasKey = hasWildcard ? aliasKey.replace('/*', '') : aliasKey
    const baseAliasPath = path.resolve(
      absoluteBaseUrl,
      aliasPaths[0].replace('*', '')
    )

    // if (hasWildcard) {
    //   aliases[`${baseAliasKey}/*`] = `${baseAliasPath}`
    // } else {
      aliases[aliasKey] = baseAliasPath
    // }

    return aliases
  }, {})
}
