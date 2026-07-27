import { definePlugin } from '../../../core/plugin';

export const richTextFieldPlugin = definePlugin({
  name: 'tina:field:rich-text',
  provides: ['field'],
  client: () => import('./rich-text-field.client'),
});

export default richTextFieldPlugin;
