import { definePlugin } from '../../../core/plugin';

export const numberFieldPlugin = definePlugin({
  name: 'tina:field:number',
  provides: ['field'],
  client: () => import('./number-field.client'),
});

export default numberFieldPlugin;
