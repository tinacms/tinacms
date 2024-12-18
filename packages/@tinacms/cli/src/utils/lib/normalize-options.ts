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
  console.log('recursiveResolve -> alias', alias)
  const result: Record<string, string> = {}

  for (const [k, v] of Object.entries(alias)) {
    if (fs.statSync(v).isDirectory()) {
      fs.readdirSync(v).forEach((fileOrDir) => {
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
  console.log('where am i now ')
  const resolvedAlias = recursiveResolve(alias, cwd)
  const shouldSkipThisPlugin =
    options.skip ?? !Object.keys(resolvedAlias).length

  return {
    alias: resolvedAlias,
    skip: shouldSkipThisPlugin,
    cwd,
  }
}
