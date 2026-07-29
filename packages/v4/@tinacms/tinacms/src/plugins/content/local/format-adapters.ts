import {
  type CollectionFormat,
  CollectionSchema,
  FORMAT_EXTENSIONS,
  TinaDocument,
} from '../../../core/schema/types';
import { jsonAdapter } from './json.adapter';
import { markdownAdapter } from './markdown.adapter';

export type { CollectionFormat };

// The format adapters (ADR-017 §5). They are the only serialization layer, and they
// convert between the document JSON and the file. The `serialize` function takes the
// previous contents of the file, and merges the saved value over them. A frontmatter key
// that the schema does not know, and the markdown body, therefore survive every save
// without a change. Refer to the unknown field in CONTEXT.md. That guarantee makes it
// safe to point v4 at a v3 content folder. It writes the same gray-matter format that v3
// writes, and it drops nothing.
// The `bodyField` is the name of the `isBody` field of the collection, when it has one.
// The body then crosses as the value of that field, and does not stay untouched. A
// format with no body, such as JSON, ignores it.
export interface FormatAdapter {
  extension: string;
  parse(raw: string, bodyField?: string): TinaDocument;
  serialize(
    document: TinaDocument,
    previousRaw?: string,
    bodyField?: string
  ): string;
}

// The extensions come from FORMAT_EXTENSIONS in core/schema/types.ts, so this file and
// the rich-text codecs cannot disagree about the name of a format on disk.
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

// The formats of a collection, always as a list. `format: 'mdx'` and `format: ['mdx']`
// describe the same collection. The order comes from the schema, and the first entry is
// the primary format. Refer to types.ts.
export const collectionFormats = (
  format: CollectionSchema['format']
): CollectionFormat[] => (Array.isArray(format) ? format : [format]);

// The adapters that a collection reads and writes with, in schema order. Two formats
// with the same extension have no correct answer, because the adapter that won the
// lookup would parse the files of the other one. This therefore fails at construction,
// and not at the first save.
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

// The adapter that owns a file. The extension of the document decides, and the
// collection does not. This lets one collection hold more than one format.
export const adapterForPath = (
  adapters: FormatAdapter[],
  filePath: string
): FormatAdapter | undefined =>
  adapters.find((adapter) => filePath.endsWith(adapter.extension));
