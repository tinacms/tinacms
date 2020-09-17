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
import styled, { css } from 'styled-components'
import { Media } from '@tinacms/core'
import { Folder, File } from '@tinacms/icons'
import { Button, IconButton } from '@tinacms/styles'
import { TrashIcon } from '@tinacms/icons'

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
    <ListItem onClick={() => onClick(item)} type={item.type}>
      <ItemPreview>
        {item.previewSrc ? (
          <img src={item.previewSrc} alt={item.filename} />
        ) : (
          <FileIcon type={item.type} />
        )}
      </ItemPreview>
      <Filename type={item.type}>{item.filename}</Filename>
      <ActionButtons>
        {onSelect && item.type === 'file' && (
          <Button small onClick={() => onSelect(item)}>
            Insert
          </Button>
        )}
        {item.type === 'file' && (
          <IconButton small onClick={() => confirmDelete(item)}>
            <TrashIcon />
          </IconButton>
        )}
      </ActionButtons>
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
  padding: 1.125rem;
  background-color: white;
  filter: drop-shadow(0 0 0 transparent);
  transition: filter 300ms ease;
  border-bottom: 1px solid var(--tina-color-grey-2);
  margin-bottom: var(--tina-padding-small);
  border-radius: var(--tina-radius-small);

  > :first-child {
    margin-right: var(--tina-padding-big);
  }

  &:hover {
    filter: drop-shadow(var(--tina-shadow-small));
    ${p =>
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

const Filename = styled.span<ListItemProps>`
  flex-grow: 1;
  font-size: var(--tina-font-size-2);

  ::after {
    ${p =>
      p.type === 'dir' &&
      css`
        content: ' / ';
        text-transform: capitalize;
      `}
  }
`

const ActionButtons = styled.span`
  display: flex;
  > * {
    margin-left: var(--tina-padding-small);
  }
`
