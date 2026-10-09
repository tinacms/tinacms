import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const IMAGE_FIELD_TYPE = 'image';

export interface ImageFieldSchema extends BaseFieldSchema {
  type: typeof IMAGE_FIELD_TYPE;
}

export const image = (
  config: Omit<ImageFieldSchema, 'type'>
): ImageFieldSchema => ({ ...config, type: IMAGE_FIELD_TYPE });

// The shape of the value only: a media path (ADR-022), never a URL.
// `required` is a validator the collection attaches.
export const imageSchema = (_node: FieldSchema): ZodType =>
  z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.string().optional()
  );
