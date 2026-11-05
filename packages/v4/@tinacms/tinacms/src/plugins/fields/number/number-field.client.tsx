import { defineClientPlugin } from '../../../client';
import {
  type NumberFieldSchema,
  numberSchema,
  toNumber,
} from './number-field.schema';
import { limitOf } from './number-field.step';
import { NumberField } from './number-field.ui';

export default defineClientPlugin({
  field: {
    Component: NumberField,
    metadata: {
      layout: 'inline',
      inlineBox: (node) => ({
        type: 'number',
        min: limitOf(node, 'min'),
        max: limitOf(node, 'max'),
        step: (node as NumberFieldSchema).step,
      }),
    },
    schema: numberSchema,
    // The editor holds a string, so a blank or whitespace input is empty.
    isEmpty: (value) => toNumber(value) === undefined,
    // The editor holds a string, so `min` and `max` compare the number it
    // means, not its length.
    measure: (value) => {
      const parsed = toNumber(value);
      return typeof parsed === 'number' && Number.isFinite(parsed)
        ? { amount: parsed }
        : null;
    },
    parse: (stored) => (stored == null ? undefined : String(stored)),
    serialize: (value) => Number(value),
  },
});
