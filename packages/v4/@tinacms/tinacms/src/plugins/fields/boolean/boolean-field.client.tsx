import { defineClientPlugin } from '../../../client';
import { booleanSchema } from './boolean-field.schema';
import { BooleanField } from './boolean-field.ui';

export default defineClientPlugin({
  field: {
    Component: BooleanField,
    defaultValue: false,
    metadata: { layout: 'inline' },
    schema: booleanSchema,
  },
});
