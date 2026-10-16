import { definePlugin } from '../../../core/plugin';
import { BOOLEAN_FIELD_TYPE } from './boolean-field.schema';

export const booleanFieldPlugin = definePlugin({
  name: 'tina:field:boolean',
  provides: ['field'],
  field: { type: BOOLEAN_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./boolean-field.client'),
});

export default booleanFieldPlugin;
