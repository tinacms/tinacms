import { definePlugin } from '../../../core/plugin';
import { OBJECT_FIELD_TYPE } from './object-field.schema';

export const objectFieldPlugin = definePlugin({
  name: 'tina:field:object',
  provides: ['field'],
  field: { type: OBJECT_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./object-field.client'),
});

export default objectFieldPlugin;
