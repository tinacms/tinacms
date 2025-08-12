import { Media } from '@toolkit/core';
import React from 'react';
import { BiFile, BiFolder, BiMovie } from 'react-icons/bi';
import { isImage, isVideo } from './utils';
import { cn } from '../../../utils/cn';

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
          ? 'bg-gradient-to-r from-white to-gray-50/50 text-blue-500 hover:bg-gray-50'
          : 'bg-white hover:bg-gray-50/50 hover:text-blue-500'
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
          <FileIcon className='w-1/2 h-full fill-gray-300' />
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
    <li className='block overflow-hidden flex justify-center shrink-0 w-full transition duration-150 ease-out'>
      <button
        className={cn(
          'relative flex flex-col items-center justify-center w-full',
          {
            'shadow hover:shadow-md hover:scale-103 hover:border-gray-150':
              !active,
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
        <div className='relative w-full flex items-center justify-center'>
          {itemIsImage ? (
            <>
              <img
                className={cn(
                  'block overflow-hidden object-center object-contain max-w-full max-h-[16rem] m-auto shadow',
                  { 'border border-blue-500': active }
                )}
                style={checkerboardStyle}
                src={thumbnail}
                alt={item.filename}
              />
              <span
                className={cn(
                  'absolute bottom-0 left-0 w-full text-xs text-white px-2 py-1 truncate z-10',
                  active ? 'bg-blue-500/60' : 'bg-black/60'
                )}
                style={{ pointerEvents: 'none' }}
              >
                {item.filename}
              </span>
            </>
          ) : (
            <div className='p-4 w-full flex flex-col gap-4 items-center justify-center'>
              <FileIcon className='w-[30%] h-auto fill-gray-300' />
              <span className='block text-base text-gray-600 w-full break-words truncate'>
                {item.filename}
              </span>
            </div>
          )}
        </div>
      </button>
    </li>
  );
}
