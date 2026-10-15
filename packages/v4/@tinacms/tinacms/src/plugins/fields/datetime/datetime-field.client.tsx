import { defineClientPlugin } from '../../../client';
import { datetimeSchema } from './datetime-field.schema';
import { DatetimeField } from './datetime-field.ui';

/**
 * The editor value and the stored value use one representation: an ISO 8601
 * string. There is no `serialize` because the editor value is already the
 * stored form. `parse` only makes the `Date` that YAML frontmatter gives into
 * that string.
 */
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
