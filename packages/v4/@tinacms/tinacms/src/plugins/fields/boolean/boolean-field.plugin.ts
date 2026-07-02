import { definePlugin } from '../../../core/plugin';

export const booleanFieldPlugin = definePlugin({
  name: 'tina:field:boolean',
  provides: ['field'],
  client: () => import('./boolean-field.client'),
});

export default booleanFieldPlugin;
