import booleanFieldPlugin from './boolean/boolean-field.plugin';
import { boolean } from './boolean/boolean-field.schema';
import datetimeFieldPlugin from './datetime/datetime-field.plugin';
import { datetime } from './datetime/datetime-field.schema';
import numberFieldPlugin from './number/number-field.plugin';
import { number } from './number/number-field.schema';
import richTextFieldPlugin from './rich-text/rich-text-field.plugin';
import { richText } from './rich-text/rich-text-field.schema';
import stringFieldPlugin from './string/string-field.plugin';
import { string } from './string/string-field.schema';

export const corePlugins = [
  stringFieldPlugin,
  booleanFieldPlugin,
  numberFieldPlugin,
  datetimeFieldPlugin,
  richTextFieldPlugin,
];

// TODO: build `t` from the configured plugin set when defineConfig arrives
export const t = { string, boolean, number, datetime, richText };

export type { BooleanFieldSchema } from './boolean/boolean-field.schema';
export type { DatetimeFieldSchema } from './datetime/datetime-field.schema';
export type { NumberFieldSchema } from './number/number-field.schema';
export type { RichTextFieldSchema } from './rich-text/rich-text-field.schema';
export type { StringFieldSchema } from './string/string-field.schema';
