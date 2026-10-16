import { type PluginManifest, definePlugin } from '../../core/plugin';

export const MEDIA_SCREEN_NAME = 'media';

export const mediaManagerPlugin = (): PluginManifest =>
  definePlugin({
    name: 'tina:media-manager',
    dependsOn: ['media'],
    client: () => import('./media-manager.client'),
  });
