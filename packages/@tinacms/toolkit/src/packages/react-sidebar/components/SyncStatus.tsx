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

import * as React from 'react'
import { useState } from 'react'
import { TinaCMS } from '../../../tina-cms'
import { MdSync, MdSyncDisabled, MdSyncProblem } from 'react-icons/md'
import { FcCancel, FcOk } from 'react-icons/fc'
import {
  FullscreenModal,
  Modal,
  ModalBody,
  ModalHeader,
} from '../../react-modals'

type EventListState = 'loading' | 'success' | 'error' | 'unauthorized'

export const useGetEvents = (
  cms: TinaCMS,
  cursor?: string,
  existingEvents?: {
    message: string
    id: string
    timestamp: number
    isError: boolean
    isGlobal: boolean
  }[]
) => {
  const [events, setEvents] = useState<
    {
      message: string
      id: string
      timestamp: number
      isError: boolean
      isGlobal: boolean
    }[]
  >([])
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  React.useEffect(() => {
    const fetchEvents = async () => {
      if (cms.api.tina.isAuthorized()) {
        try {
          const { events: nextEvents, cursor: nextCursor } =
            await cms.api.tina.fetchEvents(15, cursor)
          setEvents([...existingEvents, ...nextEvents])
          setNextCursor(nextCursor)
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] GetEvents failed: ${error.message}`,
            30 * 1000 // 30 seconds
          )
          console.error(error)
          setEvents(undefined)
          setError(error)
        }

        setLoading(false)
      }
    }

    setLoading(true)
    fetchEvents()
  }, [cms, cursor])

  return { events, cursor: nextCursor, loading, error }
}

export const SyncStatus = ({ cms }: { cms: TinaCMS }) => {
  const [syncStatus, setSyncStatus] = useState<{
    state: EventListState
    message: string
  }>({ state: 'loading', message: 'Loading...' })
  const [eventsOpen, setEventsOpen] = React.useState(false)
  const [cursor, setCursor] = React.useState<string | undefined>(undefined)
  const [existingEvents, setExistingEvents] = React.useState<
    {
      message: string
      id: string
      timestamp: number
      isError: boolean
      isGlobal: boolean
    }[]
  >([])

  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (eventsOpen) {
        return
      }
      if (cms.api.tina.isAuthorized()) {
        const { events } = await cms.api.tina.fetchEvents()
        if (events.length === 0) {
          setSyncStatus({ state: 'success', message: 'No Events' })
        } else {
          if (events[0].isError) {
            setSyncStatus({
              state: 'error',
              message: `Sync Failure ${events[0].message}`,
            })
          } else {
            setSyncStatus({ state: 'success', message: 'Sync Successful' })
          }
        }
      } else {
        setSyncStatus({ state: 'unauthorized', message: 'Not Authenticated' })
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [eventsOpen, cms])

  function openEventsModal() {
    if (syncStatus.state !== 'loading' && syncStatus.state !== 'unauthorized') {
      setEventsOpen(true)
    }
  }

  function closeEventsModal() {
    setEventsOpen(false)
  }

  const EventsList = ({}) => {
    const {
      events,
      cursor: nextCursor,
      loading,
      error,
    } = useGetEvents(cms, cursor, existingEvents)

    return (
      <>
        <div>
          {loading && <div>Loading...</div>}
          {error && <div>Error: {error.message}</div>}
          {events.length > 0 && (
            <div className="grid grid-cols-12 gap-1">
              {events
                .map((event) => {
                  const timestamp = new Date(event.timestamp).toLocaleString()
                  return [
                    event.isError ? (
                      <div
                        key={`${event.id}_error_icon`}
                        className="col-span-1"
                      >
                        <FcCancel />
                      </div>
                    ) : (
                      <div key={`${event.id}_ok_icon`} className="col-span-1">
                        <FcOk />
                      </div>
                    ),
                    <div
                      key={`${event.id}_msg`}
                      className={`col-span-9 font-mono text-sm ${
                        event.isError ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {event.message}
                      {event.isError && ` [${event.id}]`}
                    </div>,
                    <div
                      key={`${event.id}_ts`}
                      className="col-span-2 font-mono text-sm"
                    >
                      {timestamp}
                    </div>,
                  ]
                })
                .flat()}
            </div>
          )}
        </div>
        <div className="text-center">
          <a
            className="text-sm underline cursor-pointer"
            onClick={() => {
              setExistingEvents(events)
              setCursor(nextCursor)
            }}
          >
            More
          </a>
        </div>
      </>
    )
  }

  const EventsModal = ({}) => {
    return (
      <Modal>
        <FullscreenModal>
          <ModalHeader close={closeEventsModal}>
            Repository Synchronization Events
          </ModalHeader>
          <ModalBody padded={true}>
            <EventsList />
          </ModalBody>
        </FullscreenModal>
      </Modal>
    )
  }

  return (
    <div className="flex-grow-0 flex w-full text-xs items-center">
      <div
        title={syncStatus.message}
        onClick={openEventsModal}
        className={
          syncStatus.state !== 'loading' && syncStatus.state !== 'unauthorized'
            ? 'cursor-pointer'
            : ''
        }
      >
        {syncStatus.state === 'loading' && (
          <MdSync className="w-6 h-full ml-2 opacity-70 animate-spin" />
        )}
        {syncStatus.state === 'unauthorized' && (
          <MdSyncDisabled className="w-6 h-full ml-2 opacity-70" />
        )}
        {syncStatus.state === 'success' && (
          <MdSync className="w-6 h-full ml-2 opacity-70" />
        )}
        {syncStatus.state === 'error' && (
          <MdSyncProblem className="w-6 h-full ml-2 opacity-70" />
        )}
      </div>

      {eventsOpen && <EventsModal />}
    </div>
  )
}
