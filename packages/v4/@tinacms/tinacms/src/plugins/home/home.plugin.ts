import { definePlugin } from '../../core/plugin';

export const HOME_SCREEN_NAME = 'home';

/**
 * Home, the screen at `#/`. `corePlugins` includes this, so every project has
 * Home with no setup.
 */
export default definePlugin({
  name: 'tina:home:core',
  client: () => import('./home.client'),
});
