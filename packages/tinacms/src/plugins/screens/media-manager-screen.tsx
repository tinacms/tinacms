import { Folder } from '@tinacms/icons'
import { createScreen } from '@tinacms/react-screens'
import { MediaPicker } from '../../components/media-manager'

export const MediaManagerScreenPlugin = createScreen({
  name: 'Media Manager',
  Component: MediaPicker,
  // TODO: New Icon with a landscape
  Icon: Folder,
  layout: 'fullscreen',
  props: {
    allowDelete: true,
  },
})
