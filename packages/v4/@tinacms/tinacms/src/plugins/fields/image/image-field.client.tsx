import { defineClientPlugin } from '../../../client';
import { imageSchema } from './image-field.schema';
import { ImageField } from './image-field.ui';

export default defineClientPlugin({
  field: {
    Component: ImageField,
    metadata: { layout: 'inline', labelable: false },
    schema: imageSchema,
    parse: (stored: string) => (stored == null ? undefined : stored),
    serialize: (value: string | null) => value ?? undefined,
  },
});
