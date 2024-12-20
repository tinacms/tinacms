import path from 'path'
import { loadProjectConfig } from '../next/vite'
import { loadConfig } from 'tsconfig-paths'
import fs from 'fs-extra'

export async function loadViteConfig(rootPath: string) {
  try {
    return await loadProjectConfig({
      rootPath,
      viteConfigEnv: {
        command: 'build',
        mode: 'production',
      },
    })
  } catch (error) {
    console.error('Failed to load Vite config:', error.message)
    throw new Error('Error loading Vite configuration')
  }
}

export function resolveDynamicAliases(
  tsconfigPath: string
): Record<string, string> {
  if (!fs.existsSync(tsconfigPath)) {
    console.warn(
      'Warning: tsconfig.json not found. Alias resolution will not be supported.'
    )
    return {}
  }

  const tsConfigResult = loadConfig(tsconfigPath)
  if (tsConfigResult.resultType !== 'success') {
    console.error('Failed to load tsconfig.json:', tsConfigResult.message)
    throw new Error(`Invalid tsconfig.json at ${tsconfigPath}`)
  }

  const { absoluteBaseUrl, paths } = tsConfigResult
  return resolveTsPathsToEsbuildAliases(absoluteBaseUrl, paths)
}

/**
 * Converts TypeScript-style `paths` aliases to esbuild-compatible format.
 * @param {string} absoluteBaseUrl - The absolute base URL from tsconfig.
 * @param {Record<string, string[]>} paths - The alias paths from tsconfig.
 * @returns {Record<string, string>} - A mapping of esbuild-compatible aliases.
 */
function resolveTsPathsToEsbuildAliases(absoluteBaseUrl, paths) {
  /**
    Convert TypeScript-style `paths` aliases to an esbuild-compatible format:
    1. Ensure all alias paths are resolved to absolute paths (required by https://www.npmjs.com/package/esbuild-plugin-alias).
    2. Handle wildcard (`*`) in the alias key by converting it to an esbuild-compatible format.
        - Example: "alias/*" => "absolute/path/to/alias/*".
    3. For non-wildcard aliases, simply resolve the base path.

    Result:
    - An object mapping alias keys to their absolute paths, ready for esbuild.
*/
  return Object.entries(paths).reduce((aliases, [aliasKey, aliasPaths]) => {
    const baseAliasPath = path.resolve(
      absoluteBaseUrl,
      aliasPaths[0].replace('*', '') // Remove the "*" wildcard to get the base path
    )

    aliases[aliasKey] = baseAliasPath
    return aliases
  }, {})
}
