import { Announcement } from '@tinacms/ui/components/announcement';
import { EmptyState } from '@tinacms/ui/components/empty-state';
import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { ListRow } from '@tinacms/ui/components/list-row';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { TileGrid } from '@tinacms/ui/components/tile';
import type { Tier } from '@tinacms/ui/hooks/use-tier';
import { useEffect, useId, useRef, useState } from 'react';
import { useTinaSchema } from '../../admin/hooks';
import { useAdminRoute } from '../../admin/use-admin-route';
import {
  type CollectionList,
  useCollectionLists,
} from '../../editor/collection-lists';

const countOf = (list: CollectionList | undefined): string | undefined => {
  if (list?.status !== 'ready') return undefined;
  const count = list.documents.length;
  return count === 1 ? '1 document' : `${count} documents`;
};

export function CollectionsPanel({ tier }: { tier: Tier }) {
  const { collections } = useTinaSchema();
  const { navigate } = useAdminRoute();
  const { lists, retryFailed } = useCollectionLists(
    collections.map(({ name }) => name)
  );
  const hasFailed = lists.some(({ status }) => status === 'failed');
  const isLoading = lists.some(({ status }) => status === 'loading');
  const panelId = useId();
  const retried = useRef(false);
  const [back, setBack] = useState({ words: '', tries: 0 });
  const countWords = collections
    .map(
      (collection, index) =>
        `${collection.label ?? collection.name}, ${countOf(lists[index]) ?? ''}`
    )
    .join('. ');
  // Retry takes its own line away, so focus moves to the panel once the counts are in.
  useEffect(() => {
    if (hasFailed) retried.current = false;
    if (!retried.current || hasFailed || isLoading) return;
    retried.current = false;
    document.getElementById(panelId)?.focus({ preventScroll: true });
    setBack((was) => ({ words: countWords, tries: was.tries + 1 }));
  }, [hasFailed, isLoading, panelId, countWords]);
  const entries = collections.map((collection, index) => ({
    name: collection.name,
    label: collection.label ?? collection.name,
    count: countOf(lists[index]),
    isLoading: lists[index]?.status === 'loading',
    open: () => navigate({ view: 'collection', collection: collection.name }),
  }));
  return (
    <HomePanelTray
      id={panelId}
      title='Collections'
      count={String(entries.length)}
    >
      {back.tries ? (
        <Announcement words={back.words} sayAgain={back.tries} />
      ) : null}
      {hasFailed ? (
        <EmptyState
          variant='plain'
          align='left'
          live
          className='px-4 pt-1 pb-3'
          text="Couldn't load every document count."
          actionLabel='Retry'
          onAction={() => {
            retried.current = true;
            retryFailed();
          }}
        />
      ) : null}
      {entries.length === 0 ? (
        <EmptyState variant='plain' text='No collections yet.' />
      ) : tier === 'phone' ? (
        <ul
          aria-label='Collections'
          className='m-0 flex list-none flex-col gap-1 p-0'
        >
          {entries.map((entry) => (
            <li key={entry.name}>
              <ListRow
                icon='collection'
                title={entry.label}
                wrap
                aside={
                  entry.isLoading ? (
                    <Skeleton className='w-16' />
                  ) : entry.count ? (
                    <span className='whitespace-nowrap'>{entry.count}</span>
                  ) : undefined
                }
                onClick={entry.open}
              />
            </li>
          ))}
        </ul>
      ) : (
        <TileGrid
          label='Collections'
          tiles={entries.map((entry) => ({
            key: entry.name,
            title: entry.label,
            meta: entry.count,
            metaLoading: entry.isLoading,
            actionLabel: 'New',
            actionAria: `New ${entry.label} document`,
            actionDisabled: true,
            onOpen: entry.open,
          }))}
        />
      )}
    </HomePanelTray>
  );
}
