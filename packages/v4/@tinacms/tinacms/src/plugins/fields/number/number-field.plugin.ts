import { definePlugin } from '../../../core/plugin';
import { NUMBER_FIELD_TYPE } from './number-field.schema';

export const numberFieldPlugin = definePlugin({
  name: 'tina:field:number',
  provides: ['field'],
  field: { type: NUMBER_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./number-field.client'),
});

export default numberFieldPlugin;
