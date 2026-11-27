import { definePlugin } from '@tinacms/tinacms';

export const navDemoPlugin = definePlugin({
  name: 'playground:nav-demo',
  client: () => import('./nav-demo.client'),
});
