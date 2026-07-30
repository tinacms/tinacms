export interface BaseFieldSchema {
  name: string;
  label?: string;
  required?: boolean;
}

export interface TemplateFieldSchema extends BaseFieldSchema {
  type?: string;
  templates?: TemplateSchema[];
}

export interface TemplateSchema {
  name: string;
  label?: string;
  key?: string;
  inline?: boolean;
  fields?: TemplateFieldSchema[];
}

export interface FieldSchema extends BaseFieldSchema {
  type: string;
  isBody?: boolean;
  templates?: TemplateSchema[];
}

export const COLLECTION_FORMATS = ['md', 'mdx', 'json', 'yaml'] as const;

export type CollectionFormat = (typeof COLLECTION_FORMATS)[number];

export const FORMAT_EXTENSIONS: Record<CollectionFormat, string> = {
  md: '.md',
  mdx: '.mdx',
  json: '.json',
  yaml: '.yaml',
};

export const formatForPath = (
  documentPath: string
): CollectionFormat | undefined => {
  const lowerPath = documentPath.toLowerCase();
  return COLLECTION_FORMATS.find((format) =>
    lowerPath.endsWith(FORMAT_EXTENSIONS[format])
  );
};

export interface CollectionSchema {
  name: string;
  label?: string;
  path?: string;
  format: CollectionFormat | CollectionFormat[];
  fields: FieldSchema[];
}

export type TinaDocument = Record<string, unknown>;
