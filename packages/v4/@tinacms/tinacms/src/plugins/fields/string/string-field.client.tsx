import { defineClientPlugin } from '../../../client';
import { stringSchema } from './string-field.schema';
import { StringField } from './string-field.ui';

export default defineClientPlugin({
  field: {
    Component: StringField,
    defaultValue: '',
    metadata: { layout: 'inline' },
    schema: stringSchema,
  },
});
