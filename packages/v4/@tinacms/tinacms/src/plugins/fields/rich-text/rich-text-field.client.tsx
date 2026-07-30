import { defineClientPlugin } from '../../../client';
import { EMPTY_RICH_TEXT, type RichTextValue } from './rich-text-codec';
import { codecFor, writesSameSource } from './rich-text-codecs';
import { richTextSchema } from './rich-text-field.schema';
import { RichTextField } from './rich-text-field.ui';

export default defineClientPlugin({
  field: {
    Component: RichTextField,
    defaultValue: EMPTY_RICH_TEXT,
    metadata: { layout: 'block', labelable: false },
    schema: richTextSchema,
    parse: (stored, node, context) =>
      codecFor(node, context).parse(
        typeof stored === 'string' ? stored : '',
        node
      ),
    serialize: (value, node, context) =>
      codecFor(node, context).serialize(
        value == null ? EMPTY_RICH_TEXT : (value as RichTextValue),
        node
      ),
    isEqual: writesSameSource,
  },
});
