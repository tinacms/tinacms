import { type ZodType, z } from 'zod';
import { invariant } from '../../../core/invariant';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const IMAGE_FIELD_TYPE = 'image';

export const IMAGE_COVER_LOOKS = ['wide', 'tall'] as const;

export type ImageCoverLook = (typeof IMAGE_COVER_LOOKS)[number];

export interface ImageFieldSchema extends BaseFieldSchema {
  type: typeof IMAGE_FIELD_TYPE;
  /** Shows the picture larger: `wide` is 16:9, `tall` is 4:3. Has no effect on the items of a list of images. */
  cover?: ImageCoverLook;
}

export const image = (
  config: Omit<ImageFieldSchema, 'type'>
): ImageFieldSchema => ({ ...config, type: IMAGE_FIELD_TYPE });

const labelOf = (field: FieldSchema): string => field.label ?? field.name;

const URL_SCHEME = /^[a-z][a-z\d+.-]*:/i;

// A media path is relative to the media root (ADR-022): no URL scheme, no
// leading `/`, and no `..` segment.
export const isMediaPath = (value: string): boolean =>
  !URL_SCHEME.test(value) &&
  !value.startsWith('/') &&
  !value.split('/').includes('..');

// The shape of the value only. `required` is a validator the collection
// attaches.
export const imageSchema = (node: FieldSchema): ZodType => {
  const { cover } = node as ImageFieldSchema;
  invariant(
    cover === undefined || IMAGE_COVER_LOOKS.includes(cover),
    'image-field-schema-invalid',
    `The image field "${node.name}" needs "cover" to be "wide" or "tall".`
  );
  const message = `${labelOf(node)} must be a media path, like posts/hero.jpg`;
  return z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z
      .string({ invalid_type_error: message })
      .refine(isMediaPath, { message })
      .optional()
  );
};
