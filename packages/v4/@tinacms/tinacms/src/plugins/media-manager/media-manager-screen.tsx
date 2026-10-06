import { useAdminRoute } from '../../admin/use-admin-route';
import type { AdminScreenProps } from '../../core/screen/contract';
import { MediaBrowser } from './media-browser';
import { MEDIA_SCREEN_NAME } from './media-manager.plugin';

export function MediaManagerScreen({ segments }: AdminScreenProps) {
  const { navigate } = useAdminRoute();
  return (
    <MediaBrowser
      mode='manage'
      folder={segments.join('/')}
      onFolderChange={(next) =>
        navigate({
          view: 'screen',
          screen: MEDIA_SCREEN_NAME,
          segments: next ? next.split('/') : [],
        })
      }
    />
  );
}
