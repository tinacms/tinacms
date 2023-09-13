import * as React from 'react'
import { TinaAction, TinaState } from '@toolkit/tina-state'
import { TinaCMS } from '@toolkit/tina-cms'

export const ERROR_MISSING_CMS = `useCMS could not find an instance of CMS`

export const CMSContext = React.createContext<{
  cms: TinaCMS
  dispatch: React.Dispatch<TinaAction>
  state: TinaState
} | null>(null)

export function useCMS(): TinaCMS {
  const { cms, dispatch, state } = React.useContext(CMSContext)

  if (!cms) {
    throw new Error(ERROR_MISSING_CMS)
  }

  const [, setEnabled] = React.useState(cms.enabled)

  // Attach these so they can be reached via `const cms = useCMS()` -> `cms.state`
  cms.dispatch = dispatch
  cms.state = state

  React.useEffect(() => {
    return cms.events.subscribe('cms', () => {
      setEnabled(cms.enabled)
    })
  }, [cms])

  return cms
}
