import {
  type AllowedActions,
  COLLECTION_FORMATS,
  type CollectionFormat,
  FORMAT_EXTENSIONS,
} from '@tinacms/v4-content/schema';

export {
  type AllowedActions,
  type BaseFieldSchema,
  COLLECTION_FORMATS,
  type CollectionFormat,
  type CollectionSchema,
  type FieldSchema,
  FORMAT_EXTENSIONS,
  type HookRef,
  hasValidator,
  type TemplateSchema,
  type TinaDocument,
  type ValidatorRef,
} from '@tinacms/v4-content/schema';

export const formatForPath = (
  documentPath: string
): CollectionFormat | undefined => {
  const lowerPath = documentPath.toLowerCase();
  return COLLECTION_FORMATS.find((format) =>
    lowerPath.endsWith(FORMAT_EXTENSIONS[format])
  );
};

export const ALLOWED_ACTION_NAMES = [
  'canCreate',
  'canDelete',
  'canDuplicate',
  'canCreateFolder',
  'canCreateNestedFolder',
] as const satisfies readonly (keyof AllowedActions)[];
