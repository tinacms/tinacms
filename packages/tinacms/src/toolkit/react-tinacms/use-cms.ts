import { useCMS as useBaseCMS } from '@toolkit/react-core'
import { TinaCMS } from '@toolkit/tina-cms'

export { ERROR_MISSING_CMS, CMSContext } from '@toolkit/react-core'

export function useCMS(): TinaCMS {
  return useBaseCMS() as TinaCMS
}
