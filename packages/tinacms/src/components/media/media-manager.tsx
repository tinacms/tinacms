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
import { MediaItem, Breadcrumb, MediaPaginatorPlugin } from './index'
import { LoadingDots } from '@tinacms/react-forms'

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

type MediaListState = 'loading' | 'loaded' | 'error' | 'not-configured'

export function MediaPicker({
  allowDelete,
  onSelect,
  close,
  ...props
}: MediaRequest) {
  const cms = useCMS()
  const Paginator = cms.plugins
    .getType('media:ui')
    .find('paginator') as MediaPaginatorPlugin
  const [listState, setListState] = useState<MediaListState>(() => {
    if (cms.media.isConfigured) return 'loading'
    return 'not-configured'
  })
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

  useEffect(() => {
    function loadMedia() {
      setListState('loading')
      cms.media
        .list({ offset, limit, directory })
        .then(list => {
          setList(list)
          setListState('loaded')
        })
        .catch(e => {
          console.error(e)
          setListState('error')
        })
    }

    loadMedia()

    return cms.events.subscribe(
      ['media:upload:success', 'media:delete:success'],
      loadMedia
    )
  }, [offset, limit, directory])

  const onClickMediaItem = (item: Media) => {
    if (item.type === 'dir') {
      setDirectory(path.join(item.directory, item.filename))
      setOffset(0)
    }
  }

  let deleteMediaItem: (item: Media) => void
  if (allowDelete) {
    deleteMediaItem = (item: Media) => {
      if (confirm('Are you sure you want to delete this file?')) {
        cms.media.delete(item)
      }
    }
  }

  let selectMediaItem: (item: Media) => void

  if (onSelect) {
    selectMediaItem = (item: Media) => {
      onSelect(item)
      if (close) close()
    }
  }

  const [uploading, setUploading] = useState(false)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',

    onDrop: async files => {
      try {
        setUploading(true)
        await cms.media.persist(
          files.map(file => {
            return {
              directory: directory || '/',
              file,
            }
          })
        )
      } catch {
        // TODO: Events get dispatched already. Does anything else need to happen?
      }
      setUploading(false)
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

  if (listState === 'loading') {
    return <LoadingMediaList />
  }

  if (listState === 'not-configured') {
    return <DocsLink title="Please Set up a Media Store" />
  }

  if (listState === 'error') {
    return <DocsLink title="Failed to Load Media" />
  }

  return (
    <MediaPickerWrap>
      <Header>
        <Breadcrumb directory={directory} setDirectory={setDirectory} />
        <UploadButton onClick={onClick} uploading={uploading} />
      </Header>
      <List {...rootProps} dragActive={isDragActive}>
        <input {...getInputProps()} />

        {listState === 'loaded' && list.items.length === 0 && (
          <EmptyMediaList />
        )}

        {list.items.map((item: Media) => (
          <MediaItem
            key={item.id}
            item={item}
            onClick={onClickMediaItem}
            onSelect={selectMediaItem}
            onDelete={deleteMediaItem}
          />
        ))}
      </List>

      <Paginator.Component list={list} setOffset={setOffset} />
    </MediaPickerWrap>
  )
}

const UploadButton = ({ onClick, uploading }: any) => {
  return (
    <Button
      style={{ minWidth: '5.3rem' }}
      primary
      busy={uploading}
      onClick={onClick}
    >
      {uploading ? <LoadingDots /> : 'Upload'}
    </Button>
  )
}

const LoadingMediaList = styled(props => {
  return (
    <div {...props}>
      <LoadingDots color={'var(--tina-color-primary)'} />
    </div>
  )
})`
  width: 100%;
  height: 75%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const MediaPickerWrap = styled.div`
  height: 100%;
  overflow-y: auto;
  color: var(--tina-color-grey-9);
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--tina-color-grey-1);
  padding: 0 1rem var(--tina-padding-big) 1rem;

  ::-webkit-scrollbar {
    width: 0;
  }

  *:active,
  *:focus {
    outline: none;
  }

  @media (min-width: 720px) {
    padding: 0 1.125rem var(--tina-padding-big) 1.125rem;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  background: var(--tina-color-grey-1);
  padding: var(--tina-padding-big) 0.75rem;
  border-radius: var(--tina-radius-small);
  position: sticky;
  top: 0;
  z-index: 1;

  @media (min-width: 720px) {
    padding: var(--tina-padding-big) 1rem var(--tina-padding-big) 1.125rem;
  }
`

interface ListProps {
  dragActive: boolean
}

const List = styled.ul<ListProps>`
  display: flex;
  flex-direction: column;
  padding: 0 0 2rem 0;
  margin: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  ${p =>
    p.dragActive &&
    css`
      border: 2px solid var(--tina-color-primary);
      border-radius: var(--tina-radius-small);
    `}
`

const EmptyMediaList = styled(props => {
  return <div {...props}>Drag and Drop assets here</div>
})`
  font-size: 1.5rem;
  opacity: 50%;
  padding: 3rem;
  text-align: center;
`

const DocsLink = styled(({ title, ...props }) => {
  return (
    <div {...props}>
      <h2>{title}</h2>
      <div>
        {' '}
        Visit the{' '}
        <a href="https://tinacms.org/docs/media" rel="noreferrer noopener">
          docs
        </a>{' '}
        to learn more about setting up the Media Manager for your CMS.
      </div>
    </div>
  )
})`
  height: 75%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  a {
    color: black;
    text-decoration: underline;
    font-weight: bold;
  }
`
