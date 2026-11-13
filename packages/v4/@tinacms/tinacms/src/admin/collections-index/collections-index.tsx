import {
  type DataTableCell,
  type DataTableRow,
  DataTable,
} from '@tinacms/ui/components/data-table';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import { useDocumentsPage } from '../../editor/collection-documents';
import type { CollectionSchema } from '../../core/schema/types';
import { useTinaSchema } from '../hooks';
import { useAdminRoute } from '../use-admin-route';

const COLUMNS = [
  { key: 'title', label: 'Title', className: 'w-2/5' },
  { key: 'description', label: 'Description', hideNarrow: true },
  { key: 'documents', label: 'Documents', align: 'right', className: 'w-40' },
] as const;

const countText = (total: number) =>
  total === 1 ? '1 document' : `${total} documents`;

function DocumentCount({ collection }: { collection: string }) {
  const { data, error, isPending } = useDocumentsPage(collection, {
    first: 1,
  });
  if (data) {
    return (
      <span className='text-sm text-muted-foreground tabular-nums'>
        {countText(data.totalCount)}
      </span>
    );
  }
  if (isPending) {
    return (
      <Skeleton
        role='status'
        aria-label={`Counting ${collection} documents`}
        className='ml-auto h-4 w-20'
      />
    );
  }
  let reason = 'The count failed to load.';
  if (error instanceof Error) {
    reason = error.message;
  }
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            tabIndex={0}
            className='text-sm text-muted-foreground underline decoration-dotted underline-offset-3'
          />
        }
      >
        Can’t count
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The maximised Collections view: every collection in schema order, each row
 * opening that collection's table.
 */
export function CollectionsIndex() {
  const { collections } = useTinaSchema();
  const { navigate } = useAdminRoute();
  const rows = collections.map(
    (collection: CollectionSchema): DataTableRow => ({
      id: collection.name,
      cells: {
        title: {
          type: 'link',
          icon: 'collection',
          text: collection.label ?? collection.name,
          onClick: () =>
            navigate({
              view: 'collection',
              collection: collection.name,
              maximised: true,
            }),
        },
        description: collection.description
          ? { type: 'muted', text: collection.description }
          : undefined,
        documents: {
          type: 'node',
          node: <DocumentCount collection={collection.name} />,
        } satisfies DataTableCell,
      },
    })
  );
  return (
    <section
      aria-label='Collections'
      className='flex h-full min-h-0 flex-col bg-card'
    >
      <PanelHeader
        heading='Collections'
        maximised
        onMaximise={() => navigate({ view: 'collections' })}
        closeLabel='Close'
        onClose={() => navigate({ view: 'home' })}
      />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='mx-auto w-full max-w-280 p-4'>
          <DataTable
            caption='Collections'
            columns={[...COLUMNS]}
            rows={rows}
            emptyText='No collections yet.'
          />
        </div>
      </div>
    </section>
  );
}
