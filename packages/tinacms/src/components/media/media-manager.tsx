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
import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { useCMS } from '../../react-tinacms'
import {
  Modal,
  ModalHeader,
  ModalBody,
  FullscreenModal,
} from '@tinacms/react-modals'
import { MediaList, Media } from '@tinacms/core'
import path from 'path'
import { Button } from '@tinacms/styles'
import { useDropzone } from 'react-dropzone'
import { MediaItem, Breadcrumb, PageLinks } from './index'

export interface MediaRequest {
  limit?: number
  directory?: string
  onSelect?(media: Media): void
  close?(): void
  allowDelete?: boolean
}

export function MediaManager() {
  const cms = useCMS()

  const [request, setRequest] = useState<MediaRequest | undefined>()

  useEffect(() => {
    return cms.events.subscribe('media:open', ({ type, ...request }) => {
      setRequest(request)
    })
  }, [])

  if (!request) return null

  const close = () => setRequest(undefined)

  return (
    <Modal>
      <FullscreenModal>
        <ModalHeader close={close}>Media Manager</ModalHeader>
        <ModalBody>
          <MediaPicker {...request} close={close} />
        </ModalBody>
      </FullscreenModal>
    </Modal>
  )
}

export function MediaPicker({
  allowDelete,
  onSelect,
  close,
  ...props
}: MediaRequest) {
  const [directory, setDirectory] = useState<string | undefined>(
    props.directory
  )
  const [offset, setOffset] = useState(0)
  const [limit] = useState(props.limit || 50)
  const [list, setList] = useState<MediaList>({
    limit,
    offset,
    items: [],
    totalCount: 0,
  })
  const cms = useCMS()

  const loadMedia = () => {
    cms.media.list({ offset, limit, directory }).then(setList)
  }

  useEffect(loadMedia, [offset, limit, directory])

  useEffect(() => cms.events.subscribe('media:upload:success', loadMedia), [
    offset,
    limit,
    directory,
  ])

  useEffect(() => cms.events.subscribe('media:delete:success', loadMedia), [
    offset,
    limit,
    directory,
  ])

  if (!list) return <div>Loading...</div>

  const onClickMediaItem = (item: Media) => {
    if (item.type === 'dir') {
      setDirectory(path.join(item.directory, item.filename))
      setOffset(0)
    }
  }

  let deleteMediaItem: any
  if (allowDelete) {
    deleteMediaItem = (item: Media) => {
      if (confirm('Are you sure you want to delete this file?')) {
        cms.media.delete(item)
      }
    }
  }

  let selectMediaItem: any

  if (onSelect) {
    selectMediaItem = (item: Media) => {
      onSelect(item)
      if (close) close()
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',

    onDrop: async ([file]) => {
      //@ts-ignore
      await cms.media.persist([
        {
          directory: directory || '/',
          file,
        },
      ])
    },
  })

  const { onClick, ...rootProps } = getRootProps()

  function disableScrollBody() {
    const body = document?.body
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = 'auto'
    }
  }

  useEffect(disableScrollBody, [])

  return (
    <MediaPickerWrap>
      <Header>
        <Breadcrumb directory={directory} setDirectory={setDirectory} />
        <Button primary onClick={onClick}>
          Upload
        </Button>
      </Header>
      <List {...rootProps} dragActive={isDragActive}>
        <input {...getInputProps()} />
        {list.items.map((item: Media) => (
          <MediaItem
            item={item}
            onClick={onClickMediaItem}
            onSelect={selectMediaItem}
            onDelete={deleteMediaItem}
          />
        ))}
      </List>

      <PageLinks list={list} setOffset={setOffset} />
    </MediaPickerWrap>
  )
}

const MediaPickerWrap = styled.div`
  height: 100%;
  padding-bottom: 5rem;
  overflow-y: scroll;
  color: var(--tina-color-grey-9);
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--tina-color-grey-1);
  padding: 0 1.125rem var(--tina-padding-big) 1.125rem;

  *:active,
  *:focus {
    outline: none;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  background: var(--tina-color-grey-1);
  padding: var(--tina-padding-big) 1rem var(--tina-padding-big) 1.125rem;
  border-radius: var(--tina-radius-small);
  position: sticky;
  top: 0;
  z-index: 1;
`

interface ListProps {
  dragActive: boolean
}

const List = styled.ul<ListProps>`
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
  height: 100%;
  overflow: scroll;

  ${p =>
    p.dragActive &&
    css`
      border: 2px solid var(--tina-color-primary);
      border-radius: var(--tina-radius-small);
    `}
`
