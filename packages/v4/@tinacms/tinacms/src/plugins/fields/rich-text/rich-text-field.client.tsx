import { defineClientPlugin } from '../../../client';
import { codecFor } from './mdx-codec';
import { EMPTY_RICH_TEXT, type RichTextValue } from './rich-text-codec';
import { RICH_TEXT_FIELD_TYPE, richTextSchema } from './rich-text-field.schema';
import { RichTextField } from './rich-text-field.ui';

export default defineClientPlugin({
  field: {
    type: RICH_TEXT_FIELD_TYPE,
    Component: RichTextField,
    defaultValue: EMPTY_RICH_TEXT,
    // A body is its own section, not something to sit beside a text input.
    metadata: { layout: 'block' },
    schema: richTextSchema,
    // The document stores whatever the codec writes (markdown by default); the
    // editor works on the document model. The codec is the only thing that knows
    // the format, so changing it changes what lands in the file and nothing else.
    // It is resolved from the document, not just the field, so one collection can
    // hold .md and .mdx documents and each is read with its own parser.
    parse: (stored, node, context) =>
      codecFor(node, context).parse(
        typeof stored === 'string' ? stored : '',
        node
      ),
    serialize: (value, node, context) =>
      codecFor(node, context).serialize(value as RichTextValue, node),
  },
});
