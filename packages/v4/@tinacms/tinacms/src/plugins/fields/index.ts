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

// The built-in field plugins of TinaCMS. The check for a core plugin reads this list,
// and not the name of the plugin.
export const corePlugins = [
  stringFieldPlugin,
  booleanFieldPlugin,
  numberFieldPlugin,
  datetimeFieldPlugin,
  richTextFieldPlugin,
];

// The schema helpers, one for each built-in field. Each one is written out, and none is
// derived in a loop, so `t.string` keeps its static type. They sit beside corePlugins, so
// the built-in set is in one place.
// TODO: build `t` from the configured plugin set when defineConfig arrives (ADR-024). A
// field plugin from a user then joins it, with its types. This list is the built-in
// default until then.
export const t = { string, boolean, number, datetime, richText };

export type { BooleanFieldSchema } from './boolean/boolean-field.schema';
export type { DatetimeFieldSchema } from './datetime/datetime-field.schema';
export type { NumberFieldSchema } from './number/number-field.schema';
export type { RichTextFieldSchema } from './rich-text/rich-text-field.schema';
export type { StringFieldSchema } from './string/string-field.schema';
