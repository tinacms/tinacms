import { MediaPicker } from '@toolkit/components/media/media-manager';
import { createScreen } from '@toolkit/react-screens';
import { Images } from 'lucide-react';

export const MediaManagerScreenPlugin = createScreen({
  name: 'Media Manager',
  Component: MediaPicker,
  Icon: Images,
  layout: 'fullscreen',
  props: {
    allowDelete: true,
  },
});
