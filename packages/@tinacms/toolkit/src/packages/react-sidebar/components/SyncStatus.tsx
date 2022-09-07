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
import { MdSyncProblem } from 'react-icons/md'
import { HiOutlineClipboardList } from 'react-icons/hi'
import {
  FullscreenModal,
  Modal,
  ModalBody,
  ModalHeader,
} from '../../react-modals'
import { BsCheckCircleFill, BsExclamationOctagonFill } from 'react-icons/bs'
import { Button } from '../../styles'

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

function useSyncStatus(cms) {
  const [syncStatus, setSyncStatus] = useState<{
    state: EventListState
    message: string
  }>({ state: 'loading', message: 'Loading...' })

  React.useEffect(() => {
    const interval = setInterval(async () => {
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
  }, [cms])

  return syncStatus
}

export const SyncErrorWidget = ({ cms }: { cms: any }) => {
  const syncStatus = useSyncStatus(cms)

  if (syncStatus.state !== 'error') {
    return null
  }

  return (
    <div
      title={syncStatus.message}
      className="flex-grow-0 flex text-xs items-center"
    >
      <MdSyncProblem className="w-6 h-full ml-2 text-red-500 fill-current" />
    </div>
  )
}

const EventsList = ({ cms }) => {
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

  const {
    events,
    cursor: nextCursor,
    loading,
    error,
  } = useGetEvents(cms, cursor, existingEvents)

  return (
    <div className="flex flex-col gap-4 w-full h-full grow-0">
      {events.length > 0 && (
        <div className="shrink grow-0 overflow-scroll w-full rounded-md shadow ring-1 ring-black ring-opacity-5">
          <table className="w-full divide-y divide-gray-100">
            {events
              .map((event, index) => {
                const date = new Date(event.timestamp).toDateString()
                const time = new Date(event.timestamp).toTimeString()

                return (
                  <tr className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                    {event.isError ? (
                      <td
                        key={`${event.id}_error_icon`}
                        className="py-3 pl-4 pr-0 w-0"
                      >
                        <BsExclamationOctagonFill className="text-red-500 fill-current w-5 h-auto" />
                      </td>
                    ) : (
                      <td
                        key={`${event.id}_ok_icon`}
                        className="py-3 pl-4 pr-0 w-0"
                      >
                        <BsCheckCircleFill className="text-green-500 fill-current w-5 h-auto" />
                      </td>
                    )}
                    <td
                      key={`${event.id}_msg`}
                      className="whitespace-nowrap p-3 text-base text-gray-500"
                    >
                      {event.message}
                      {event.isError && (
                        <div className="w-full text-gray-300 text-xs mt-0.5">
                          {event.id}
                        </div>
                      )}
                    </td>
                    <td
                      key={`${event.id}_ts`}
                      className="whitespace-nowrap py-3 pl-3 pr-4 text-sm text-gray-500"
                    >
                      {date}
                      <span className="w-full block text-gray-300 text-xs mt-0.5">
                        {time}
                      </span>
                    </td>
                  </tr>
                )
              })
              .flat()}
          </table>
        </div>
      )}
      {loading && (
        <div className="text-sm text-gray-400 text-center">Loading...</div>
      )}
      {error && <div>Error: {error.message}</div>}
      <div className="text-center flex-1">
        <Button
          onClick={() => {
            setExistingEvents(events)
            setCursor(nextCursor)
          }}
        >
          Load More Events
        </Button>
      </div>
    </div>
  )
}

export const SyncStatus = ({ cms }) => {
  const syncStatus = useSyncStatus(cms)
  const [eventsOpen, setEventsOpen] = React.useState(false)

  function openEventsModal() {
    setEventsOpen(true)
  }

  function closeEventsModal() {
    setEventsOpen(false)
  }

  if (cms.api?.tina?.isLocalMode) {
    return null
  }

  return (
    <>
      <button
        className={`text-lg px-4 py-2 first:pt-3 last:pb-3 tracking-wide whitespace-nowrap flex items-center opacity-80 text-gray-600 hover:text-blue-400 hover:bg-gray-50 hover:opacity-100`}
        onClick={openEventsModal}
      >
        {syncStatus.state !== 'error' ? (
          <HiOutlineClipboardList className="w-6 h-auto mr-2 text-blue-400" />
        ) : (
          <MdSyncProblem className="w-6 h-auto mr-2 text-red-400" />
        )}{' '}
        Event Log
      </button>
      {eventsOpen && (
        <Modal>
          <FullscreenModal>
            <ModalHeader close={closeEventsModal}>Event Log</ModalHeader>
            <ModalBody padded={true}>
              <EventsList cms={cms} />
            </ModalBody>
          </FullscreenModal>
        </Modal>
      )}
    </>
  )
}
