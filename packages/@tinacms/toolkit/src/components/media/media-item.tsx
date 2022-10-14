/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import React from 'react'
import { Media } from '../../packages/core'
import { Folder, File } from '../../packages/icons'
import { Button, IconButton } from '../../packages/styles'
import { TrashIcon } from '../../packages/icons'

interface MediaItemProps {
  item: Media
  onClick(_item: Media): void
  onSelect?(_item: Media): void
  onDelete?(_item: Media): void
}

export function MediaItem({
  item,
  onClick,
  onSelect,
  onDelete,
}: MediaItemProps) {
  const FileIcon = item.type === 'dir' ? Folder : File
  return (
    <li
      className={
        'flex items-center p-2 bg-white rounded-[5px] transition duration-300 ease-linear hover:drop-shadow-md ' +
        (item.type === 'dir' ? 'cursor-pointer' : '')
      }
      onClick={() => onClick(item)}
    >
      <div className="w-[56px] h-[56px] rounded-[5px] overflow-hidden flex justify-center flex-shrink-0 mr-3">
        {item.previewSrc ? (
          <img
            className="object-cover w-full min-h-full object-center"
            src={item.previewSrc}
            alt={item.filename}
          />
        ) : (
          <FileIcon className="w-[47%] h-full fill-gray-300" />
        )}
      </div>
      <Filename>{item.filename}</Filename>
      <div className="flex justify-end gap-2 items-center ml-2">
        {onSelect && item.type === 'file' && (
          <Button size="medium" onClick={() => onSelect(item)}>
            Insert
          </Button>
        )}
        {onDelete && item.type === 'file' && (
          <IconButton size="medium" onClick={() => onDelete(item)}>
            <TrashIcon className="w-5/6 h-auto" />
          </IconButton>
        )}
      </div>
    </li>
  )
}

const Filename = ({ className = '', ...props }) => (
  <span
    className={'text-[15px] flex-grow w-full break-words truncate ' + className}
    {...props}
  />
)
