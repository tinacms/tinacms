import { defineClientPlugin } from '../../../client';
import { numberSchema } from './number-field.schema';
import { NumberField } from './number-field.ui';

export default defineClientPlugin({
  field: {
    Component: NumberField,
    metadata: { layout: 'inline' },
    schema: numberSchema,
    parse: (stored) => (stored == null ? undefined : String(stored)),
    serialize: (value) => Number(value),
  },
});
