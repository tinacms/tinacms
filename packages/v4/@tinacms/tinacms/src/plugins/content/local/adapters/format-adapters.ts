import {
  type CollectionFormat,
  type CollectionSchema,
  FORMAT_EXTENSIONS,
  type TinaDocument,
} from '../../../../core/schema/types';
import { jsonAdapter } from './json.adapter';
import { markdownAdapter } from './markdown.adapter';

export type { CollectionFormat };

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

export const collectionFormats = (
  format: CollectionSchema['format']
): CollectionFormat[] => (Array.isArray(format) ? format : [format]);

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

export const adapterForPath = (
  adapters: FormatAdapter[],
  filePath: string
): FormatAdapter | undefined => {
  const lowerPath = filePath.toLowerCase();
  return adapters.find((adapter) =>
    lowerPath.endsWith(adapter.extension.toLowerCase())
  );
};
