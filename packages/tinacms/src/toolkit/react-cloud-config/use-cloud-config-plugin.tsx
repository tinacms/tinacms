import { usePlugins } from '@toolkit/react-core'
import { useMemo, DependencyList } from 'react'
import { createCloudConfig, CloudConfigOptions } from './cloud-config-plugin'

export function useCloudConfigPlugin(
  options: CloudConfigOptions,
  deps?: DependencyList
) {
  const memo = useMemo(() => {
    return createCloudConfig(options)
  }, deps)

  usePlugins(memo)
}
