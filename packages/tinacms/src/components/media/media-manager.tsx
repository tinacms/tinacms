// @ts-nocheck
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

import React, { useCallback } from 'react'
import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { useCMS } from '../../react-tinacms'
import {
  Modal,
  ModalHeader,
  ModalBody,
  FullscreenModal,
  PopupModal,
} from '@einsteinindustries/tinacms-react-modals'
import {
  MediaList,
  Media,
  MediaListOffset,
  MediaListError,
} from '@einsteinindustries/tinacms-core'

import { Button } from '@einsteinindustries/tinacms-styles'
import { useDropzone } from 'react-dropzone'
import { MediaItem, Breadcrumb, CursorPaginator } from './index'
import { LoadingDots } from '@einsteinindustries/tinacms-form-builder'

export interface MediaRequest {
  directory?: string
  onSelect?(media: Media): void
  close?(): void
  allowDelete?: boolean
  currentTab?: number
  setAllTabs?: (tabsArray: string[]) => void
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

const defaultListError = new MediaListError({
  title: 'Error fetching media',
  message: 'Something went wrong while requesting the resource.',
  docsLink: 'https://tina.io/docs/media/#media-store',
})

export function MediaPicker({
  allowDelete,
  onSelect,
  close,
  currentTab,
  setAllTabs,
  ...props
}: MediaRequest) {
  const cms = useCMS()
  const [listState, setListState] = useState<MediaListState>(() => {
    if (cms.media.isConfigured) return 'loading'
    return 'not-configured'
  })

  const [listError, setListError] = useState<MediaListError>(defaultListError)
  const [directory, setDirectory] = useState<string | undefined>(
    props.directory
  )

  const [list, setList] = useState<MediaList>({
    items: [],
    nextOffset: undefined,
  })

  /**
   * current offset is last element in offsetHistory[]
   * control offset by pushing/popping to offsetHistory
   */
  const [offsetHistory, setOffsetHistory] = useState<MediaListOffset[]>([])
  const [itemModal, setItemModal] = useState<Media | null>(null)
  const [search, setSearch] = useState('')
  const offset = offsetHistory[offsetHistory.length - 1]
  const resetOffset = () => setOffsetHistory([])
  const navigateNext = () => {
    if (!list.nextOffset) return
    setOffsetHistory([...offsetHistory, list.nextOffset])
  }
  const navigatePrev = () => {
    const offsets = offsetHistory.slice(0, offsetHistory.length - 1)
    setOffsetHistory(offsets)
  }
  const hasPrev = offsetHistory.length > 0
  const hasNext = !!list.nextOffset
  const resetLocalStorage = () => {
    localStorage.removeItem('Media - 0')
    localStorage.removeItem('Media - 1')
    localStorage.removeItem('Media - 2')
  }

  const loadMedia = useCallback(() => {
    setListState('loading')
    cms.media
      .list({
        offset,
        limit: cms.media.pageSize,
        directory,
        currentList: currentTab,
        search,
      })
      .then(list => {
        setList(list)
        setListState('loaded')
        localStorage.setItem(`Media - ${currentTab}`, JSON.stringify(list))
      })
      .catch(e => {
        console.error(e)
        setListState('error')
      })
  }, [currentTab, offset, search])

  useEffect(() => {
    if (setAllTabs) {
      setAllTabs(['Client', 'Einstein', 'Files'])
    }
  }, [setAllTabs])

  useEffect(() => {
    if (!cms.media.isConfigured) return
    function loadMedia() {
      setListState('loading')
      cms.media
        .list({ offset, limit: cms.media.pageSize, directory })
        .then(list => {
          setList(list)
          setListState('loaded')
        })
        .catch(e => {
          console.error(e)
          if (e.ERR_TYPE === 'MediaListError') {
            setListError(e)
          } else {
            setListError(defaultListError)
          }
          setListState('error')
        })
    }
    loadMedia()
  }, [offset])

  function refresh() {
    resetLocalStorage()
    resetOffset()
    loadMedia()
  }

  useEffect(() => {
    if (offsetHistory.length) {
      resetOffset()
      resetLocalStorage()
    } else {
      const data = localStorage.getItem(`Media - ${currentTab}`)
      if (!data) {
        loadMedia()
      } else {
        setListState('loading')
        setList(JSON.parse(data))
        setListState('loaded')
      }
    }

    return cms.events.subscribe(
      ['media:upload:success', 'media:delete:success', 'media:pageSize'],
      loadMedia
    )
  }, [offset, directory, cms.media.isConfigured, currentTab])

  const onClickMediaItem = (item: Media) => {
    setItemModal(item)
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
    accept: currentTab === 2 ? ['.pdf', '.mp4', '.avi', '.docx'] : 'image/*',

    onDrop: async files => {
      try {
        setUploading(true)
        await cms.media.persist(
          files.map(file => {
            return {
              directory: directory || '/',
              file,
            }
          }),
          currentTab
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
    return (
      <DocsLink
        title="No Media Store Configured"
        message="To use the media manager, you need to configure a Media Store."
        docsLink="https://tina.io/docs/media/"
      />
    )
  }

  if (listState === 'error') {
    const { title, message, docsLink } = listError
    return <DocsLink title={title} message={message} docsLink={docsLink} />
  }

  // https://einsteinindustries.atlassian.net/browse/LUC-778
  // 4 images per line -> sub array of length: 4
  const listByFour: Media[][] = []
  let tmp: Media[] = []
  list.items.forEach((item, idx) => {
    tmp.push(item)
    if ((idx + 1) % 4 === 0 || idx + 1 === list.items.length) {
      listByFour.push(tmp)
      tmp = []
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    loadMedia()
  }

  return (
    <>
      <MediaPickerWrap>
        <Header>
          <Breadcrumb directory={directory} setDirectory={setDirectory} />
          <form onSubmit={e => handleSubmit(e)}>
            <StyledSearch
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
          <div>
            <RefreshButton onClick={refresh} />
            <UploadButton onClick={onClick} uploading={uploading} />
          </div>
        </Header>
        <List {...rootProps} dragActive={isDragActive}>
          <input {...getInputProps()} />

          {listState === 'loaded' && list.items.length === 0 && (
            <EmptyMediaList />
          )}

          {listByFour.map((four: Media[]) => (
            <div
              key={four[0].id}
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {four.map((item: Media) => (
                <MediaItem
                  key={item.id}
                  item={item}
                  onClick={onClickMediaItem}
                  onSelect={selectMediaItem}
                  onDelete={deleteMediaItem}
                />
              ))}
            </div>
          ))}
        </List>

        <CursorPaginator
          currentOffset={offset}
          hasNext={hasNext}
          navigateNext={navigateNext}
          hasPrev={hasPrev}
          navigatePrev={navigatePrev}
        />
        {itemModal && (
          <ItemModal close={() => setItemModal(null)} item={itemModal} />
        )}
      </MediaPickerWrap>
    </>
  )
}

interface ItemModal {
  close: () => void
  item: Media
}

const StyledSearch = styled.input`
  border-radius: var(--tina-radius-small);
  padding: var(--tina-padding-small);
  background: var(--tina-color-grey-0);
  font-size: var(--tina-font-size-2);
  line-height: 1.35;
  color: var(--tina-color-grey-10);
  background-color: var(--tina-color-grey-0);
  -webkit-transition: all 85ms ease-out;
  transition: all 85ms ease-out;
  border: 1px solid var(--tina-color-grey-2);
  width: 375px;
  margin: 0;
  outline: none;
  box-shadow: 0 0 0 2px transparent;
`

const StyledImg = styled.img`
  border-radius: 30px;
  object-fit: cover;
  width: 100%;
  object-position: center;
`

const objToStringArray = (item: any) => {
  const arr: any = []
  for (const [key, value] of Object.entries(item)) {
    let valueStr = ''
    if (typeof value === 'string') {
      valueStr = value
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      valueStr = value.toString()
    } else if (value === null) {
      valueStr = 'null'
    } else if (typeof value === 'object') {
      valueStr = objToStringArray(value)
    }
    arr.push([key, valueStr])
  }
  return arr
}

const ItemModal = ({ close, item }: ItemModal) => {
  const imgix = item.metaData?.attributes
  const tags = imgix?.tags
  const colors = imgix?.colors['dominant_colors']
  const meta = objToStringArray(imgix || item.metaData)
  return (
    <Modal>
      <PopupModal style={{ width: '70%' }}>
        <ModalHeader close={close}>Details for {item.filename}</ModalHeader>
        <ModalBody>
          <div style={{ display: 'flex', margin: '50px auto', width: '80%' }}>
            <div style={{ width: '70%' }}>
              <StyledImg src={item.previewSrc} alt="clicked image" />
            </div>
            <div style={{ width: '100%' }}>
              <ul style={{ listStyle: 'none', marginLeft: '20px' }}>
                <li style={{ marginBottom: '5px' }}>name: {item.filename}</li>
                <li style={{ marginBottom: '5px' }}>url: {item.previewSrc}</li>
                <li style={{ marginBottom: '5px' }}>id: {item.id}</li>
                <li style={{ marginBottom: '5px' }}>type: {item.type}</li>
                {meta.map(
                  ([key, value]: [string, any]) =>
                    typeof value !== 'object' && (
                      <li key={key} style={{ marginBottom: '5px' }}>
                        {key}: {value}
                      </li>
                    )
                )}
                {tags &&
                  Object.entries(tags).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '5px' }}>
                      {key}: {value}
                    </li>
                  ))}
                {colors &&
                  Object.entries(colors).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '5px' }}>
                      {key}: {value}
                    </li>
                  ))}
                {item.metaData?.LastModified && (
                  <li style={{ marginBottom: '5px' }}>
                    last modified: {item.metaData?.LastModified.toString()}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </ModalBody>
      </PopupModal>
    </Modal>
  )
}

const RefreshButton = ({ onClick }: any) => {
  return (
    <Button
      style={{ minWidth: '5.3rem', marginRight: '15px' }}
      primary
      onClick={onClick}
    >
      Refresh
    </Button>
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
  justify-content: space-between;
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

const DocsLink = styled(({ title, message, docsLink, ...props }) => {
  return (
    <div {...props}>
      <h2>{title}</h2>
      <div>{message}</div>
      <a
        style={{ marginTop: '1rem' }}
        href={docsLink}
        target="_blank"
        rel="noreferrer noopener"
      >
        Learn More
      </a>
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
