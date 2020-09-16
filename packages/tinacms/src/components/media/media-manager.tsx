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
import styled from 'styled-components'
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
        <ModalBody padded={true}>
          <MediaPicker {...request} close={close} />
        </ModalBody>
      </FullscreenModal>
    </Modal>
  )
}

export function MediaPicker({ onSelect, close, ...props }: MediaRequest) {
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

  const deleteMediaItem = (item: Media) => {
    cms.media.delete(item)
  }

  let selectMediaItem: any

  if (onSelect) {
    selectMediaItem = (item: Media) => {
      onSelect(item)
      if (close) close()
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
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

  return (
    <MediaPickerWrap>
      <Breadcrumb directory={directory} setDirectory={setDirectory} />
      <div {...rootProps}>
        <input {...getInputProps()} />
        <Button onClick={onClick}>Upload</Button>
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {list.items.map((item: Media) => (
            <MediaItem
              item={item}
              onClick={onClickMediaItem}
              onSelect={selectMediaItem}
              onDelete={deleteMediaItem}
            />
          ))}
        </ul>
      </div>
      <PageLinks list={list} setOffset={setOffset} />
    </MediaPickerWrap>
  )
}

const MediaPickerWrap = styled.div`
  height: 90vh;
  padding-bottom: 5rem;
  overflow-y: scroll;
  color: var(--tina-color-grey-9);
`
