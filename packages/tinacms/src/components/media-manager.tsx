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
import { useCMS } from '../react-tinacms'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFullscreen,
} from '@tinacms/react-modals'
import { MediaList, Media } from '@tinacms/core'
import path from 'path'

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
      <ModalFullscreen>
        <ModalHeader close={close}>Media</ModalHeader>
        <ModalBody padded={true}>
          <MediaPicker {...request} close={close} />
        </ModalBody>
      </ModalFullscreen>
    </Modal>
  )
}

export function MediaPicker({ onSelect, close, ...props }: MediaRequest) {
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
                      if (close) close()
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
