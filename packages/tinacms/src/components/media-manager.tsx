import React from 'react'
import { useEffect, useState } from 'react'
import { useCMS } from '../react-tinacms'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFullscreen,
} from '@tinacms/react-modals'
import { MediaList, Media } from '@tinacms/media'
import path from 'path'

export interface MediaRequest {
  limit?: number
  directory?: string
  onSelect?(media: Media): void
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

  return (
    <Modal>
      <ModalFullscreen>
        <ModalHeader close={() => setRequest(undefined)}>Media</ModalHeader>
        <ModalBody padded={true}>
          <MediaPicker {...request} />
        </ModalBody>
      </ModalFullscreen>
    </Modal>
  )
}

export function MediaPicker({ onSelect, ...props }: MediaRequest) {
  const [directory, setDirectory] = useState<string | undefined>(
    props.directory
  )
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(props.limit || 50)
  const [list, setList] = useState<MediaList>()
  const cms = useCMS()

  useEffect(() => {
    cms.media.list({ offset, limit, directory }).then(setList)
  }, [offset, limit, directory])

  if (!list) return <div>Loading...</div>
  const numPages = Math.ceil(list.totalCount / limit)
  const lastItemIndexOnPage = offset + limit
  const currentPageIndex = lastItemIndexOnPage / limit

  let pageLinks = []

  for (let i = 1; i <= numPages; i++) {
    const active = i === currentPageIndex
    pageLinks.push(
      <button
        style={{
          padding: '0.5rem',
          margin: '0 0.5rem',
          background: active ? 'black' : '',
          color: active ? 'white' : '',
        }}
        onClick={() => setOffset(i * limit)}
      >
        {i}
      </button>
    )
  }

  return (
    <div style={{ height: '90vh', paddingBottom: '5rem' }}>
      <h3>Breadcrumbs</h3>
      <button onClick={() => setDirectory('')}>ROOT</button>/
      {directory &&
        directory.split('/').map((part, index, parts) => (
          <button
            onClick={() => {
              setDirectory(parts.slice(0, index + 1).join('/'))
            }}
          >
            {part}/
          </button>
        ))}
      <h3>Items</h3>
      <div
        style={{
          padding: '2rem 0',
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {list.items.map(item => (
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                maxWidth: '800px',
                margin: '0.5rem',
                border: '1px solid pink',
              }}
              onClick={() => {
                if (item.type === 'dir') {
                  setDirectory(path.join(item.directory, item.filename))
                  setOffset(0)
                }
              }}
            >
              <img
                src={
                  item.type === 'file'
                    ? item.previewSrc
                    : 'http://fordesigner.com/imguploads/Image/cjbc/zcool/png20080526/1211755375.png'
                }
                style={{ width: '100px', marginRight: '1rem' }}
              />
              <span style={{ flexGrow: 1 }}>
                {item.filename}
                {item.type === 'dir' && '/'}
              </span>
              {onSelect && item.type === 'file' && (
                <div style={{ minWidth: '100px' }}>
                  <button
                    style={{
                      border: '1px solid aquamarine',
                      padding: '0.25rem 0.5rem',
                    }}
                    onClick={() => {
                      onSelect(item)
                    }}
                  >
                    Insert
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {pageLinks}
      <h4>Page Size</h4>
      {[5, 10, 50, 100].map(size => {
        let active = limit === size
        return (
          <button
            style={{
              padding: '0.5rem',
              margin: '0 0.5rem',
              background: active ? 'black' : '',
              color: active ? 'white' : '',
            }}
            onClick={() => setLimit(size)}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}
