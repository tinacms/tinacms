import { isRecord } from '../../utils/is-record';
import type { CollectionSchema, TinaDocument } from '../schema/types';
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

// Component props, image alt text and link URLs sit outside `children`, so
// reading only the text leaves leaves them out.
const collectText = (node: unknown, out: string[]): void => {
  if (isElement(node)) {
    const breaksBlocks = BLOCK_PARENTS.has(String(node.type));
    for (const child of node.children as unknown[]) {
      collectText(child, out);
      if (breaksBlocks && isElement(child)) out.push('\n');
    }
    return;
  }
  if (isRecord(node) && typeof node.text === 'string') out.push(node.text);
};

const textOf = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (isRecord(value) && value.type === 'root') {
    const out: string[] = [];
    collectText(value, out);
    return out.join('');
  }
  return '';
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
    const text = textOf(document[name]).trim();
    if (text.length > 0) searchable.push({ name, weight, text });
  }
  return { ref: { collection: collection.name, path }, fields: searchable };
};
