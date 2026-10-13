import { z } from 'zod';
import type { MediaPage } from '../../../../core/media/contract';
import type { LocalMedia } from './local-media';

export const MAX_MEDIA_PAGE_SIZE = 200;

const listQuerySchema = z.object({
  folder: z.string().default(''),
  cursor: z.string().regex(/^\d+$/).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_MEDIA_PAGE_SIZE).optional(),
});

const mediaRequestSchema = z.object({
  op: z.literal('delete'),
  path: z.string().min(1),
});

export type MediaRequest = z.infer<typeof mediaRequestSchema>;

export const listMedia = (
  media: LocalMedia,
  query: URLSearchParams
): Promise<MediaPage> => {
  const { folder, cursor, limit } = listQuerySchema.parse(
    Object.fromEntries(query)
  );
  return media.list(folder, { cursor, limit });
};

export const dispatchMediaRequest = async (
  media: LocalMedia,
  request: unknown
): Promise<null> => {
  const parsed = mediaRequestSchema.parse(request);
  await media.delete(parsed.path);
  return null;
};
