import { definePlugin } from '../../../core/plugin';
import { objectStored } from '../core-stored-helpers';
import { OBJECT_FIELD_TYPE } from './object-field.schema';

export const objectFieldPlugin = definePlugin({
  name: 'tina:field:object',
  provides: ['field'],
  field: {
    type: OBJECT_FIELD_TYPE,
    contractVersion: 1,
    stored: objectStored,
  },
  client: () => import('./object-field.client'),
});

export default objectFieldPlugin;
