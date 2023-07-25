import { useCMS as useBaseCMS } from '@/react-core'
import { TinaCMS } from '@/tina-cms'

export { ERROR_MISSING_CMS, CMSContext } from '@/react-core'

export function useCMS(): TinaCMS {
  return useBaseCMS() as TinaCMS
}
