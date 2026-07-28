export interface BaseFieldSchema {
  name: string;
  label?: string;
  required?: boolean;
}

export interface FieldSchema extends BaseFieldSchema {
  type: string;
  /**
   * Marks the field that owns the file's markdown body. Markdown on disk, mdx
   * AST in memory — the format adapter reads and writes the string, the
   * rich-text field edits the AST.
   */
  isBody?: boolean;
}

export type CollectionFormat = 'md' | 'mdx' | 'json' | 'yaml';

/**
 * The file extension each format is stored as. Declared once because two
 * consumers must agree on it: the format adapters (which adapter owns a file)
 * and the rich-text codecs (which parser reads its body). Total over the union,
 * so a new format doesn't compile until it names its extension.
 */
export const FORMAT_EXTENSIONS: Record<CollectionFormat, string> = {
  md: '.md',
  mdx: '.mdx',
  json: '.json',
  yaml: '.yaml',
};

/**
 * Which format a document is stored in, read from its own name — the file
 * decides, not the collection. This is what lets one collection hold mixed
 * formats.
 */
export const formatForPath = (
  documentPath: string
): CollectionFormat | undefined =>
  (Object.keys(FORMAT_EXTENSIONS) as CollectionFormat[]).find((format) =>
    documentPath.endsWith(FORMAT_EXTENSIONS[format])
  );

export interface CollectionSchema {
  name: string;
  label?: string;
  path?: string;
  /**
   * One format, or several for a collection holding mixed files — an `.mdx` and
   * a `.json` document in the same list and the same form, each read by the
   * adapter its extension names.
   *
   * The first entry is the primary format. Today that means exactly one thing:
   * until v4 owns its index, it is the only format the v3 GraphQL pipeline reads
   * (graphql-pipeline.ts warns about the rest). It is *not* yet what a new
   * document gets — the data layer writes whatever path it is handed, so the
   * extension is the caller's choice. It becomes the default when something
   * above the data layer starts naming new files.
   */
  format: CollectionFormat | CollectionFormat[];
  fields: FieldSchema[];
}

/**
 * An open bag of field values keyed by field name. Value types are contributed
 * by plugins and unknowable statically, so `unknown` is the honest type.
 */
export type TinaDocument = Record<string, unknown>;
