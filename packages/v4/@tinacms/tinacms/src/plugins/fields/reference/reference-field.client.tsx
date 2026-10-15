import { defineClientPlugin } from '../../../client';
import { referenceSchema } from './reference-field.schema';
import { ReferenceField } from './reference-field.ui';

export default defineClientPlugin({
  field: {
    Component: ReferenceField,
    metadata: { layout: 'inline' },
    schema: referenceSchema,
    parse: (stored: string) => (stored == null ? undefined : stored),
    serialize: (value: string | null) => value ?? undefined,
  },
});
