import { definePlugin } from '../../../core/plugin';
import { DATETIME_FIELD_TYPE } from './datetime-field.schema';

export const datetimeFieldPlugin = definePlugin({
  name: 'tina:field:datetime',
  provides: ['field'],
  field: { type: DATETIME_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./datetime-field.client'),
});

export default datetimeFieldPlugin;
