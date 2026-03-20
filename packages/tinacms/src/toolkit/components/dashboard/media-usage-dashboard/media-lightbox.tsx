import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../ui/dialog';
import type { MediaUsage } from './media-usage-scanner';

export const MediaLightbox = ({
  item,
  onClose,
}: {
  item: MediaUsage | null;
  onClose: () => void;
}) => {
  if (!item) return null;

  const usageCount = item.usedIn.length;
  const imageSrc = item.media.src || item.media.thumbnails?.['75x75'];
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
          <img
            src={imageSrc}
            alt={item.media.filename}
            className='mx-auto block max-w-full max-h-[75vh] object-contain rounded-md shadow-sm'
          />
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
