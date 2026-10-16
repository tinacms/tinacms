import { defineClientPlugin } from '../../../client';
import { booleanSchema } from './boolean-field.schema';
import { BooleanField } from './boolean-field.ui';

export default defineClientPlugin({
  field: {
    Component: BooleanField,
    defaultValue: false,
    metadata: { layout: 'inline' },
    schema: booleanSchema,
    // A checkbox always holds a value, so `required` has no effect on it.
    isEmpty: () => false,
  },
});
