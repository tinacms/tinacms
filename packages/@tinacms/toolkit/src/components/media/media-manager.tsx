/**



*/

import React from 'react'
import { useEffect, useState } from 'react'
import { useCMS } from '../../react-tinacms/use-cms'
import {
  BiArrowToBottom,
  BiCloudUpload,
  BiGridAlt,
  BiListUl,
} from 'react-icons/bi'
import {
  Modal,
  ModalHeader,
  ModalBody,
  FullscreenModal,
  PopupModal,
  ModalActions,
} from '../../packages/react-modals'
import { BiFolder, BiFile } from 'react-icons/bi'
import {
  MediaList,
  Media,
  MediaListOffset,
  MediaListError,
} from '../../packages/core'
import { Button } from '../../packages/styles'
import { useDropzone } from 'react-dropzone'
import { CursorPaginator } from './pagination'
import { ListMediaItem, GridMediaItem } from './media-item'
import { Breadcrumb } from './breadcrumb'
import { LoadingDots } from '../../packages/form-builder'
import { IoMdSync } from 'react-icons/io'
import { CloseIcon, TrashIcon } from '../../packages/icons'
import {
  absoluteImgURL,
  DEFAULT_MEDIA_UPLOAD_TYPES,
  dropzoneAcceptFromString,
  isImage,
} from './utils'
import { BiCopyAlt } from 'react-icons/bi'

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
  onSelect?(_media: Media): void
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
        <div className="w-full bg-gray-50 flex items-center justify-between px-5 pt-3 m-0">
          <h2 className="text-gray-500 font-sans font-medium text-base leading-none m-0 block truncate">
            Media Manager
          </h2>
          <div
            onClick={close}
            className="flex items-center fill-gray-400 cursor-pointer transition-colors duration-100 ease-out hover:fill-gray-700"
          >
            <CloseIcon className="w-6 h-auto" />
          </div>
        </div>
        <ModalBody className="flex h-full flex-col">
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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeItem, setActiveItem] = useState<Media | false>(false)

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
    if (!item) {
      setActiveItem(false)
    } else if (item.type === 'dir') {
      // Only join when there is a directory to join to
      setDirectory(
        item.directory === '.' || item.directory === ''
          ? item.filename
          : join(item.directory, item.filename)
      )
      resetOffset()
    } else {
      setActiveItem(item)
    }
  }

  let deleteMediaItem: (_item: Media) => void
  if (allowDelete) {
    deleteMediaItem = (item: Media) => {
      if (confirm('Are you sure you want to delete this file?')) {
        cms.media.delete(item)
      }
    }
  }

  let selectMediaItem: (_item: Media) => void

  if (onSelect) {
    selectMediaItem = (item: Media) => {
      onSelect(item)
      if (close) close()
    }
  }

  const [uploading, setUploading] = useState(false)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: dropzoneAcceptFromString(
      cms.media.accept || DEFAULT_MEDIA_UPLOAD_TYPES
    ),
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
        <div className="flex items-center bg-gray-50 border-b border-gray-150 gap-x-4 py-3 px-5 shadow-sm flex-shrink-0">
          {/* viewMode toggle */}
          <div
            className={`grow-0 flex divide-x divide-gray-150 shadow-inner bg-gray-50 border border-gray-150 justify-between rounded-md`}
          >
            <button
              className={`relative whitespace-nowrap flex items-center justify-center flex-1 block font-medium text-base px-2.5 py-1 transition-all ease-out duration-150 rounded-l-md ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-500 shadow'
                  : 'text-gray-400'
              }`}
              onClick={() => {
                setViewMode('grid')
              }}
            >
              <BiGridAlt className="w-6 h-full opacity-70" />
            </button>
            <button
              className={`relative whitespace-nowrap flex items-center justify-center flex-1 block font-medium text-base px-2 py-1 transition-all ease-out duration-150 rounded-r-md ${
                viewMode === 'list'
                  ? 'bg-white text-blue-500 shadow'
                  : 'text-gray-400'
              }`}
              onClick={() => {
                setViewMode('list')
              }}
            >
              <BiListUl className="w-8 h-full opacity-70" />
            </button>
          </div>

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

        <div className="flex h-full overflow-hidden">
          <div className="flex w-full flex-col h-full">
            <ul
              {...rootProps}
              className={`h-full grow overflow-y-auto transition duration-150 ease-out ${
                viewMode === 'list' &&
                'bg-gray-50 w-full flex flex-1 flex-col justify-start'
              } ${
                viewMode === 'grid' &&
                'bg-white w-full grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_max(220px,_100%/8)),_1fr))] auto-rows-auto grid-flow-dense p-4 gap-4 content-start'
              } ${isDragActive ? `border-2 border-blue-500 rounded-lg` : ``}`}
            >
              <input {...getInputProps()} />

              {listState === 'loaded' && list.items.length === 0 && (
                <EmptyMediaList hasTinaMedia={hasTinaMedia} />
              )}

              {viewMode === 'list' &&
                list.items.map((item: Media) => (
                  <ListMediaItem
                    key={item.id}
                    item={item}
                    onClick={onClickMediaItem}
                    active={activeItem && activeItem.id === item.id}
                  />
                ))}

              {viewMode === 'grid' &&
                list.items.map((item: Media) => (
                  <GridMediaItem
                    key={item.id}
                    item={item}
                    onClick={onClickMediaItem}
                    active={activeItem && activeItem.id === item.id}
                  />
                ))}
            </ul>

            <div className="bg-gray-50 shrink-0 grow-0 border-t border-gray-150 py-3 px-5 shadow-sm z-10">
              <CursorPaginator
                hasNext={hasNext}
                navigateNext={navigateNext}
                hasPrev={hasPrev}
                navigatePrev={navigatePrev}
              />
            </div>
          </div>

          <ActiveItemPreview
            activeItem={activeItem}
            selectMediaItem={selectMediaItem}
            deleteMediaItem={deleteMediaItem}
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

const ActiveItemPreview = ({
  activeItem,
  selectMediaItem,
  deleteMediaItem,
}) => {
  return (
    <div
      className={`shrink-0 h-full flex flex-col items-start gap-3 overflow-y-auto bg-white border-l border-gray-100 bg-white shadow-md transition ease-out duration-150 ${
        activeItem
          ? `p-4 opacity-100 w-[35%] max-w-[560px] min-w-[240px]`
          : `translate-x-8 opacity-0 w-[0px]`
      }`}
    >
      {activeItem && (
        <>
          {isImage(activeItem.thumbnail) ? (
            <img
              className="object-cover border border-gray-100 rounded-md overflow-hidden w-full h-auto max-h-[40%] object-center shadow"
              src={activeItem.thumbnail}
              alt={activeItem.filename}
            />
          ) : (
            <span className="p-3 border border-gray-100 rounded-md overflow-hidden bg-gray-50 shadow">
              <BiFile className="w-14 h-auto fill-gray-300" />
            </span>
          )}
          <div className="grow h-full w-full shrink flex flex-col gap-3 items-start justify-start">
            <h3 className="text-lg text-gray-600 w-full max-w-full break-words block truncate">
              {activeItem.filename}
            </h3>
            <CopyField
              value={absoluteImgURL(activeItem.src)}
              label="Absolute URL"
            />
          </div>
          <div className="shrink-0 w-full flex flex-col justify-end items-start">
            <div className="flex w-full gap-3">
              {selectMediaItem && (
                <Button
                  size="medium"
                  variant="primary"
                  className="grow"
                  onClick={() => selectMediaItem(activeItem)}
                >
                  Insert
                  <BiArrowToBottom className="ml-1 -mr-0.5 w-6 h-auto text-white opacity-70" />
                </Button>
              )}
              <Button
                variant="white"
                size="medium"
                className="grow max-w-[40%]"
                onClick={() => deleteMediaItem(activeItem)}
              >
                Delete
                <TrashIcon className="ml-1 -mr-0.5 w-6 h-auto text-red-500 opacity-70" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
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
      {props.hasTinaMedia &&
        " or click 'Sync' to sync your media to Tina Cloud"}
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
            {`This will copy media assets from the \`${folder}\` folder on branch \`${branch}\` in your git repository to Tina Cloud's asset service. This will allow you to use these assets in your site with Tina Cloud`}
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

interface CopyFieldProps {
  label?: string
  description?: string
  value: any
}

const CopyField = ({ label, description, value }: CopyFieldProps) => {
  const [copied, setCopied] = React.useState(false)
  const [fadeOut, setFadeOut] = React.useState(false)

  return (
    <div className="w-full">
      {label && (
        <label className="w-full mb-1 block flex-1  text-sm font-bold leading-5 text-gray-700">
          {label}
        </label>
      )}
      <span
        onClick={() => {
          if (copied === true) return
          setCopied(true)
          setTimeout(() => {
            setFadeOut(true)
          }, 2500)
          setTimeout(() => {
            setCopied(false)
            setFadeOut(false)
          }, 3000)

          navigator.clipboard.writeText(value)
        }}
        className={`shadow-inner text-base leading-5 whitespace-normal break-all px-3 py-2 text-gray-600 w-full bg-gray-50 border border-gray-200 transition-all ease-out duration-150 rounded-md relative overflow-hidden appearance-none flex items-center w-full cursor-pointer hover:bg-white hover:text-blue-500  ${
          copied ? `pointer-events-none` : ``
        }`}
      >
        <BiCopyAlt className="relative text-blue-500 shrink-0 w-5 h-auto mr-1.5 -ml-0.5 z-20" />{' '}
        {value}{' '}
        {copied && (
          <span
            className={`${
              fadeOut ? `opacity-0` : `opacity-100`
            } text-blue-500 transition-opacity	duration-500 absolute right-0 w-full h-full px-3 py-2 bg-white bg-opacity-90 flex items-center justify-center text-center tracking-wide font-medium z-10`}
          >
            <span>Copied to clipboard!</span>
          </span>
        )}
      </span>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}
