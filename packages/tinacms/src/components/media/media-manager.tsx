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

import React, { useCallback, useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
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

const MEDIA_STORAGE_META_KEY = 'media-meta'

export interface MediaRequest {
  directory?: string
  onSelect?(media: Media): void
  close?(): void
  allowDelete?: boolean
  namespace?: string
}

const StyledTab = styled.button<{ isActive: boolean }>`
  padding: 10px;
  border: 0;
  cursor: pointer;
  background-color: ${props =>
    props.isActive ? 'var(--tina-color-grey-4)' : 'var(--tina-color-grey-2)'};
`

const StyledTabWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;

  button:first-child {
    border-bottom-left-radius: 4px;
    border-top-left-radius: 4px;
  }
  button:last-child {
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
  }
`

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
  namespace,
  ...props
}: MediaRequest) {
  const cms = useCMS()
  const [listState, setListState] = useState<MediaListState>(() => {
    if (cms.media.isConfigured) return 'loading'
    return 'not-configured'
  })

  const { tabs = [], onItemClick } = cms.media.store

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
  const [searchInput, setSearchInput] = useState('')
  const [currentTab, setCurrentTab] = useState(0)
  const offset = offsetHistory[offsetHistory.length - 1]

  const localStorageKey = `Media-${namespace ??
    'default'}-${currentTab}-${offset ?? 0}-${search}`
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
    const itemsMeta = localStorage.getItem(MEDIA_STORAGE_META_KEY)
    if (itemsMeta) {
      const storedObjects = JSON.parse(itemsMeta) as string[]
      storedObjects.forEach(item => {
        localStorage.removeItem(item)
      })
      localStorage.removeItem(MEDIA_STORAGE_META_KEY)
    }
  }

  const loadMedia = useCallback(() => {
    if (!cms.media.isConfigured) return
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
        const meta = JSON.parse(
          localStorage.getItem(MEDIA_STORAGE_META_KEY) ?? '[]'
        )
        meta.push(localStorageKey)
        localStorage.setItem(MEDIA_STORAGE_META_KEY, JSON.stringify(meta))
        localStorage.setItem(localStorageKey, JSON.stringify(list))
      })
      .catch(e => {
        console.error(e)
        setListError(e)
        setListState('error')
      })
  }, [localStorageKey])

  function refresh() {
    resetOffset()
    if (namespace) {
      localStorage.removeItem(localStorageKey)
    } else {
      resetLocalStorage()
    }
    loadMedia()
  }

  useDebounce(
    () => {
      setSearch(searchInput)
    },
    cms.media.store.debouncedSearchTime ?? 500,
    [searchInput]
  )

  useEffect(() => {
    if (!cms.media.isConfigured) return
    const data = localStorage.getItem(localStorageKey)
    if (data) {
      setList(JSON.parse(data))
      setListState('loaded')
    } else {
      loadMedia()
    }

    return cms.events.subscribe(
      ['media:upload:success', 'media:delete:success', 'media:pageSize'],
      () => {
        resetLocalStorage()
        loadMedia()
      }
    )
  }, [directory, cms.media.isConfigured, localStorageKey])

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
    accept: tabs?.[currentTab]?.accept ?? cms.media.store.accept,

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
  const handleTabChange = (idx: number) => {
    setCurrentTab(idx)
    resetOffset()
  }

  return (
    <>
      <MediaPickerWrap>
        {tabs.length > 0 && (
          <StyledTabWrap>
            {tabs.map((tab, i) => (
              <StyledTab
                key={i}
                onClick={() => handleTabChange(i)}
                isActive={i === currentTab}
              >
                {tab.name}
              </StyledTab>
            ))}
          </StyledTabWrap>
        )}
        <Header>
          <Breadcrumb directory={directory} setDirectory={setDirectory} />
          <form onSubmit={e => handleSubmit(e)}>
            <StyledSearch
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
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
        {itemModal && onItemClick && (
          <ItemModal
            close={() => setItemModal(null)}
            item={itemModal}
            ChildComponent={onItemClick}
          />
        )}
      </MediaPickerWrap>
    </>
  )
}

interface ItemModal {
  close: () => void
  item: Media
  ChildComponent: React.FC<Media>
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

const ItemModal = ({ close, item, ChildComponent }: ItemModal) => {
  return (
    <Modal>
      <PopupModal style={{ width: '70%' }}>
        <ModalHeader close={close}>Details for {item.filename}</ModalHeader>
        <ModalBody>
          <ChildComponent {...item} />
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
