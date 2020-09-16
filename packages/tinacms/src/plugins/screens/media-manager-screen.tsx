import { Folder } from '@tinacms/icons'
import { ScreenPlugin } from '@tinacms/react-screens'
import { MediaPicker } from '../../components/media-manager'

export const MediaManagerScreenPlugin: ScreenPlugin = {
  __type: 'screen',
  name: 'Media Manager',
  Component: MediaPicker,
  // TODO: New Icon with a landscape
  Icon: Folder,
  layout: 'fullscreen',
}
