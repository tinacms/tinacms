import { definePlugin } from '../../../core/plugin';
import { RICH_TEXT_FIELD_TYPE } from './rich-text-field.schema';

export const richTextFieldPlugin = definePlugin({
  name: 'tina:field:rich-text',
  provides: ['field'],
  field: { type: RICH_TEXT_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./rich-text-field.client'),
});

export default richTextFieldPlugin;
