import { MdOutlinePhotoLibrary } from 'react-icons/md'
import { createScreen } from '@/react-screens'
import { MediaPicker } from '@/components/media/media-manager'

export const MediaManagerScreenPlugin = createScreen({
  name: 'Media Manager',
  Component: MediaPicker,
  Icon: MdOutlinePhotoLibrary,
  layout: 'fullscreen',
  props: {
    allowDelete: true,
  },
})
