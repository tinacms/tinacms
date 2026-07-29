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
   * Marks the field that holds the markdown body of the file. The body is markdown
   * on disk, and an MDX tree in memory. The format adapter reads and writes the
   * string, and the rich-text field edits the tree.
   */
  isBody?: boolean;
  templates?: TemplateSchema[];
}

export const COLLECTION_FORMATS = ['md', 'mdx', 'json', 'yaml'] as const;

export type CollectionFormat = (typeof COLLECTION_FORMATS)[number];

/**
 * The file extension of each format. It is declared once, because two consumers must
 * agree on it. The format adapters use it to find the adapter for a file. The
 * rich-text codecs use it to find the parser for a body. The record covers the whole
 * union, so a new format does not compile until it names its extension.
 */
export const FORMAT_EXTENSIONS: Record<CollectionFormat, string> = {
  md: '.md',
  mdx: '.mdx',
  json: '.json',
  yaml: '.yaml',
};

/**
 * The format of a document, read from the name of that document. The file decides its
 * format, and the collection does not. One collection can therefore hold more than one
 * format.
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
   * One format, or several formats for a collection with mixed files. An `.mdx`
   * document and a `.json` document can share a list and a form. The extension of
   * each file names the adapter that reads it.
   *
   * The first entry is the primary format. Today that has one meaning only. The v3
   * GraphQL pipeline reads the primary format and no other, until v4 owns its index.
   * graphql-pipeline.ts warns about the other formats. The primary format is not yet
   * the format of a new document. The data layer writes the path that it receives, so
   * the caller chooses the extension. The primary format becomes the default when code
   * above the data layer starts to name new files.
   */
  format: CollectionFormat | CollectionFormat[];
  fields: FieldSchema[];
}

/**
 * An open set of field values, keyed by field name. The plugins supply the value
 * types, and no static type can describe them. The type is therefore `unknown`.
 */
export type TinaDocument = Record<string, unknown>;
