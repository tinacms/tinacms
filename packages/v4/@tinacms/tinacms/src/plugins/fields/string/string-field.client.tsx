import { defineClientPlugin } from '../../../client';
import { type StringFieldSchema, stringSchema } from './string-field.schema';
import { StringField } from './string-field.ui';

export default defineClientPlugin({
  field: {
    Component: StringField,
    defaultValue: '',
    metadata: {
      layout: 'inline',
      inlineBox: (node) => {
        const { multiline, mono } = node as StringFieldSchema;
        return multiline || mono ? undefined : 'text';
      },
    },
    schema: stringSchema,
  },
});
