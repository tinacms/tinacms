/**



*/

import * as React from 'react'
import { TinaCMS } from '../tina-cms'
import { CMSContext } from '../react-tinacms/use-cms'

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
  if (!(cms instanceof TinaCMS)) {
    throw new Error(INVALID_CMS_ERROR)
  }
  return <CMSContext.Provider value={cms}>{children}</CMSContext.Provider>
}
