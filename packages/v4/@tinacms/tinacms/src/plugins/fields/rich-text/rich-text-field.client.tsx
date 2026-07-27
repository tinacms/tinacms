import { defineClientPlugin } from '../../../client';
import { RICH_TEXT_FIELD_TYPE, richTextSchema } from './rich-text-field.schema';
import { RichTextField } from './rich-text-field.ui';

export default defineClientPlugin({
  field: {
    type: RICH_TEXT_FIELD_TYPE,
    Component: RichTextField,
    defaultValue: '',
    // A body is its own section, not something to sit beside a text input.
    metadata: { layout: 'block' },
    schema: richTextSchema,
    // No parse/serialize: the editor value and the stored value are both the raw
    // markdown source. A WYSIWYG editor adds the pair here (markdown <-> AST) and
    // swaps the component; nothing outside this folder moves.
  },
});
