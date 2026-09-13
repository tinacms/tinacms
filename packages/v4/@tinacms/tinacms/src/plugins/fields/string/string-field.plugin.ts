import { definePlugin } from '../../../core/plugin';
import { STRING_FIELD_TYPE } from './string-field.schema';

export const stringFieldPlugin = definePlugin({
  name: 'tina:field:string',
  provides: ['field'],
  field: { type: STRING_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./string-field.client'),
});

export default stringFieldPlugin;
