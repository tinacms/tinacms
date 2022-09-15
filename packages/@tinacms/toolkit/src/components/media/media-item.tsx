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
import styled, { css } from 'styled-components'
import { Media } from '../../packages/core'
import { Folder, File } from '../../packages/icons'
import { Button, IconButton } from '../../packages/styles'
import { TrashIcon } from '../../packages/icons'
import getMime from './get-mime'

interface MediaItemProps {
  item: Media
  onClick(item: Media): void
  onSelect?(item: Media): void
  onDelete?(item: Media): void
}

export function MediaItem({
  item,
  onClick,
  onSelect,
  onDelete,
}: MediaItemProps) {
  return (
    <ListItem onClick={() => onClick(item)} type={item.type}>
      <ItemPreview>
        {item.previewSrc && getMime(item.filename) === 'image' ? (
          <img src={item.previewSrc} alt={item.filename} />
        ) : (
          <FileIcon type={item.type} />
        )}
      </ItemPreview>
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
    </ListItem>
  )
}

function FileIcon({ type }: { type: Media['type'] }) {
  return type === 'dir' ? <Folder /> : <File />
}

interface ListItemProps {
  type: Media['type']
}

const ListItem = styled.li<ListItemProps>`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: white;
  filter: drop-shadow(0 0 0 transparent);
  transition: filter 300ms ease;
  border-radius: var(--tina-radius-small);

  > :first-child {
    margin-right: var(--tina-padding-small);
  }

  &:hover {
    filter: drop-shadow(var(--tina-shadow-small));
    ${(p) =>
      p.type === 'dir' &&
      css`
        cursor: pointer;
      `}
  }
`

const ItemPreview = styled.div`
  width: 56px;
  height: 56px;
  border-radius: var(--tina-radius-small);
  overflow: hidden;
  display: flex;
  justify-content: center;
  flex-shrink: 0;

  > img {
    object-fit: cover;
    width: 100%;
    min-height: 100%;
    object-position: center;
  }

  > svg {
    width: 47%;
    height: 100%;
    fill: var(--tina-color-grey-4);
  }
`

const Filename = styled.span`
  flex-grow: 1;
  font-size: var(--tina-font-size-2);
  overflow: hidden;
  width: 100%;
  overflow-wrap: break-word;
  white-space: nowrap;
  text-overflow: ellipsis;
`
