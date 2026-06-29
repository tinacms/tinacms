import { definePlugin } from '../../../core/plugin';

export const stringFieldPlugin = definePlugin({
  name: 'tina:field:string',
  provides: ['field'],
  client: () => import('./string-field.client'),
});

export default stringFieldPlugin;
