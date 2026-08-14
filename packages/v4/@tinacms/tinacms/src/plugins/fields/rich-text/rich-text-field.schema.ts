import { INVALID_MARKDOWN_TYPE } from '@tinacms/rich-text';
import type { ToolbarOverrides } from '@tinacms/rich-text/editor';
import type { MdxTemplate } from '@tinacms/rich-text/editor';
import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const RICH_TEXT_FIELD_TYPE = 'rich-text';

import type {
  RichTextCodec,
  RichTextNode,
  RichTextValue,
} from './rich-text-codec';

export type {
  RichTextCodec,
  RichTextNode,
  RichTextValue,
} from './rich-text-codec';

export interface RichTextFieldSchema extends BaseFieldSchema {
  type: typeof RICH_TEXT_FIELD_TYPE;
  isBody?: boolean;
  templates?: MdxTemplate[];
  overrides?: ToolbarOverrides;
  codec?: RichTextCodec;
}

export const richText = (
  config: Omit<RichTextFieldSchema, 'type'>
): RichTextFieldSchema => ({ ...config, type: RICH_TEXT_FIELD_TYPE });

export const isRichTextFieldSchema = (
  node: FieldSchema
): node is RichTextFieldSchema => node.type === RICH_TEXT_FIELD_TYPE;

const labelOf = (node: BaseFieldSchema): string => node.label ?? node.name;

export const isRichTextValue = (value: unknown): value is RichTextValue => {
  const candidate = value as RichTextValue | null;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    candidate.type === 'root' &&
    Array.isArray(candidate.children)
  );
};

const isUnparsedMarkdown = (value: RichTextValue): boolean =>
  value.children[0]?.type === INVALID_MARKDOWN_TYPE;

const isBlankText = (node: unknown): boolean => {
  if (typeof node !== 'object' || node === null) return false;
  const candidate = node as { type?: unknown; text?: unknown };
  const isText = candidate.type === undefined || candidate.type === 'text';
  return isText && candidate.text === '';
};

const isBlankParagraph = (node: RichTextNode): boolean => {
  if (node.type !== 'p') return false;
  if (!Array.isArray(node.children)) return true;
  return (node.children as unknown[]).every(isBlankText);
};

/**
 * Plate's trailing-block plugin puts one empty paragraph in every body. A
 * length test on `children` therefore passes for a body the writer never
 * typed in.
 */
const hasContent = (value: RichTextValue): boolean =>
  value.children.some((node) => !isBlankParagraph(node));

export const richTextSchema = (node: FieldSchema): ZodType => {
  const ast = z
    .custom<RichTextValue>(
      isRichTextValue,
      `${labelOf(node)} must be rich text`
    )
    .refine((value) => !isUnparsedMarkdown(value), 'Unable to parse rich-text');
  if (node.required) {
    return z.preprocess(
      (value) => value ?? { type: 'root', children: [] },
      ast.refine(hasContent, `${labelOf(node)} is required`)
    );
  }
  return z.preprocess(
    (value) => (value == null ? undefined : value),
    ast.optional()
  );
};
