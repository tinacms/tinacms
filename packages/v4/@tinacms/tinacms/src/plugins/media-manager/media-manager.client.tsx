import { defineClientPlugin } from '../../client';
import { ImageIcon } from 'lucide-react';
import { MediaPane } from './media-pane';
import { MEDIA_SCREEN_NAME } from './media-manager.plugin';

export default defineClientPlugin({
  screens: [{ name: MEDIA_SCREEN_NAME, label: 'Media', component: MediaPane }],
  slots: {
    globalNav: [
      {
        label: 'Media',
        icon: ImageIcon,
        target: { kind: 'screen', screen: MEDIA_SCREEN_NAME },
      },
    ],
  },
});
