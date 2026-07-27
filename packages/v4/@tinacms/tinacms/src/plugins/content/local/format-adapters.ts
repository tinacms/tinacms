import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { jsonAdapter } from './json.adapter';
import { markdownAdapter } from './markdown.adapter';

export type CollectionFormat = NonNullable<CollectionSchema['format']>;

// Format adapters (ADR-017 §5): the only serialization layer — document JSON ↔ file.
// `serialize` takes the file's previous raw contents and merges the saved value OVER
// what's already there, so frontmatter keys the schema doesn't know about and the
// markdown body survive every save verbatim (CONTEXT.md Unknown field). That
// round-trip guarantee is what makes pointing v4 at an existing v3 content folder
// safe — same gray-matter format v3 writes, nothing gets dropped.
// `bodyField` is the collection's `isBody` field name, when it has one: the body
// crosses as that field's value instead of being preserved untouched. Formats with
// no body concept (json) ignore it.
export interface FormatAdapter {
  extension: string;
  parse(raw: string, bodyField?: string): TinaDocument;
  serialize(
    document: TinaDocument,
    previousRaw?: string,
    bodyField?: string
  ): string;
}

const adapters: Partial<Record<CollectionFormat, FormatAdapter>> = {
  md: markdownAdapter('.md'),
  mdx: markdownAdapter('.mdx'),
  json: jsonAdapter,
};

export const formatAdapterFor = (
  format: CollectionFormat,
  overrides?: Partial<Record<CollectionFormat, FormatAdapter>>
): FormatAdapter => {
  const registry = { ...adapters, ...overrides };
  const adapter = registry[format];
  if (!adapter) {
    throw new Error(
      `No format adapter for "${format}" — supported: ${Object.keys(registry).join(', ')}.`
    );
  }
  return adapter;
};
