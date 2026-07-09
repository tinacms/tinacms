import { defineClientPlugin } from '../../../client';
import { BOOLEAN_FIELD_TYPE, booleanSchema } from './boolean-field.schema';
import { BooleanField } from './boolean-field.ui';

export default defineClientPlugin({
  field: {
    type: BOOLEAN_FIELD_TYPE,
    Component: BooleanField,
    defaultValue: false,
    metadata: { layout: 'inline' },
    schema: booleanSchema,
  },
});
