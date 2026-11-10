import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { MediaPageRequest, MediaStatus } from '../../core/media/contract';
import { useCurrentBranch } from '../../editor/content-queries';
import { useMediaSlice } from '../../editor/hooks';

export const MEDIA_LIST_KEY = ['tina', 'media', 'list'] as const;

const READY: MediaStatus = { kind: 'ready' };

/** The cursor-paginated listing of one folder, keyed by branch, folder, search and extensions. */
export function useMediaListing(
  folder: string,
  request: Pick<MediaPageRequest, 'search' | 'extensions'> = {}
) {
  const media = useMediaSlice();
  const branch = useCurrentBranch() ?? '';
  return useInfiniteQuery({
    queryKey: [
      ...MEDIA_LIST_KEY,
      branch,
      folder,
      request.search ?? '',
      request.extensions ?? [],
    ],
    queryFn: ({ pageParam }) =>
      media.list(folder, { ...request, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.cursor,
  });
}

/** Whether the media provider is ready, or needs setup first. */
export function useMediaStatus() {
  const media = useMediaSlice();
  const branch = useCurrentBranch() ?? '';
  return useQuery({
    queryKey: ['tina', 'media', 'status', branch],
    queryFn: () => (media.status ? media.status() : Promise.resolve(READY)),
  });
}
