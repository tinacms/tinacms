import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const IMAGE_FIELD_TYPE = 'image';

export interface ImageFieldSchema extends BaseFieldSchema {
  type: typeof IMAGE_FIELD_TYPE;
}

export const image = (
  config: Omit<ImageFieldSchema, 'type'>
): ImageFieldSchema => ({ ...config, type: IMAGE_FIELD_TYPE });

const labelOf = (field: FieldSchema): string => field.label ?? field.name;

const URL_SCHEME = /^[a-z][a-z\d+.-]*:/i;

// A media path is relative to the media root (ADR-022): no URL scheme, no
// leading `/`, and no `..` segment.
const isMediaPath = (value: string): boolean =>
  !URL_SCHEME.test(value) &&
  !value.startsWith('/') &&
  !value.split('/').includes('..');

// The shape of the value only. `required` is a validator the collection
// attaches.
export const imageSchema = (node: FieldSchema): ZodType => {
  const message = `${labelOf(node)} must be a media path, like posts/hero.jpg`;
  return z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z
      .string({ invalid_type_error: message })
      .refine(isMediaPath, { message })
      .optional()
  );
};
