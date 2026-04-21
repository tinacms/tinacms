import { Media } from '@toolkit/core';
import React from 'react';
import { BiFile, BiFolder, BiMovie } from 'react-icons/bi';
import { isImage, isVideo } from './utils';
import { cn } from '@utils/cn';

interface MediaItemProps {
  item: Media & { new?: boolean };
  onClick(_item: Media | false): void;
  active: boolean;
}

export const checkerboardStyle = {
  backgroundImage:
    'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
  backgroundSize: '12px 12px',
  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
};

export const smallCheckerboardStyle = {
  backgroundImage:
    'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
  backgroundSize: '6px 6px',
  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
};

export function ListMediaItem({ item, onClick, active }: MediaItemProps) {
  let FileIcon = BiFile;
  if (item.type === 'dir') {
    FileIcon = BiFolder;
  } else if (isVideo(item.src)) {
    FileIcon = BiMovie;
  }
  const thumbnail = (item.thumbnails || {})['75x75'];
  return (
    <li
      className={`group relative flex shrink-0 items-center transition duration-150 ease-out cursor-pointer border-b border-gray-150 ${
        active
          ? 'bg-gradient-to-r from-white to-gray-50/50 text-tina-orange hover:bg-gray-50'
          : 'bg-white hover:bg-gray-50/50 hover:text-tina-orange'
      }`}
      onClick={() => {
        if (!active) {
          onClick(item);
        } else {
          onClick(false);
        }
      }}
    >
      {item.new && (
        <span className='absolute top-1 right-1 rounded shadow bg-green-100 border border-green-200 text-[10px] tracking-wide	 font-bold text-green-600 px-1.5 py-0.5 z-10'>
          NEW
        </span>
      )}
      <div className='w-16 h-16 overflow-hidden flex justify-center flex-shrink-0'>
        {isImage(thumbnail) ? (
          <img
            className='block overflow-hidden object-center object-contain max-w-full max-h-full m-auto shadow'
            style={smallCheckerboardStyle}
            src={thumbnail}
            alt={item.filename}
          />
        ) : (
          <FileIcon
            className={`w-1/2 h-full ${item.type === 'dir' ? 'fill-tina-orange' : 'fill-gray-300'}`}
          />
        )}
      </div>
      <span
        className={'text-base flex-grow w-full break-words truncate px-3 py-2'}
      >
        {item.filename}
      </span>
    </li>
  );
}

export function GridMediaItem({ item, active, onClick }: MediaItemProps) {
  let FileIcon = BiFile;
  if (item.type === 'dir') {
    FileIcon = BiFolder;
  } else if (isVideo(item.src)) {
    FileIcon = BiMovie;
  }
  const thumbnail = (item.thumbnails || {})['400x400'];
  const itemIsImage = isImage(thumbnail);
  return (
    <li className='block flex justify-center shrink-0 w-full transition duration-150 ease-out'>
      <button
        className={cn(
          'relative flex flex-col gap-1 items-center w-full outline-none rounded-lg overflow-hidden border-2 transition',
          {
            'border-black/10 hover:border-tina-orange/50 shadow-sm hover:shadow-md bg-white':
              !active,
            'border-tina-orange bg-tina-orange/10 shadow-md': active,
            'cursor-pointer': item.type === 'dir',
          }
        )}
        onClick={() => {
          if (!active) {
            onClick(item);
          } else {
            onClick(false);
          }
        }}
      >
        {item.new && (
          <span className='absolute top-1 right-1 rounded shadow bg-green-100 border border-green-200 text-[10px] tracking-wide font-bold text-green-600 px-1.5 py-0.5 z-10'>
            NEW
          </span>
        )}
        <div className='w-full overflow-hidden aspect-[1/1]'>
          {itemIsImage ? (
            <img
              className='block w-full h-full object-center object-cover'
              style={checkerboardStyle}
              src={thumbnail}
              alt={item.filename}
            />
          ) : (
            <div className='w-full h-full flex flex-col items-center justify-center'>
              <FileIcon
                className={`w-[40%] h-auto ${item.type === 'dir' ? 'fill-tina-orange' : 'fill-gray-300'}`}
                size={40}
              />
            </div>
          )}
        </div>
        <div className='mt-auto w-full px-2 py-1 text-sm truncate'>
          {item.filename}
        </div>
      </button>
    </li>
  );
}
