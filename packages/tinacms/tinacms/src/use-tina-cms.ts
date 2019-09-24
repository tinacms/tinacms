import { useCMS } from '@tinacms/react-tinacms'
import { TinaCMS } from './tina-cms'

export function useTinaCMS() {
  return useCMS() as TinaCMS
}
