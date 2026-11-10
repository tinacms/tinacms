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

// Block tags separate words (CommonMark HTML block type 6, plus br and pre);
// any other tag joins the text around it, so `H<sub>2</sub>O` reads `H2O`.
const BLOCK_TAGS: ReadonlySet<string> = new Set(
  `address article aside base basefont blockquote body caption center col colgroup
  dd details dialog dir div dl dt fieldset figcaption figure footer form frame
  frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu
  menuitem nav noframes ol optgroup option p param search section summary table
  tbody td tfoot th thead title tr track ul br pre script style`.split(/\s+/)
);

// A tag runs to the first `>` outside a quoted attribute value. With no such
// `>`, the `<` is visible text and stays.
const TAG_BODY = `(?:[^>"']|"[^"]*"|'[^']*')*`;
const HIDDEN_CONTENT = new RegExp(
  `<!--[\\s\\S]*?(?:-->|$)|<(script|style)(?![\\w-])${TAG_BODY}>[\\s\\S]*?(?:<\\/\\1(?![\\w-])${TAG_BODY}>|$)`,
  'gi'
);
const TAG = new RegExp(`<(?:(\\/?[a-z][\\w-]*)|!)${TAG_BODY}>`, 'gi');

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const decodeEntities = (text: string): string =>
  text.replace(
    /&(?:#(\d+)|#x([\da-f]+)|(amp|lt|gt|quot|apos|nbsp));/gi,
    (entity, decimal, hex, name) => {
      if (name) return NAMED_ENTITIES[name.toLowerCase()];
      const code = decimal ? Number(decimal) : Number.parseInt(hex, 16);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    }
  );

// Visible text of raw HTML: comments, scripts and styles drop out with their
// contents, tags drop out with their attribute values, then entities decode.
const htmlText = (source: string): string =>
  decodeEntities(
    source
      .replace(HIDDEN_CONTENT, '')
      .replace(TAG, (_tag, name: string | undefined) =>
        name && BLOCK_TAGS.has(name.replace('/', '').toLowerCase()) ? ' ' : ''
      )
  );

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
    .map((line) => line.replace(/[ \t\u00a0]+/g, ' ').trim())
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
