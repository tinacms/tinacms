import React from 'react'
import { Media } from '@toolkit/core'
import { BiFolder, BiFile } from 'react-icons/bi'
import { isImage } from './utils'

interface MediaItemProps {
  item: Media & { new?: boolean }
  onClick(_item: Media | false): void
  active: boolean
  showDirectory?: boolean
}

export function ListMediaItem({
  item,
  onClick,
  active,
  showDirectory,
}: MediaItemProps) {
  const FileIcon = item.type === 'dir' ? BiFolder : BiFile
  const thumbnail = (item.thumbnails || {})['75x75']
  return (
    <li
      className={`group relative flex shrink-0 items-center transition duration-150 ease-out cursor-pointer border-b border-gray-150 ${
        active
          ? 'bg-gradient-to-r from-white to-gray-50/50 text-blue-500 hover:bg-gray-50'
          : 'bg-white hover:bg-gray-50/50 hover:text-blue-500'
      }`}
      onClick={() => {
        if (!active) {
          onClick(item)
        } else {
          onClick(false)
        }
      }}
    >
      {item.new && (
        <span className="absolute top-1.5 left-1.5 rounded-full shadow bg-green-100 border border-green-200 text-[10px] tracking-wide	 font-bold text-green-600 px-1.5 py-0.5 z-10">
          NEW
        </span>
      )}
      <div className="w-16 h-16 bg-gray-50 border-r border-gray-150 overflow-hidden flex justify-center flex-shrink-0">
        {isImage(thumbnail) ? (
          <img
            className="object-contain object-center w-full h-full origin-center transition-all duration-150 ease-out group-hover:scale-110"
            src={thumbnail}
            alt={item.filename}
          />
        ) : (
          <FileIcon className="w-1/2 h-full fill-gray-300" />
        )}
      </div>
      <span
        className={'text-base flex-grow w-full break-words truncate px-3 py-2'}
      >
        {showDirectory && item.directory
          ? `${item.directory}/${item.filename}`
          : item.filename}
      </span>
    </li>
  )
}

export function GridMediaItem({ item, active, onClick }: MediaItemProps) {
  const FileIcon = item.type === 'dir' ? BiFolder : BiFile
  const thumbnail = (item.thumbnails || {})['400x400']
  return (
    <li
      className={`relative pb-[100%] h-0 block border border-gray-100 rounded-md overflow-hidden flex justify-center shrink-0 w-full transition duration-150 ease-out ${
        active
          ? 'shadow-outline'
          : 'shadow hover:shadow-md hover:scale-103 hover:border-gray-150'
      } ${item.type === 'dir' ? 'cursor-pointer' : ''}`}
    >
      {item.new && (
        <span className="absolute top-1.5 left-1.5 rounded-full shadow bg-green-100 border border-green-200 text-[10px] tracking-wide	 font-bold text-green-600 px-1.5 py-0.5 z-10">
          NEW
        </span>
      )}
      <button
        className="absolute w-full h-full flex items-center justify-center bg-white"
        onClick={() => {
          if (!active) {
            onClick(item)
          } else {
            onClick(false)
          }
        }}
      >
        {isImage(thumbnail) ? (
          <img
            className="object-contain object-center w-full h-full"
            src={thumbnail}
            alt={item.filename}
          />
        ) : (
          <div className="p-4 w-full flex flex-col gap-4 items-center justify-center">
            <FileIcon className="w-[30%] h-auto fill-gray-300" />
            <span className="block text-base text-gray-600 w-full break-words truncate">
              {item.filename}
            </span>
          </div>
        )}
      </button>
    </li>
  )
}
