/**



*/
import React from 'react'
import { Media } from '../../packages/core'
import { BiFolder, BiFile } from 'react-icons/bi'
import { isImage } from './utils'

interface MediaItemProps {
  item: Media & { new?: boolean }
  onClick(_item: Media | false): void
  active: boolean
}

export function ListMediaItem({ item, onClick, active }: MediaItemProps) {
  const FileIcon = item.type === 'dir' ? BiFolder : BiFile
  const thumbnail = (item.thumbnails || {})['75x75']
  return (
    <li
      className={`relative flex shrink-0 gap-3 items-center py-2 pl-2 pr-3 transition duration-150 ease-out cursor-pointer border-b border-gray-150 ${
        active
          ? 'bg-gradient-to-r from-white to-gray-50/50 text-blue-500 hover:bg-gray-50'
          : 'bg-white hover:bg-gray-50/50'
      }`}
      onClick={() => {
        if (!active) {
          onClick(item)
        } else {
          onClick(false)
        }
      }}
    >
      {/* TODO: Scott B can you style this? */}
      {item.new && (
        <span className="absolute top-1 left-1 rounded-md bg-green-50  text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 z-10">
          New
        </span>
      )}
      <div className="w-20 h-20 bg-gray-50 shadow border border-gray-100 rounded overflow-hidden flex justify-center flex-shrink-0">
        {isImage(thumbnail) ? (
          <img
            className="object-cover w-full h-full object-center"
            src={thumbnail}
            alt={item.filename}
          />
        ) : (
          <FileIcon className="w-3/5 h-full fill-gray-300" />
        )}
      </div>
      <span className={'text-base flex-grow w-full break-words truncate'}>
        {item.filename}
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
      {/* TODO: Scott B can you style this? */}
      {item.new && (
        <span className="absolute top-1 left-1 rounded-md bg-green-50  text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 z-10">
          New
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
            className="object-cover w-full h-full object-center"
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
