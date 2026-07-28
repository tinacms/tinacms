import { defineClientPlugin } from '../../../client';
import { astToMarkdown, markdownToAst } from './rich-text-field.markdown';
import {
  RICH_TEXT_FIELD_TYPE,
  type RichTextAst,
  richTextSchema,
} from './rich-text-field.schema';
import { RichTextField } from './rich-text-field.ui';

export default defineClientPlugin({
  field: {
    type: RICH_TEXT_FIELD_TYPE,
    Component: RichTextField,
    defaultValue: { type: 'root', children: [] } satisfies RichTextAst,
    // A body is its own section, not something to sit beside a text input.
    metadata: { layout: 'block' },
    schema: richTextSchema,
    // The document stores markdown (the format adapter hands the body over as a
    // string); the editor works on the mdx AST. @tinacms/mdx is the only thing
    // that knows how to cross that gap, and it's the same parser v3 used, so v3
    // content opens unchanged.
    parse: (stored, node) => markdownToAst(stored, node),
    serialize: (value, node) => astToMarkdown(value as RichTextAst, node),
  },
});
