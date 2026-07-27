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

const typeBadge = (filename: string): string | null => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext || ext === filename.toLowerCase()) return null;
  return ext === 'jpg' ? 'JPEG' : ext.toUpperCase();
};

export function GridFolderItem({
  item,
  onClick,
}: Omit<MediaItemProps, 'active'>) {
  return (
    <li className='block shrink-0 w-full'>
      <button
        onClick={() => onClick(item)}
        className='group flex flex-col w-full text-left rounded-xl overflow-hidden border border-gray-150 bg-gradient-to-b from-orange-50/60 to-white shadow-sm hover:shadow-md hover:border-tina-orange/40 transition outline-none focus-visible:ring-2 focus-visible:ring-tina-orange/40'
      >
        <div className='flex items-center justify-center h-24'>
          <BiFolder className='w-11 h-11 fill-tina-orange' />
        </div>
        <div className='w-full px-3 py-2 border-t border-gray-100 bg-white/60 text-sm font-medium text-gray-700 truncate'>
          {item.filename}
        </div>
      </button>
    </li>
  );
}

export function GridMediaItem({ item, active, onClick }: MediaItemProps) {
  const thumbnail = (item.thumbnails || {})['400x400'];
  const itemIsImage = isImage(thumbnail);
  const itemIsVideo = isVideo(item.src);
  const badge = typeBadge(item.filename);
  return (
    <li className='block shrink-0 w-full'>
      <button
        className={cn(
          'group relative flex flex-col w-full text-left outline-none rounded-xl overflow-hidden border bg-white shadow-sm transition',
          {
            'border-gray-150 hover:border-tina-orange/40 hover:shadow-md':
              !active,
            'border-2 border-tina-orange ring-2 ring-tina-orange/20 shadow-md':
              active,
          }
        )}
        onClick={() => onClick(active ? false : item)}
      >
        {item.new && (
          <span className='absolute top-2 right-2 z-10 rounded bg-green-100 border border-green-200 text-[10px] tracking-wide font-bold text-green-600 px-1.5 py-0.5'>
            NEW
          </span>
        )}
        <div className='relative w-full aspect-square overflow-hidden bg-gray-50'>
          {itemIsImage ? (
            <img
              className='block w-full h-full object-center object-cover'
              style={checkerboardStyle}
              src={thumbnail}
              alt={item.filename}
            />
          ) : itemIsVideo ? (
            <div className='w-full h-full bg-gradient-to-br from-gray-700 to-gray-900' />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <BiFile className='w-2/5 h-auto fill-gray-300' />
            </div>
          )}
          {itemIsVideo && (
            <span className='absolute inset-0 flex items-center justify-center'>
              <span className='w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center'>
                <svg
                  className='w-4 h-4 ml-0.5 fill-gray-700'
                  viewBox='0 0 24 24'
                >
                  <path d='M8 5v14l11-7z' />
                </svg>
              </span>
            </span>
          )}
          {badge && (
            <span className='absolute bottom-2 left-2 rounded bg-black/65 text-white text-[10px] font-semibold tracking-wide px-1.5 py-0.5'>
              {badge}
            </span>
          )}
        </div>
        <div className='w-full px-2.5 py-2 text-sm text-gray-700 truncate'>
          {item.filename}
        </div>
      </button>
    </li>
  );
}
