import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';
import type { MediaAccept } from '../../media-manager/media-types';

export const IMAGE_FIELD_TYPE = 'image';

export interface ImageFieldSchema extends BaseFieldSchema {
  type: typeof IMAGE_FIELD_TYPE;
  /**
   * What the picker offers, as media extensions (`png`) or whole categories
   * (`image`). Absent means every media type, and the component falls back to
   * `image` so a field that names none does not offer a folder of video files.
   */
  accept?: MediaAccept | MediaAccept[];
}

export const image = (
  config: Omit<ImageFieldSchema, 'type'>
): ImageFieldSchema => ({ ...config, type: IMAGE_FIELD_TYPE });

// ADR-022: the value is a media path relative to the media root
// (`posts/hero.jpg`), never a URL. The provider turns a path into a URL with
// `resolveUrl`. The shape of the value only; `required` is a validator the
// collection attaches.
export const imageSchema = (_node: FieldSchema): ZodType =>
  z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.string().optional()
  );
