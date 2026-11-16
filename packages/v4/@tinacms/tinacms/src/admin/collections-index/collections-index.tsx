import {
  type DataTableCell,
  type DataTableRow,
  DataTable,
} from '@tinacms/ui/components/data-table';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { useEffect, useRef } from 'react';
import { useDocumentsPage } from '../../editor/collection-documents';
import type { CollectionSchema } from '../../core/schema/types';
import { plural } from '../collection-table/table-model';
import { RowHint } from '../row-hint';
import { useTinaSchema } from '../hooks';
import { useAdminRoute } from '../use-admin-route';

const COLUMNS = [
  { key: 'title', label: 'Title', className: 'w-2/5' },
  { key: 'description', label: 'Description', hideNarrow: true },
  { key: 'documents', label: 'Documents', align: 'right', className: 'w-40' },
] as const;

function DocumentCount({
  collection,
  onOpen,
}: {
  collection: string;
  onOpen: () => void;
}) {
  const { data, error, isPending } = useDocumentsPage(collection, {
    first: 1,
  });
  if (data) {
    return (
      <span className='text-sm text-muted-foreground tabular-nums'>
        {plural(data.totalCount, 'document', 'documents')}
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
    <RowHint
      hint={reason}
      onOpen={onOpen}
      className='text-sm text-muted-foreground underline decoration-dotted underline-offset-3'
    >
      Can’t count
    </RowHint>
  );
}

/**
 * The maximised Collections view: every collection in schema order, each row
 * opening that collection's table.
 */
export function CollectionsIndex() {
  const { collections } = useTinaSchema();
  const { navigate } = useAdminRoute();
  const openCollection = (name: string) =>
    navigate({ view: 'collection', collection: name, maximised: true });
  const rows = collections.map(
    (collection: CollectionSchema): DataTableRow => ({
      id: collection.name,
      cells: {
        title: {
          type: 'link',
          icon: 'collection',
          text: collection.label ?? collection.name,
          onClick: () => openCollection(collection.name),
        },
        description: collection.description
          ? { type: 'muted', text: collection.description }
          : undefined,
        documents: {
          type: 'node',
          node: (
            <DocumentCount
              collection={collection.name}
              onOpen={() => openCollection(collection.name)}
            />
          ),
        } satisfies DataTableCell,
      },
    })
  );
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const heading = section.current?.querySelector('h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus();
  }, []);
  return (
    <section
      ref={section}
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
      <div className='min-h-0 flex-1 overflow-y-auto p-4 md:px-8 lg:px-20 lg:py-5'>
        <div className='mx-auto w-full max-w-280'>
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
