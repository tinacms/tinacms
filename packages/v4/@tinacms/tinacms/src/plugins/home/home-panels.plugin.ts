import { definePlugin } from '../../core/plugin';

/**
 * The panels Home shows by default. `corePlugins` includes this, so Home has
 * them with no setup.
 */
export default definePlugin({
  name: 'tina:home:core',
  client: () => import('./home-panels.client'),
});
