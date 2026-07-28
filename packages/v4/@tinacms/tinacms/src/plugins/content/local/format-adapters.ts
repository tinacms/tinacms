import {
  type CollectionFormat,
  CollectionSchema,
  FORMAT_EXTENSIONS,
  TinaDocument,
} from '../../../core/schema/types';
import { jsonAdapter } from './json.adapter';
import { markdownAdapter } from './markdown.adapter';

export type { CollectionFormat };

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

// Extensions come from FORMAT_EXTENSIONS (core/schema/types.ts) so this and the
// rich-text codecs cannot drift apart on what a format is called on disk.
const adapters: Partial<Record<CollectionFormat, FormatAdapter>> = {
  md: markdownAdapter(FORMAT_EXTENSIONS.md),
  mdx: markdownAdapter(FORMAT_EXTENSIONS.mdx),
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

// A collection's formats, always as a list — `format: 'mdx'` and
// `format: ['mdx']` describe the same collection. Order is the schema's:
// formats[0] is the primary (types.ts).
export const collectionFormats = (
  format: CollectionSchema['format']
): CollectionFormat[] => (Array.isArray(format) ? format : [format]);

// The adapters a collection reads and writes with, in schema order. Two formats
// resolving to the same extension has no sensible answer — whichever won the
// lookup would parse the other's files — so it fails here, at construction,
// rather than on someone's first save.
export const formatAdaptersFor = (
  format: CollectionSchema['format'],
  overrides?: Partial<Record<CollectionFormat, FormatAdapter>>
): FormatAdapter[] => {
  const formats = collectionFormats(format);
  if (formats.length === 0) {
    throw new Error('A collection needs at least one `format`.');
  }
  const resolved = formats.map((each) => formatAdapterFor(each, overrides));
  const extensions = new Set(resolved.map((adapter) => adapter.extension));
  if (extensions.size !== resolved.length) {
    throw new Error(
      `Formats ${formats.join(', ')} resolve to duplicate extensions — a collection's formats must map to distinct file extensions.`
    );
  }
  return resolved;
};

// Which adapter owns this file. The document's extension decides, not the
// collection — that is what lets one collection hold mixed formats.
export const adapterForPath = (
  adapters: FormatAdapter[],
  filePath: string
): FormatAdapter | undefined =>
  adapters.find((adapter) => filePath.endsWith(adapter.extension));
