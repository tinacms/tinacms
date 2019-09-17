import * as React from 'react'
import { Plugin } from '@tinacms/core'
import { useCMS } from './use-cms'

/**
 * A React Hook for adding Plugins to the CMS.
 *
 * @param plugin Plugin
 */
export function usePlugin(plugin: Plugin) {
  let cms = useCMS()
  React.useEffect(() => {
    cms.plugins.add(plugin)
    return () => cms.plugins.remove(plugin)
  }, [plugin])
}
