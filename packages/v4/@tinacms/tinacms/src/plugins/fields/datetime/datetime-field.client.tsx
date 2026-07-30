import { defineClientPlugin } from '../../../client';
import { datetimeSchema } from './datetime-field.schema';
import { DatetimeField } from './datetime-field.ui';

export default defineClientPlugin({
  field: {
    Component: DatetimeField,
    metadata: { layout: 'inline' },
    schema: datetimeSchema,
    parse: (stored) => {
      if (stored instanceof Date) return stored.toISOString();
      return stored == null ? undefined : String(stored);
    },
  },
});
