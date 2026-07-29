import { defineClientPlugin } from '../../../client';
import { datetimeSchema } from './datetime-field.schema';
import { DatetimeField } from './datetime-field.ui';

export default defineClientPlugin({
  field: {
    Component: DatetimeField,
    // No defaultValue: empty stays `undefined`, so an untouched field writes nothing.
    metadata: { layout: 'inline' },
    schema: datetimeSchema,
    // A YAML frontmatter date arrives as a Date (js-yaml parses an unquoted date).
    // Everything else stays the string that the file holds, so an untouched document
    // digests back unchanged.
    parse: (stored) => {
      if (stored instanceof Date) return stored.toISOString();
      return stored == null ? undefined : String(stored);
    },
  },
});
