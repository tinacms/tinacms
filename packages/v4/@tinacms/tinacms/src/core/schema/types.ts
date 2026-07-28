export interface BaseFieldSchema {
  name: string;
  label?: string;
  required?: boolean;
}

export interface FieldSchema extends BaseFieldSchema {
  type: string;
  // Marks the field that owns the markdown body (v3 content model). The format
  // adapters read and write it as a markdown string; the rich-text field parses
  // that into the mdx AST to edit, and the local GraphQL pipeline serves the
  // same body to the render path as the AST too. Markdown on disk, AST in memory.
  isBody?: boolean;
}

export interface CollectionSchema {
  name: string;
  label?: string;
  path?: string;
  format: 'md' | 'mdx' | 'json' | 'yaml';
  fields: FieldSchema[];
}

// A document is an open bag of field values keyed by field name; value types are
// contributed by plugins and not known statically, so `unknown` is the honest type
// for now. Could be tightened later (derived from a collection's fields).
export type TinaDocument = Record<string, unknown>;
