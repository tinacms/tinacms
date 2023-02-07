/**



*/
import { usePlugins } from '../react-core'
import { useMemo, DependencyList } from 'react'
import { createScreen, ScreenOptions } from './screen-plugin'

export function useScreenPlugin(options: ScreenOptions, deps?: DependencyList) {
  const memo = useMemo(() => {
    return createScreen(options)
  }, deps)

  usePlugins(memo)
}
