/**

Copyright 2019 Forestry.io Inc

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
import styled from 'styled-components'
import { Media } from '@tinacms/core'
import { Folder, File } from '@tinacms/icons'
import { Button } from '@tinacms/styles'

interface MediaItemProps {
  item: Media
  onClick: (item: Media) => void
  onSelect: (item: Media) => void
  onDelete: (item: Media) => void
}

export function MediaItem({
  item,
  onClick,
  onSelect,
  onDelete,
}: MediaItemProps) {
  const confirmDelete = (item: Media) => {
    if (confirm('Are you sure you want to delete this file?')) {
      onDelete(item)
    }
  }
  return (
    <ListItem onClick={() => onClick(item)}>
      <ItemPreview>
        {item.previewSrc ? (
          <img src={item.previewSrc} alt={item.filename} />
        ) : (
          <FileIcon type={item.type} />
        )}
      </ItemPreview>
      <span style={{ flexGrow: 1 }}>
        {item.filename}
        {item.type === 'dir' && '/'}
      </span>
      {onSelect && item.type === 'file' && (
        <div style={{ minWidth: '100px' }}>
          <Button small onClick={() => onSelect(item)}>
            Insert
          </Button>
        </div>
      )}
      {item.type === 'file' && (
        <div style={{ minWidth: '100px' }}>
          <Button small onClick={() => confirmDelete(item)}>
            Delete
          </Button>
        </div>
      )}
    </ListItem>
  )
}

function FileIcon({ type }: { type: Media['type'] }) {
  return type === 'dir' ? <Folder /> : <File />
}

const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: var(--tina-padding-big) var(--tina-padding-small);
  background-color: transparent;
  transition: background-color 300ms ease;
  border-bottom: 1px solid var(--tina-color-grey-2);

  > *:not(:first-child) {
    margin-left: var(--tina-padding-big);
  }

  &:hover {
    background-color: var(--tina-color-grey-1);
    border-radius: var(--tina-radius-small);
    cursor: pointer;
  }
`

const ItemPreview = styled.div`
  width: 56px;
  border-radius: var(--tina-radius-small);
  overflow: hidden;
  display: flex;
  justify-content: center;

  > img {
    min-height: 56px;
    object-fit: cover;
  }

  > svg {
    width: 47%;
    height: 100%;
    fill: var(--tina-color-grey-4);
  }
`
