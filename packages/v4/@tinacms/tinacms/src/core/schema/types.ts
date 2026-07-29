export interface BaseFieldSchema {
  name: string;
  label?: string;
  required?: boolean;
}

/**
 * A field declared inside a template. Its `type` is optional, because a template is
 * author-written config and the editor carries a template's fields through to the
 * nested-form panel without reading them.
 */
export interface TemplateFieldSchema extends BaseFieldSchema {
  type?: string;
  templates?: TemplateSchema[];
}

/**
 * One shape that a field's value can take, for a field that offers several. A rich-text
 * embed is the only case today.
 *
 * It is declared here, and not on the rich-text field alone, because three consumers
 * read it off a plain schema node: the compile step gates and pins the field types
 * nested inside it, the v3 GraphQL pipeline hands it to the v3 schema builder, and the
 * editor renders the embed. The editor's own MdxTemplate is the narrower of the two, and
 * satisfies this structurally.
 */
export interface TemplateSchema {
  name: string;
  label?: string;
  key?: string;
  inline?: boolean;
  fields?: TemplateFieldSchema[];
}

export interface FieldSchema extends BaseFieldSchema {
  type: string;
  /**
   * Marks the field that owns the file's markdown body. Markdown on disk, mdx
   * AST in memory — the format adapter reads and writes the string, the
   * rich-text field edits the AST.
   */
  isBody?: boolean;
  templates?: TemplateSchema[];
}

export const COLLECTION_FORMATS = ['md', 'mdx', 'json', 'yaml'] as const;

export type CollectionFormat = (typeof COLLECTION_FORMATS)[number];

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
  COLLECTION_FORMATS.find((format) =>
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
