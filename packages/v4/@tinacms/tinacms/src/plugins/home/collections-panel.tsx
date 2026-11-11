import { EmptyState } from '@tinacms/ui/components/empty-state';
import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { ListRow } from '@tinacms/ui/components/list-row';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { TileGrid } from '@tinacms/ui/components/tile';
import { useTinaSchema } from '../../admin/hooks';
import { useAdminRoute } from '../../admin/use-admin-route';
import type { HomePanelContext } from '../../core/slot/contract';
import {
  type CollectionList,
  useCollectionLists,
} from '../../editor/collection-lists';

const countOf = (list: CollectionList | undefined): string | undefined => {
  if (list?.status !== 'ready') return undefined;
  const count = list.documents.length;
  return count === 1 ? '1 document' : `${count} documents`;
};

/** One tile per collection, in schema order. On a phone, one-line rows. */
export function CollectionsPanel({ tier }: HomePanelContext) {
  const { collections } = useTinaSchema();
  const { navigate } = useAdminRoute();
  const { lists } = useCollectionLists(collections.map(({ name }) => name));
  const entries = collections.map((collection, index) => ({
    name: collection.name,
    label: collection.label ?? collection.name,
    count: countOf(lists[index]),
    isLoading: lists[index]?.status === 'loading',
    open: () => navigate({ view: 'collection', collection: collection.name }),
  }));
  return (
    <HomePanelTray title='Collections' count={String(entries.length)}>
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
