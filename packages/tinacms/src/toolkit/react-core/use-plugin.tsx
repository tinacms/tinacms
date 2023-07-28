import * as React from 'react'
import { Plugin } from '@toolkit/core'
import { useCMS } from './use-cms'

/**
 * A React Hook for adding Plugins to the CMS.
 *
 * @alias usePlugins
 */
export const usePlugin = usePlugins

/**
 *
 * @alias usePlugin
 */
export function usePlugins(plugins?: Plugin | Plugin[]) {
  const cms = useCMS()

  let pluginArray: (Plugin | undefined)[]

  if (Array.isArray(plugins)) {
    pluginArray = plugins
  } else {
    pluginArray = [plugins]
  }

  React.useEffect(() => {
    pluginArray.forEach((plugin) => {
      if (plugin) {
        cms.plugins.add(plugin)
      }
    })

    return () => {
      pluginArray.forEach((plugin) => {
        if (plugin) {
          cms.plugins.remove(plugin)
        }
      })
    }
  }, [cms.plugins, ...pluginArray])
}
