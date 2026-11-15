import { definePlugin } from '../../core/plugin';

export const HOME_SCREEN_NAME = 'home';

export default definePlugin({
  name: 'tina:home:core',
  client: () => import('./home.client'),
});
