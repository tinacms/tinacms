import { definePlugin } from '../../../core/plugin';
import { SELECT_FIELD_TYPE } from './select-field.schema';

export const selectFieldPlugin = definePlugin({
  name: 'tina:field:select',
  provides: ['field'],
  field: { type: SELECT_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./select-field.client'),
});

export default selectFieldPlugin;
