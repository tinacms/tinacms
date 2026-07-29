import { defineClientPlugin } from '../../../client';
import { codecFor } from './mdx-codec';
import { EMPTY_RICH_TEXT, type RichTextValue } from './rich-text-codec';
import { richTextSchema } from './rich-text-field.schema';
import { RichTextField } from './rich-text-field.ui';

export default defineClientPlugin({
  field: {
    Component: RichTextField,
    defaultValue: EMPTY_RICH_TEXT,
    // A body is its own section. It does not sit beside a text input.
    // A contenteditable is not a labelable element, so a host's `for` cannot reach
    // it; the editor carries its own accessible name.
    metadata: { layout: 'block', labelable: false },
    schema: richTextSchema,
    // The document holds what the codec writes, which is markdown by default. The
    // editor works on the document model. The codec is the only part that knows the
    // format, so a new codec changes the contents of the file and nothing else. The
    // codec resolves from the document, and not from the field alone, so one
    // collection can hold .md and .mdx documents, each read with its own parser.
    parse: (stored, node, context) =>
      codecFor(node, context).parse(
        typeof stored === 'string' ? stored : '',
        node
      ),
    serialize: (value, node, context) =>
      codecFor(node, context).serialize(value as RichTextValue, node),
  },
});
