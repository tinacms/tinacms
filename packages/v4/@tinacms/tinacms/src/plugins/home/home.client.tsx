import { HomeIcon } from 'lucide-react';
import { defineClientPlugin } from '../../client';
import { HomeScreen } from './home-screen';
import { HOME_SCREEN_NAME } from './home.plugin';

export default defineClientPlugin({
  screens: [{ name: HOME_SCREEN_NAME, label: 'Home', component: HomeScreen }],
  slots: {
    globalNav: [
      {
        label: 'Home',
        icon: HomeIcon,
        target: { kind: 'screen', screen: HOME_SCREEN_NAME },
      },
    ],
  },
});
