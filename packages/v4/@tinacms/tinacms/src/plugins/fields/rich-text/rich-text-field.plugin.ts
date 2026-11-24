import { definePlugin } from '../../../core/plugin';
import { richTextStored } from '../core-stored-helpers';
import { RICH_TEXT_FIELD_TYPE } from './rich-text-field.schema';

export const richTextFieldPlugin = definePlugin({
  name: 'tina:field:rich-text',
  provides: ['field'],
  field: {
    type: RICH_TEXT_FIELD_TYPE,
    contractVersion: 1,
    stored: richTextStored,
  },
  client: () => import('./rich-text-field.client'),
});

export default richTextFieldPlugin;
