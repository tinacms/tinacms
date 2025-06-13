import {
  FullscreenModal,
  Modal,
  ModalBody,
  ModalHeader,
} from '@toolkit/react-modals';
import { Button } from '@toolkit/styles';
import { TinaCMS } from '@toolkit/tina-cms';
import * as React from 'react';
import { useState } from 'react';
import { BsCheckCircleFill, BsExclamationOctagonFill } from 'react-icons/bs';
import { MdSyncProblem } from 'react-icons/md';
import { TbLogs } from 'react-icons/tb';

type EventListState = 'loading' | 'success' | 'error' | 'unauthorized';

export const useGetEvents = (
  cms: TinaCMS,
  cursor?: string,
  existingEvents?: {
    message: string;
    id: string;
    timestamp: number;
    isError: boolean;
    isGlobal: boolean;
  }[]
) => {
  const [events, setEvents] = useState<
    {
      message: string;
      id: string;
      timestamp: number;
      isError: boolean;
      isGlobal: boolean;
    }[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  React.useEffect(() => {
    const fetchEvents = async () => {
      let doFetchEvents = false;
      if (!cms.api?.tina?.isCustomContentApi) {
        doFetchEvents = await cms.api?.tina?.authProvider?.isAuthenticated();
      }
      if (doFetchEvents) {
        try {
          const { events: nextEvents, cursor: nextCursor } =
            await cms.api.tina.fetchEvents(15, cursor);
          setEvents([...existingEvents, ...nextEvents]);
          setNextCursor(nextCursor);
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] GetEvents failed: ${error.message}`,
            30 * 1000 // 30 seconds
          );
          console.error(error);
          setEvents(undefined);
          setError(error);
        }

        setLoading(false);
      }
    };

    setLoading(true);
    fetchEvents();
  }, [cms, cursor]);

  return { events, cursor: nextCursor, loading, error };
};

function useSyncStatus(cms: TinaCMS) {
  const [syncStatus, setSyncStatus] = useState<{
    state: EventListState;
    message: string;
  }>({ state: 'loading', message: 'Loading...' });

  React.useEffect(() => {
    const interval = setInterval(async () => {
      let doFetchEvents = false;
      if (!cms.api?.tina?.isCustomContentApi) {
        // update this?
        doFetchEvents = await cms.api?.tina?.authProvider?.isAuthenticated();
      }
      if (doFetchEvents) {
        const { events } = await cms.api.tina.fetchEvents();
        if (events.length === 0) {
          setSyncStatus({ state: 'success', message: 'No Events' });
        } else {
          if (events[0].isError) {
            setSyncStatus({
              state: 'error',
              message: `Sync Failure ${events[0].message}`,
            });
          } else {
            setSyncStatus({ state: 'success', message: 'Sync Successful' });
          }
        }
      } else {
        setSyncStatus({ state: 'unauthorized', message: 'Not Authenticated' });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [cms.api?.tina?.isCustomContentApi]);

  return syncStatus;
}

const EventsList = ({ cms }) => {
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const [existingEvents, setExistingEvents] = React.useState<
    {
      message: string;
      id: string;
      timestamp: number;
      isError: boolean;
      isGlobal: boolean;
    }[]
  >([]);

  const {
    events,
    cursor: nextCursor,
    loading,
    error,
  } = useGetEvents(cms, cursor, existingEvents);

  return (
    <div className='flex flex-col gap-4 w-full h-full grow-0'>
      {events.length > 0 && (
        <div className='shrink grow-0 overflow-scroll w-full rounded shadow ring-1 ring-black ring-opacity-5'>
          <table className='w-full divide-y divide-gray-100'>
            {events
              .map((event, index) => {
                const date = new Date(event.timestamp).toDateString();
                const time = new Date(event.timestamp).toTimeString();

                return (
                  <tr className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                    {event.isError ? (
                      <td
                        key={`${event.id}_error_icon`}
                        className='py-3 pl-4 pr-0 w-0'
                      >
                        <BsExclamationOctagonFill className='text-red-500 fill-current w-5 h-auto' />
                      </td>
                    ) : (
                      <td
                        key={`${event.id}_ok_icon`}
                        className='py-3 pl-4 pr-0 w-0'
                      >
                        <BsCheckCircleFill className='text-green-500 fill-current w-5 h-auto' />
                      </td>
                    )}
                    <td
                      key={`${event.id}_msg`}
                      className='whitespace-nowrap p-3 text-base text-gray-500'
                    >
                      {event.message}
                      {event.isError && (
                        <div className='w-full text-gray-300 text-xs mt-0.5'>
                          {event.id}
                        </div>
                      )}
                    </td>
                    <td
                      key={`${event.id}_ts`}
                      className='whitespace-nowrap py-3 pl-3 pr-4 text-sm text-gray-500'
                    >
                      {date}
                      <span className='w-full block text-gray-300 text-xs mt-0.5'>
                        {time}
                      </span>
                    </td>
                  </tr>
                );
              })
              .flat()}
          </table>
        </div>
      )}
      {loading && (
        <div className='text-sm text-gray-400 text-center'>Loading...</div>
      )}
      {error && <div>Error: {error.message}</div>}
      <div className='text-center flex-1'>
        <Button
          onClick={() => {
            setExistingEvents(events);
            setCursor(nextCursor);
          }}
        >
          Load More Events
        </Button>
      </div>
    </div>
  );
};

export const SyncStatusModal = ({ closeEventsModal, cms }) => (
  <Modal>
    <FullscreenModal>
      <ModalHeader close={closeEventsModal}>Event Log</ModalHeader>
      <ModalBody className='flex h-full flex-col' padded={true}>
        <EventsList cms={cms} />
      </ModalBody>
    </FullscreenModal>
  </Modal>
);

export const SyncStatusButton = ({
  cms,
  setEventsOpen,
  ...buttonProps
}: {
  cms: TinaCMS;
  setEventsOpen: (open: boolean) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const syncStatus = useSyncStatus(cms);

  if (cms.api?.tina?.isCustomContentApi) {
    return null;
  }

  return (
    <>
      <button onClick={() => setEventsOpen(true)} {...buttonProps}>
        {syncStatus.state !== 'error' ? (
          <TbLogs className='w-6 h-auto mr-2' />
        ) : (
          <MdSyncProblem className='w-6 h-auto mr-2 text-red-400' />
        )}{' '}
        Event Log
      </button>
    </>
  );
};
