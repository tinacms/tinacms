import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../ui/dialog';
import type { MediaUsage } from './media-usage-scanner';
import { BiMovie } from 'react-icons/bi';

export const MediaLightbox = ({
  item,
  onClose,
}: {
  item: MediaUsage | null;
  onClose: () => void;
}) => {
  if (!item) return null;

  const usageCount = item.usedIn.length;
  const mediaSrc = item.media.src;
  const directory = item.media.directory || '/';

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='w-auto max-w-[95vw] border border-gray-200 bg-white px-4 pt-12 pb-4 shadow-xl sm:max-w-fit'>
        <DialogTitle className='sr-only'>
          Preview: {item.media.filename}
        </DialogTitle>
        <DialogDescription className='sr-only'>
          {usageCount > 0
            ? `Used in ${usageCount} ${usageCount === 1 ? 'document' : 'documents'}`
            : 'Unused media file'}
        </DialogDescription>
        <div className='mx-auto w-fit max-w-full rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-3'>
          {item.type === 'video' ? (
            <VideoLightboxContent
              src={mediaSrc}
              filename={item.media.filename}
            />
          ) : (
            <ImageLightboxContent
              src={mediaSrc}
              filename={item.media.filename}
            />
          )}
        </div>
        <div className='mt-3 space-y-1 text-center'>
          <div className='text-sm font-medium text-gray-700'>
            <span className='break-all'>{item.media.filename}</span>
          </div>
          <div className='text-xs text-gray-500'>
            Directory:{' '}
            <span className='break-all font-medium'>{directory}</span>
          </div>
          <div className='text-sm font-medium text-gray-700'>
            {usageCount > 0 ? (
              <span className='text-tina-orange font-semibold'>
                Used in {usageCount} {usageCount === 1 ? 'doc' : 'docs'}
              </span>
            ) : (
              <span className='font-semibold text-gray-500'>Unused</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ImageLightboxContent = ({
  src,
  filename,
}: {
  src: string;
  filename: string;
}) => (
  <img
    src={src}
    alt={filename}
    className='mx-auto block max-w-full max-h-[75vh] object-contain rounded-md shadow-sm'
  />
);

const VideoLightboxContent = ({
  src,
  filename,
}: {
  src: string;
  filename: string;
}) => {
  const [playbackFailed, setPlaybackFailed] = React.useState(false);

  React.useEffect(() => {
    setPlaybackFailed(false);

    return () => {
      setPlaybackFailed(false);
    };
  }, [src]);

  if (playbackFailed) {
    return (
      <div className='flex min-h-[12rem] min-w-[16rem] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-white px-6 py-8 text-center'>
        <BiMovie className='h-10 w-10 text-gray-400' />
        <div className='text-sm font-medium text-gray-700'>{filename}</div>
        <div className='max-w-sm text-sm text-gray-500'>
          This video format is recognized, but this browser could not preview
          it.
        </div>
      </div>
    );
  }

  return (
    <video
      src={src}
      controls
      playsInline
      preload='metadata'
      className='mx-auto block h-auto w-[min(80vw,720px)] max-w-full max-h-[75vh] rounded-md bg-black shadow-sm'
      onError={() => setPlaybackFailed(true)}
    />
  );
};
