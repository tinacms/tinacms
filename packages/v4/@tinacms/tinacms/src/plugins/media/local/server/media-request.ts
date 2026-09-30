import { z } from 'zod';
import type { MediaPage } from '../../../../core/media/contract';
import type { LocalMedia } from './local-media';

export const MAX_MEDIA_PAGE_SIZE = 200;

const mediaRequestSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('list'),
    folder: z.string(),
    cursor: z.string().regex(/^\d+$/).optional(),
    limit: z.number().int().min(1).max(MAX_MEDIA_PAGE_SIZE).optional(),
  }),
  z.object({ op: z.literal('delete'), path: z.string().min(1) }),
]);

export type MediaRequest = z.infer<typeof mediaRequestSchema>;

export const dispatchMediaRequest = async (
  media: LocalMedia,
  request: unknown
): Promise<MediaPage | null> => {
  const parsed = mediaRequestSchema.parse(request);
  switch (parsed.op) {
    case 'list':
      return media.list(parsed.folder, {
        cursor: parsed.cursor,
        limit: parsed.limit,
      });
    case 'delete':
      await media.delete(parsed.path);
      return null;
  }
};
