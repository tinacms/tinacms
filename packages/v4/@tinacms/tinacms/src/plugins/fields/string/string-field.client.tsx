import { defineClientPlugin } from '../../../client';
import { STRING_FIELD_TYPE, stringSchema } from './string-field.schema';
import { StringField } from './string-field.ui';

export default defineClientPlugin({
  field: {
    type: STRING_FIELD_TYPE,
    Component: StringField,
    defaultValue: '',
    metadata: { layout: 'inline' },
    schema: stringSchema,
  },
});
