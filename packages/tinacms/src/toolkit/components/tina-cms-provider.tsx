import * as React from 'react'
import { TinaCMS } from '@toolkit/tina-cms'
import { CMSContext } from '@toolkit/react-tinacms/use-cms'
import { initialState, tinaReducer } from '@toolkit/tina-state'

export interface TinaCMSProviderProps {
  cms: TinaCMS
  children?: React.ReactNode
}

export const INVALID_CMS_ERROR =
  'The `cms` prop must be an instance of `TinaCMS`.'

export const TinaCMSProvider: React.FC<TinaCMSProviderProps> = ({
  cms,
  children,
}) => {
  const [state, dispatch] = React.useReducer(tinaReducer, cms, initialState)
  if (!(cms instanceof TinaCMS)) {
    throw new Error(INVALID_CMS_ERROR)
  }
  return (
    <CMSContext.Provider value={{ cms, state, dispatch }}>
      {children}
    </CMSContext.Provider>
  )
}
