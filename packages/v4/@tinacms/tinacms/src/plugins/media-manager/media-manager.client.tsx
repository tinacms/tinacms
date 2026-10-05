import { defineClientPlugin } from '../../client';
import { ImageIcon } from './media-icons';
import { MediaManagerScreen } from './media-manager-screen';
import { MEDIA_SCREEN_NAME } from './media-manager.plugin';

export default defineClientPlugin({
  screens: [
    { name: MEDIA_SCREEN_NAME, label: 'Media', component: MediaManagerScreen },
  ],
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
