import { Plugin } from '@tinacms/core'
import { usePlugin } from './use-plugin'
import * as React from 'react'

/**
 * A Higher-Order-Component for adding Plugins to the CMS.
 *
 * @param Component A React Component
 * @param plugin Plugin
 */
export function withPlugin(Component: any, plugin: Plugin) {
  return (props: any) => {
    usePlugin(plugin)
    return <Component {...props} />
  }
}
