/**



*/

import { useCMS as useBaseCMS } from '../packages/react-core'
import { TinaCMS } from '../tina-cms'

export { ERROR_MISSING_CMS, CMSContext } from '../packages/react-core'

export function useCMS(): TinaCMS {
  return useBaseCMS() as TinaCMS
}
