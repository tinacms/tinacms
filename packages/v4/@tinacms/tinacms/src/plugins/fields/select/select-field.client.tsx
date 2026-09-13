import { defineClientPlugin } from '../../../client';
import { selectSchema } from './select-field.schema';
import { SelectField } from './select-field.ui';

export default defineClientPlugin({
  field: {
    Component: SelectField,
    metadata: { layout: 'inline' },
    schema: selectSchema,
    parse: (stored: string) => (stored == null ? undefined : stored),
    serialize: (value: string | null) => value ?? undefined,
  },
});
