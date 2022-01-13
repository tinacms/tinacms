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
import styled from 'styled-components'
import { Media } from '@einsteinindustries/tinacms-core'
import { Folder, File } from '@einsteinindustries/tinacms-icons'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDelete,
}: MediaItemProps) {
  return (
    <ListItem
      onClick={() => (onSelect ? onSelect(item) : onClick(item))}
      type={item.type}
      data-content={item.filename}
    >
      <ItemPreview>
        {item.previewSrc ? (
          <img src={item.previewSrc} alt={item.filename} />
        ) : (
          <FileIcon type={item.type} />
        )}
      </ItemPreview>
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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: white;
  filter: drop-shadow(0 0 0 transparent);
  transition: filter 300ms ease;
  border: 1px solid var(--tina-color-grey-2);
  margin-bottom: var(--tina-padding-small);
  border-radius: var(--tina-radius-small);
  min-height: 90px;
  position: relative;

  &:after {
    content: 'Here is some text..';
    color: #fff;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    opacity: 0;
    transition: all 1s;
    -webkit-transition: all 1s;
  }

  &:after {
    content: '\\A';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    position: absolute;
    opacity: 0;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }

  &:before {
    position: absolute;
    opacity: 0;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    content: attr(data-content);
    width: 100%;
    color: #fff;
    z-index: 1;
    bottom: 0;
    padding: 4px 10px;
    text-align: center;
    background: var(--tina-color-primary-light);
    box-sizing: border-box;
    -moz-box-sizing: border-box;
  }

  &:hover:after,
  &:hover:before {
    opacity: 0.9;
    cursor: pointer;
  }

  @media screen and (min-width: 720px) {
    padding: 1.125rem;

    > :first-child {
      margin-right: var(--tina-padding-big);
    }
  }
`

const ItemPreview = styled.div`
  width: 90%;
  height: auto;
  border-radius: var(--tina-radius-small);
  overflow: hidden;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: top;

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
