import { definePlugin } from '../../../core/plugin';
import { RICH_TEXT_FIELD_TYPE } from './rich-text-field.schema';

export const richTextFieldPlugin = definePlugin({
  name: 'tina:field:rich-text',
  provides: ['field'],
  field: {
    type: RICH_TEXT_FIELD_TYPE,
    contractVersion: 1,
    // The Backend sees the stored source, so no editor value is read here.
    stored: {
      isEmpty: (value) => typeof value !== 'string' || value.trim() === '',
      measure: () => null,
    },
  },
  client: () => import('./rich-text-field.client'),
});

export default richTextFieldPlugin;
