import fs from 'fs-extra'
import path from 'path'

export interface AliasPathOptions {
  alias?: Record<string, string>
  skip?: boolean
  cwd?: string
}

export interface NormalizedAliasPathOptions
  extends Required<AliasPathOptions> {}

export function recursiveResolve(
  alias: Record<string, string>,
  cwd: string
): Record<string, string> {
  const result: Record<string, string> = {}

  // Define directories or files to ignore
  const ignoredPatterns = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    '.DS_Store',
    '*.log',
  ]

  // Helper function to check if a path should be ignored
  function shouldIgnore(fileOrDir: string): boolean {
    return ignoredPatterns.some((pattern) =>
      fileOrDir.match(new RegExp(pattern.replace(/\*/g, '.*'), 'i'))
    )
  }

  for (const [k, v] of Object.entries(alias)) {
    if (fs.statSync(v).isDirectory()) {
      fs.readdirSync(v).forEach((fileOrDir) => {
        // Skip the ignored directory or file
        if (shouldIgnore(fileOrDir)) {
          console.warn(`Skipping ignored directory or file: ${fileOrDir}`)
          return
        }

        const isStillDir = fs.statSync(path.join(v, fileOrDir)).isDirectory()

        if (isStillDir) {
          const nextExploreReplacementDir = path.join(v, fileOrDir)
          const currentDir = path.dirname(k).replace('**', '')
          const nextExploreMatchDir = path.join(currentDir, fileOrDir)

          const resolved = recursiveResolve(
            {
              [nextExploreMatchDir]: nextExploreReplacementDir,
            },
            cwd
          )

          const [[_k, _v]] = Object.entries(resolved)

          result[_k] = _v
        } else {
          const replacedKey = k.endsWith('*')
            ? k.replace('*', fileOrDir.replace(path.extname(fileOrDir), ''))
            : path.join(k, fileOrDir.replace(path.extname(fileOrDir), ''))

          const absoluteReplacementValue = path.resolve(v, fileOrDir)

          result[replacedKey] = absoluteReplacementValue
        }
      })

      k.endsWith('*') && delete alias[k]
    } else {
      result[k] = v
    }
  }

  return result
}

export function normalizeOption(
  options: AliasPathOptions = {}
): NormalizedAliasPathOptions {
  const alias = options.alias ?? {}
  const cwd = options.cwd ?? process.cwd()
  const resolvedAlias = recursiveResolve(alias, cwd)
  const shouldSkipThisPlugin =
    options.skip ?? !Object.keys(resolvedAlias).length

  return {
    alias: resolvedAlias,
    skip: shouldSkipThisPlugin,
    cwd,
  }
}
