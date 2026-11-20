import { definePlugin } from '../../../core/plugin';
import { OBJECT_FIELD_TYPE } from './object-field.schema';

export const objectFieldPlugin = definePlugin({
  name: 'tina:field:object',
  provides: ['field'],
  field: {
    type: OBJECT_FIELD_TYPE,
    contractVersion: 1,
    // Storage drops unset subfields, so a stored `{}` is a present object.
    stored: { isEmpty: (value) => value == null, childrenWhenAbsent: true },
  },
  client: () => import('./object-field.client'),
});

export default objectFieldPlugin;
