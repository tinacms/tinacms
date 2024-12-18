import { normalizeOption } from './normalize-options'

import type { Plugin } from 'esbuild'
import type { AliasPathOptions } from './normalize-options'

const pluginName = 'plugin:alias-path'

export function escapeNamespace(keys: string[]) {
  return new RegExp(
    `^${keys
      .map((str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')}$`
  )
}

export const aliasPath = (options: AliasPathOptions = {}): Plugin => {
  const { alias, skip } = normalizeOption(options)
  console.log('After query normalization: ', alias)
  console.log('aliasPath -> alias', alias)
  if (skip) {
    return {
      name: pluginName,
      setup() {},
    }
  }

  const escapedNamespace = escapeNamespace(Object.keys(alias))

  return {
    name: pluginName,
    setup(build) {
      build.onResolve({ filter: escapedNamespace }, ({ path: fromPath }) => {
        const replacedPath = alias[fromPath]

        if (!replacedPath) {
          return null
        }

        return {
          path: replacedPath,
        }
      })
    },
  }
}
