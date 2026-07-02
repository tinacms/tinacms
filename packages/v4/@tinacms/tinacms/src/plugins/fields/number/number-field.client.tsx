import { defineClientPlugin } from '../../../client';
import { NUMBER_FIELD_TYPE, numberSchema } from './number-field.schema';
import { NumberField } from './number-field.ui';

export default defineClientPlugin({
  field: {
    type: NUMBER_FIELD_TYPE,
    Component: NumberField,
    // No defaultValue: empty stays `undefined`, so `serialize` only ever sees a number.
    metadata: { layout: 'inline' },
    schema: numberSchema,
    // Normalise a stored `null` to empty rather than "null"/`NaN`.
    parse: (stored) => (stored == null ? undefined : String(stored)),
    serialize: (value) => Number(value),
  },
});
