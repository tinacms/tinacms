import type { JsonValue } from '../json';

/**
 * A rule attached to one field, by the name a plugin registered it under.
 *
 * `args` configures the rule and is passed to its factory, so it holds plain
 * JSON and never a function: `compileSchema` writes this entry into
 * `tina-lock.json`. The build fails on a name no installed plugin registers.
 *
 * Prefer a plugin's typed helper over writing this by hand:
 * `validators: [min(3)]` rather than `validators: [{ name: 'min', args: [3] }]`.
 */
export interface ValidatorRef {
  name: string;
  args?: JsonValue[];
}

/** Whether a field carries a validator, by the name it was registered under. */
export const hasValidator = (
  node: { validators?: ValidatorRef[] },
  name: string
): boolean => (node.validators ?? []).some((ref) => ref.name === name);

/**
 * A form hook attached to one collection, by the name a plugin registered it
 * under. Same rules as `ValidatorRef`: `args` is plain JSON, it lands in
 * `tina-lock.json`, and the build fails on a name no installed plugin registers.
 */
export interface HookRef {
  name: string;
  args?: JsonValue[];
}

export interface BaseFieldSchema {
  name: string;
  label?: string;
  validators?: ValidatorRef[];
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
  collections?: string[];
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
  hooks?: HookRef[];
}

export type TinaDocument = Record<string, unknown>;
