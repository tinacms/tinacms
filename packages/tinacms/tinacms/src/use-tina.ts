import { useCMS } from '@tinacms/react-tinacms'
import { TinaCMS } from './tina-cms'

export function useTina() {
  return useCMS() as TinaCMS
}
