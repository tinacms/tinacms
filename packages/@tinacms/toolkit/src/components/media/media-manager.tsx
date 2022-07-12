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
import { useEffect, useState } from 'react'
import { useCMS } from '../../react-tinacms/use-cms'
import { BiCloudUpload } from 'react-icons/bi'
import {
  Modal,
  ModalHeader,
  ModalBody,
  FullscreenModal,
  PopupModal,
  ModalActions,
} from '../../packages/react-modals'
import {
  MediaList,
  Media,
  MediaListOffset,
  MediaListError,
} from '../../packages/core'
import { Button } from '../../packages/styles'
import { useDropzone } from 'react-dropzone'
import { CursorPaginator } from './pagination'
import { MediaItem } from './media-item'
import { Breadcrumb } from './breadcrumb'
import { LoadingDots } from '../../packages/form-builder'
import { IoMdSync } from 'react-icons/io'

// taken from https://davidwalsh.name/javascript-polling
async function poll(
  fn: () => Promise<{
    complete: boolean
    status: {
      [key: string]: boolean
    }
  }>,
  timeout,
  interval
) {
  const endTime = Number(new Date()) + (timeout || 2000)
  interval = interval || 100

  const checkCondition = async function (resolve, reject) {
    // If the condition is met, we're done!
    const result = await fn()
    if (result.complete) {
      resolve(result)
    }
    // If the condition isn't met but the timeout hasn't elapsed, go again
    else if (Number(new Date()) < endTime) {
      setTimeout(checkCondition, interval, resolve, reject)
    }
    // Didn't match and too much time, reject!
    else {
      reject(new Error('Time out error'))
    }
  }

  return new Promise(checkCondition)
}

// Can not use path.join on the frontend
const join = function (...parts) {
  // From: https://stackoverflow.com/questions/29855098/is-there-a-built-in-javascript-function-similar-to-os-path-join
  /* This function takes zero or more strings, which are concatenated
  together to form a path or URL, which is returned as a string. This
  function intelligently adds and removes slashes as required, and is
  aware that `file` URLs will contain three adjacent slashes. */

  const [first, last, slash] = [0, parts.length - 1, '/']

  const matchLeadingSlash = new RegExp('^' + slash)
  const matchTrailingSlash = new RegExp(slash + '$')

  parts = parts.map(function (part, index) {
    if (index === first && part === 'file://') return part

    if (index > first) part = part.replace(matchLeadingSlash, '')

    if (index < last) part = part.replace(matchTrailingSlash, '')

    return part
  })

  return parts.join(slash)
}

export interface MediaRequest {
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

const defaultListError = new MediaListError({
  title: 'Error fetching media',
  message: 'Something went wrong while requesting the resource.',
  docsLink: 'https://tina.io/docs/media/#media-store',
})

export function MediaPicker({
  allowDelete,
  onSelect,
  close,
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

  const [showSync, setShowSync] = useState(false)

  /**
   * current offset is last element in offsetHistory[]
   * control offset by pushing/popping to offsetHistory
   */
  const [offsetHistory, setOffsetHistory] = useState<MediaListOffset[]>([])
  const [loadingText, setLoadingText] = useState('')
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

  const isLocal = cms.api.tina.isLocalMode

  const hasTinaMedia =
    Object.keys(cms.api.tina.schema.schema?.config?.media?.tina || {}).includes(
      'mediaRoot'
    ) &&
    Object.keys(cms.api.tina.schema.schema?.config?.media?.tina || {}).includes(
      'publicFolder'
    )
  const folder = hasTinaMedia
    ? join(
        cms.api.tina.schema.schema?.config?.media?.tina.publicFolder,
        cms.api.tina.schema.schema?.config?.media?.tina.mediaRoot
      )
    : ''
  const branch = cms.api.tina?.branch

  function loadMedia() {
    setListState('loading')
    cms.media
      .list({ offset, limit: cms.media.pageSize, directory })
      .then((list) => {
        setList(list)
        setListState('loaded')
      })
      .catch((e) => {
        console.error(e)
        if (e.ERR_TYPE === 'MediaListError') {
          setListError(e)
        } else {
          setListError(defaultListError)
        }
        setListState('error')
      })
  }
  useEffect(() => {
    if (!cms.media.isConfigured) return
    loadMedia()

    return cms.events.subscribe(
      ['media:upload:success', 'media:delete:success', 'media:pageSize'],
      loadMedia
    )
  }, [offset, directory, cms.media.isConfigured])

  const onClickMediaItem = (item: Media) => {
    if (item.type === 'dir') {
      // Only join when there is a directory to join to
      setDirectory(
        item.directory === '.' || item.directory === ''
          ? item.filename
          : join(item.directory, item.filename)
      )
      resetOffset()
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
    accept: cms.media.accept || 'image/*',
    multiple: true,
    onDrop: async (files) => {
      try {
        setUploading(true)
        await cms.media.persist(
          files.map((file) => {
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

  const syncMedia = async () => {
    if (hasTinaMedia) {
      const res = await cms.api.tina.syncTinaMedia()
      if (res?.assetsSyncing) {
        // it was successful
        try {
          setListState('loading')
          // poll every 3 seconds until it is done
          await poll(
            async () => {
              const status = await cms.api.tina.checkSyncStatus({
                assetsSyncing: res.assetsSyncing,
              })
              const totalDone = Object.values(status.status).filter(
                Boolean
              )?.length
              const total = Object.keys(status.status)?.length
              setLoadingText(`${totalDone}/${total} Media items loaded`)
              return status
            },
            // Will time out after 60 seconds
            60000,
            3000
          )
          setLoadingText('')
          // refresh the media
          loadMedia()
        } catch (e) {
          cms.alerts.error(
            'Error in syncing media, check console for more details'
          )
          console.error("'Error in syncing media, check below for more details")
          console.error(e)
        }
      } else {
        // it was not
        cms.alerts.warn(
          'Whoops, Looks media is not set up correctly in Tina Cloud. Check console for more details'
        )
        console.warn(
          'Whoops, Looks media is not set up correctly. Check below for more details'
        )
        console.warn(res)
      }
    }
  }

  const { onClick, ...rootProps } = getRootProps()

  function disableScrollBody() {
    const body = document?.body
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = 'auto'
    }
  }

  useEffect(disableScrollBody, [])

  if (listState === 'loading' || uploading) {
    return <LoadingMediaList extraText={loadingText} />
  }

  if (listState === 'not-configured') {
    return (
      <DocsLink
        title="No Media Store Configured"
        message="To use the media manager, you need to configure a Media Store."
        docsLink="https://tina.io/docs/reference/media/overview/"
      />
    )
  }

  if (listState === 'error') {
    const { title, message, docsLink } = listError
    return <DocsLink title={title} message={message} docsLink={docsLink} />
  }

  return (
    <>
      <MediaPickerWrap>
        <div className="flex items-center bg-white border-b border-gray-100 gap-x-3 py-3 px-5 shadow-sm flex-shrink-0">
          <Breadcrumb directory={directory} setDirectory={setDirectory} />
          {!isLocal && hasTinaMedia && (
            <Button
              // this button is only displayed when the data is not loading
              busy={false}
              variant="white"
              onClick={() => {
                setShowSync(true)
              }}
            >
              Sync <IoMdSync className="w-6 h-full ml-2 opacity-70" />
            </Button>
          )}
          <UploadButton onClick={onClick} uploading={uploading} />
        </div>
        <ul
          {...rootProps}
          className={`flex flex-1 flex-col gap-4 p-5 m-0 h-full overflow-y-auto ${
            isDragActive ? `border-2 border-blue-500 rounded-lg` : ``
          }`}
        >
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
        </ul>
        <div className="bg-white border-t border-gray-100 py-3 px-5 shadow-sm z-10">
          <CursorPaginator
            hasNext={hasNext}
            navigateNext={navigateNext}
            hasPrev={hasPrev}
            navigatePrev={navigatePrev}
          />
        </div>
      </MediaPickerWrap>
      {showSync && (
        <SyncModal
          folder={folder}
          branch={branch}
          syncFunc={syncMedia}
          close={() => {
            setShowSync(false)
          }}
        />
      )}
    </>
  )
}

const UploadButton = ({ onClick, uploading }: any) => {
  return (
    <Button
      variant="primary"
      size="custom"
      className="text-sm h-10 px-6"
      busy={uploading}
      onClick={onClick}
    >
      {uploading ? (
        <LoadingDots />
      ) : (
        <>
          Upload <BiCloudUpload className="w-6 h-full ml-2 opacity-70" />
        </>
      )}
    </Button>
  )
}

const LoadingMediaList = (props) => {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      {...props}
    >
      {props.extraText && <p>{props.extraText}</p>}
      <LoadingDots color={'var(--tina-color-primary)'} />
    </div>
  )
}

const MediaPickerWrap = ({ children }) => {
  return (
    <div className="h-full flex-1 text-gray-700 flex flex-col relative bg-gray-50 outline-none active:outline-none focus:outline-none">
      {children}
    </div>
  )
}

const EmptyMediaList = (props) => {
  return (
    <div className={`text-2xl opacity-50 p-12 text-center`} {...props}>
      Drag and Drop assets here
    </div>
  )
}

const DocsLink = ({ title, message, docsLink, ...props }) => {
  return (
    <div className="h-3/4 text-center flex flex-col justify-center" {...props}>
      <h2 className="mb-3 text-xl text-gray-600">{title}</h2>
      <div className="mb-3 text-base text-gray-700">{message}</div>
      <a
        href={docsLink}
        target="_blank"
        rel="noreferrer noopener"
        className="font-bold text-blue-500 hover:text-blue-600 hover:underline transition-all ease-out duration-150"
      >
        Learn More
      </a>
    </div>
  )
}

const SyncModal = ({ close, syncFunc, folder, branch }) => {
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Sync Media</ModalHeader>
        <ModalBody padded={true}>
          <p>
            {`This will copy all media from the \`${folder}\` folder on branch \`${branch}\` in your git repository to Tina Cloud. Are
            you sure you would like to perform this action?`}
          </p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant="primary"
            onClick={async () => {
              await syncFunc()
              close()
            }}
          >
            Sync Media
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  )
}
