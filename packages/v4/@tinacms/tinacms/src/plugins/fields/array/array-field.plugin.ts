import { definePlugin } from '../../../core/plugin';
import { ARRAY_FIELD_TYPE } from './array-field.schema';

export const arrayFieldPlugin = definePlugin({
  name: 'tina:field:array',
  provides: ['field'],
  field: { type: ARRAY_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./array-field.client'),
});

export default arrayFieldPlugin;
