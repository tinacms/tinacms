import matter from 'gray-matter';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';

export type CollectionFormat = NonNullable<CollectionSchema['format']>;

// Format adapters (ADR-017 §5): the only serialization layer — document JSON ↔ file.
// `serialize` takes the file's previous raw contents and merges the saved value OVER
// what's already there, so frontmatter keys the schema doesn't know about and the
// markdown body survive every save verbatim (CONTEXT.md Unknown field). That
// round-trip guarantee is what makes pointing v4 at an existing v3 content folder
// safe — same gray-matter format v3 writes, nothing gets dropped.
export interface FormatAdapter {
  extension: string;
  parse(raw: string): TinaDocument;
  serialize(document: TinaDocument, previousRaw?: string): string;
}

// Frontmatter is the document; the body stays out of it until a rich-text `isBody`
// field exists to own it — preserved via previousRaw meanwhile.
const markdownAdapter = (extension: string): FormatAdapter => ({
  extension,
  parse: (raw) => matter(raw).data,
  serialize: (document, previousRaw) => {
    const previous = matter(previousRaw ?? '');
    return matter.stringify(previous.content, {
      ...previous.data,
      ...document,
    });
  },
});

const jsonAdapter: FormatAdapter = {
  extension: '.json',
  parse: (raw) => JSON.parse(raw),
  serialize: (document, previousRaw) => {
    const previous = previousRaw ? JSON.parse(previousRaw) : {};
    return `${JSON.stringify({ ...previous, ...document }, null, 2)}\n`;
  },
};

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
