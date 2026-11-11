import type { CollectionSchema, TinaDocument } from '../schema/types';
import type {
  SearchFields,
  SearchRecord,
  SearchRecordField,
} from './index-contract';

const hasValue = (value: unknown): boolean =>
  value !== undefined && value !== null && value !== '';

/**
 * The record a provider indexes for one saved or read document: each configured
 * field's own value as saved, in the order of `fields`. Turning a value into
 * searchable text is the provider's job. It is always built, even with no
 * values, so a provider replaces a stale entry.
 */
export const buildSearchRecord = (
  collection: CollectionSchema,
  path: string,
  document: TinaDocument,
  fields: SearchFields[string]
): SearchRecord => {
  const searchable: SearchRecordField[] = [];
  for (const [name, weight] of Object.entries(fields)) {
    if (!Object.hasOwn(document, name)) continue;
    const value = document[name];
    if (hasValue(value)) searchable.push({ name, weight, value });
  }
  return { ref: { collection: collection.name, path }, fields: searchable };
};
