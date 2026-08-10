import type { FieldSchema } from '../../../core/schema/types';

export {
  EMPTY_RICH_TEXT,
  type RichTextNode,
  type RichTextValue,
} from '@tinacms/rich-text';
import type { RichTextValue } from '@tinacms/rich-text';

export interface RichTextCodec {
  parse(source: string, node: FieldSchema): RichTextValue;
  serialize(value: RichTextValue, node: FieldSchema): string;
}

export class RichTextSerializeError extends Error {
  constructor(cause: unknown) {
    super('The codec cannot write this rich-text value.', { cause });
    this.name = 'RichTextSerializeError';
  }
}
