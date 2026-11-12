import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId } from 'react';
import { useBranchSync } from '../branch';
import { MEDIA_LIST_KEY } from './media-list-key';
import { useUploadList, useUploadState } from './use-uploads';

interface UploadHostProps {
  /**
   * `TinaAdmin` passes true: its host always draws, goes first, and leaves the
   * branch list to the shell, which reads it already.
   */
  primary?: boolean;
}

/**
 * Draws the part of the upload list that belongs to no surface: the polite
 * status. It also refreshes the folder listing when a file lands. `TinaAdmin`
 * renders the primary one. A `MediaBrowser` or an image field renders one too,
 * for a page with no `TinaAdmin`. Only the first host of a runtime draws, so
 * the page has it exactly once.
 */
export function UploadHost({ primary = false }: UploadHostProps) {
  const list = useUploadList();
  const id = useId();
  useEffect(() => list.claimHost(id, primary), [list, id, primary]);
  return primary ? <UploadHostParts /> : <SecondaryUploadHost id={id} />;
}

function SecondaryUploadHost({ id }: { id: string }) {
  const first = useUploadState((state) => state.hosts[0] === id);
  if (!first) return null;
  return (
    <>
      <BranchReader />
      <UploadHostParts />
    </>
  );
}

function BranchReader() {
  useBranchSync();
  return null;
}

function UploadHostParts() {
  const list = useUploadList();
  const queryClient = useQueryClient();
  const say = useUploadState((state) => state.say);

  useEffect(
    () =>
      list.onStored(({ branch, folder }) => {
        const queryKey = [...MEDIA_LIST_KEY, branch, folder];
        // Invalidation does not restart a first load that is still on its way,
        // and that load may have read the folder before the file landed.
        void queryClient
          .cancelQueries({ queryKey })
          .then(() => queryClient.invalidateQueries({ queryKey }));
      }),
    [list, queryClient]
  );

  return (
    <>
      <span role='status' data-upload-status='' className='sr-only'>
        {say}
      </span>
    </>
  );
}
