import { INVALID_MARKDOWN_TYPE } from '@tinacms/rich-text';
import { codecFor } from '../../plugins/fields/rich-text/rich-text-codecs';
import { RICH_TEXT_FIELD_TYPE } from '../../plugins/fields/rich-text/rich-text-field.type';
import { isRecord } from '../../utils/is-record';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../schema/types';
import type {
  SearchFields,
  SearchRecord,
  SearchRecordField,
} from './index-contract';

// A newline follows each element child of these, so blocks stay apart.
const BLOCK_PARENTS: ReadonlySet<string> = new Set([
  'root',
  'ul',
  'ol',
  'li',
  'blockquote',
  'td',
  'th',
]);

const isElement = (node: unknown): node is Record<string, unknown> =>
  isRecord(node) && Array.isArray(node.children);

const isRoot = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && value.type === 'root';

const HTML_NODE_TYPES: ReadonlySet<string> = new Set(['html', 'html_inline']);

// Visible text of raw HTML: comments and tags drop out, attribute values with them.
const htmlText = (source: string): string =>
  source.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ');

// A component's visible text is its `children` prop. Its other props, image alt
// text and link URLs sit outside the text leaves, so they stay out.
const collectText = (node: unknown, out: string[]): void => {
  if (isElement(node)) {
    if (
      typeof node.value === 'string' &&
      HTML_NODE_TYPES.has(String(node.type))
    ) {
      out.push(htmlText(node.value));
      return;
    }
    const slot = isRecord(node.props) ? node.props.children : undefined;
    if (isRoot(slot)) {
      const inner: string[] = [];
      collectText(slot, inner);
      const text = inner.join('');
      out.push(
        node.type === 'mdxJsxTextElement'
          ? text.replace(/\s*\n\s*/g, ' ')
          : text
      );
    }
    const breaksBlocks = BLOCK_PARENTS.has(String(node.type));
    for (const child of node.children as unknown[]) {
      collectText(child, out);
      if (breaksBlocks && isElement(child)) out.push('\n');
    }
    return;
  }
  if (isRecord(node) && typeof node.text === 'string') out.push(node.text);
};

const tidy = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');

const treeOf = (
  value: unknown,
  field: FieldSchema,
  documentPath: string
): unknown => {
  if (typeof value !== 'string') return value;
  // A saved or stored rich-text value is source text (MDX or markdown). Reading
  // it as text would index component props, image alt text and URLs.
  const tree = codecFor(field, { documentPath }).parse(value, field);
  if (tree.children[0]?.type === INVALID_MARKDOWN_TYPE) {
    throw new Error(
      `The rich-text field "${field.name}" of "${documentPath}" does not parse, so search cannot read its text.`
    );
  }
  return tree;
};

const textOf = (
  value: unknown,
  field: FieldSchema | undefined,
  documentPath: string
): string => {
  if (field?.type === RICH_TEXT_FIELD_TYPE) {
    const tree = treeOf(value, field, documentPath);
    if (!isRoot(tree)) return '';
    const out: string[] = [];
    collectText(tree, out);
    return tidy(out.join(''));
  }
  return typeof value === 'string' ? value : '';
};

/**
 * The record a provider indexes for one saved or read document. It is always
 * built, even with no text, so a provider replaces a stale entry.
 */
export const buildSearchRecord = (
  collection: CollectionSchema,
  path: string,
  document: TinaDocument,
  fields: SearchFields[string]
): SearchRecord => {
  const searchable: SearchRecordField[] = [];
  for (const [name, weight] of Object.entries(fields)) {
    const field = collection.fields.find(
      (candidate) => candidate.name === name
    );
    const text = textOf(document[name], field, path).trim();
    if (text.length > 0) searchable.push({ name, weight, text });
  }
  return { ref: { collection: collection.name, path }, fields: searchable };
};
