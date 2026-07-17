export interface BaseFieldSchema {
  name: string;
  label?: string;
  required?: boolean;
}

export interface FieldSchema extends BaseFieldSchema {
  type: string;
  // Marks the field that owns the markdown body (v3 content model). The local
  // GraphQL pipeline serves it as the v3 mdx AST; the form doesn't edit it yet.
  isBody?: boolean;
}

export interface CollectionSchema {
  name: string;
  label?: string;
  path?: string;
  format?: 'md' | 'mdx' | 'json' | 'yaml';
  fields: FieldSchema[];
}

// A document is an open bag of field values keyed by field name; value types are
// contributed by plugins and not known statically, so `unknown` is the honest type
// for now. Could be tightened later (derived from a collection's fields).
export type TinaDocument = Record<string, unknown>;
