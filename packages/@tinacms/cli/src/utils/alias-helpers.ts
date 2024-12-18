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
    // Resolve the base alias path
    const baseAliasPath = path.resolve(
      absoluteBaseUrl,
      aliasPaths[0].replace('*', '') // Remove the "*" wildcard to get the base path
    )

    // Check if the alias resolves to the root/base directory
    if (
      baseAliasPath === absoluteBaseUrl ||
      baseAliasPath === path.resolve(absoluteBaseUrl, './')
    ) {
      console.warn(
        `Ignoring alias "${aliasKey}" resolves to the root directory is not supported in esbuild plugin.`
      )
      return aliases // Skip this alias
    }

    // Otherwise, add the alias to the aliases object
    aliases[aliasKey] = baseAliasPath
    return aliases
  }, {})
}
