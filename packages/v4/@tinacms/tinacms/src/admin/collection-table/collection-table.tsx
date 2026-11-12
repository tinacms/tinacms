import { Badge } from '@tinacms/ui/components/badge';
import { Breadcrumb } from '@tinacms/ui/components/breadcrumb';
import { Button } from '@tinacms/ui/components/button';
import {
  type DataTableCell,
  type DataTableColumn,
  type DataTableRow,
  DataTable,
} from '@tinacms/ui/components/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { EmptyState } from '@tinacms/ui/components/empty-state';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { Segmented } from '@tinacms/ui/components/segmented';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tinacms/ui/components/select';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ContentError, type ListQuery } from '../../core/content/contract';
import {
  useCollectionActions,
  useCollectionCapabilities,
  useDocumentsPage,
  useDraftCounts,
  useNewDocumentDrafts,
} from '../../editor';
import { useUnsavedFormIds } from '../../form/form-store';
import { exactTimeOf, relativeTimeOf } from '../../plugins/home/recent-rows';
import { useTinaSchema } from '../hooks';
import { formatAdminRoute } from '../routing';
import { useAdminRoute } from '../use-admin-route';
import {
  DeleteDocumentDialog,
  DeleteFolderDialog,
  type FocusTarget,
  NameDialog,
} from './dialogs';
import {
  DEFAULT_SERVER_SORT,
  DEFAULT_SORT,
  type DocumentRow,
  FILTER_DELAY_MS,
  type FolderRow,
  NEW_DOCUMENT_PBI,
  PAGE_SIZE,
  type SortKey,
  type SortState,
  type StatusView,
  type TableRow,
  buildRows,
  countsOf,
  joinFolder,
  namePartsOf,
  nextSort,
  parentFolderOf,
  serverSortOf,
} from './table-model';

type Pending =
  | { kind: 'rename'; row: DocumentRow }
  | { kind: 'duplicate'; row: DocumentRow }
  | { kind: 'delete'; row: DocumentRow }
  | { kind: 'new-folder' }
  | { kind: 'rename-folder'; row: FolderRow }
  | { kind: 'delete-folder'; row: FolderRow };

const GENERIC_FAILURE = 'Something went wrong. Please try again.';
const SKELETON_ROWS = 6;

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

const useDebounced = <Value,>(value: Value, delay: number): Value => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
};

const rowTriggers = () => [
  ...document.querySelectorAll<HTMLElement>('[data-row-actions]'),
];

const triggerOfRow = (key: string): HTMLElement | null =>
  rowTriggers().find((element) => element.dataset.rowActions === key) ?? null;

const SORT_OPTIONS: { value: string; label: string; sort: SortState }[] = [
  {
    value: 'title:asc',
    label: 'Title, A to Z',
    sort: { key: 'title', direction: 'asc' },
  },
  {
    value: 'title:desc',
    label: 'Title, Z to A',
    sort: { key: 'title', direction: 'desc' },
  },
  {
    value: 'updated:desc',
    label: 'Last edited, newest first',
    sort: { key: 'updated', direction: 'desc' },
  },
  {
    value: 'updated:asc',
    label: 'Last edited, oldest first',
    sort: { key: 'updated', direction: 'asc' },
  },
  {
    value: 'status:asc',
    label: 'Status, saved first',
    sort: { key: 'status', direction: 'asc' },
  },
  {
    value: 'status:desc',
    label: 'Status, unsaved first',
    sort: { key: 'status', direction: 'desc' },
  },
];

const STATUS_OPTIONS: readonly { value: StatusView; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unsaved', label: 'Unsaved' },
  { value: 'saved', label: 'Saved' },
];

function LastEdited({ row, now }: { row: DocumentRow; now: number }) {
  if (!row.updatedAt) return null;
  return (
    <span className='text-sm whitespace-nowrap text-muted-foreground'>
      <time
        dateTime={row.updatedAt.toISOString()}
        title={exactTimeOf(row.updatedAt)}
      >
        {relativeTimeOf(row.updatedAt, now)}
      </time>
      {row.author ? ` by ${row.author}` : ''}
    </span>
  );
}

interface RowMenuProps {
  rowKey: string;
  label: string;
  items: ReactNode;
}

// Hidden until the row is hovered or holds focus; always shown where nothing hovers.
const MENU_CELL =
  'relative z-10 flex justify-end opacity-0 focus-within:opacity-100 has-data-popup-open:opacity-100 [tr:focus-within_&]:opacity-100 [tr:hover_&]:opacity-100 [@media(hover:none)]:opacity-100';

function RowMenu({ rowKey, label, items }: RowMenuProps) {
  return (
    <div className={MENU_CELL}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='icon'
              size='sm'
              icon='more'
              data-row-actions={rowKey}
            />
          }
          aria-label={`Actions for ${label}`}
        />
        <DropdownMenuContent align='end' aria-label={`Actions for ${label}`}>
          {items}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SelectChoice<Value extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (next: Value) => void;
  className?: string;
}) {
  return (
    <Select
      items={[...options]}
      value={value}
      onValueChange={(next) => {
        const chosen = options.find((option) => option.value === next);
        if (chosen) onChange(chosen.value);
      }}
    >
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface TableBodyProps {
  collection: string;
  folder: string;
  headerAction?: ReactElement;
  onClose?: () => void;
}

function CollectionTableBody({
  collection,
  folder,
  headerAction,
  onClose,
}: TableBodyProps) {
  const tier = useTier();
  const { navigate } = useAdminRoute();
  const schema = useTinaSchema();
  const label =
    schema.collections.find((candidate) => candidate.name === collection)
      ?.label ?? collection;
  const caps = useCollectionCapabilities(collection, folder);
  const actions = useCollectionActions(collection);
  const drafts = useDraftCounts(collection);
  const copies = useNewDocumentDrafts(collection, folder);
  const unsavedIds = new Set<string>(useUnsavedFormIds());

  const [filterText, setFilterText] = useState('');
  const filter = useDebounced(filterText, FILTER_DELAY_MS);
  const [view, setView] = useState<StatusView>('all');
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [serverSort, setServerSort] = useState(DEFAULT_SERVER_SORT);
  const scope = `${filter}|${serverSort.by}|${serverSort.direction}`;
  const [pages, setPages] = useState<{ scope: string; after: string[] }>({
    scope,
    after: [],
  });
  const after = pages.scope === scope ? pages.after : [];
  const setAfter = (next: string[]) => setPages({ scope, after: next });

  const query: ListQuery = {
    folder,
    ...(filter === '' ? {} : { filter }),
    sort: serverSort,
    first: PAGE_SIZE,
    ...(after.length === 0 ? {} : { after: after.at(-1) }),
  };
  const page = useDocumentsPage(collection, query);
  const connection = page.data;
  const isFirstPage = after.length === 0;

  useEffect(() => {
    if (!connection || page.isFetching || after.length === 0) return;
    if (connection.edges.length === 0)
      setPages({ scope, after: after.slice(0, -1) });
  }, [connection, page.isFetching, after, scope]);

  const error = page.error;
  useEffect(() => {
    if (
      error instanceof ContentError &&
      error.code === 'validation' &&
      after.length > 0
    ) {
      setPages({ scope, after: [] });
    }
  }, [error, after.length, scope]);

  const [dialog, setDialog] = useState<{
    pending: Pending;
    open: boolean;
  } | null>(null);
  const afterDelete = useRef<string | null>(null);
  const deleted = useRef(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const newButton = useRef<HTMLButtonElement>(null);

  const rows = buildRows({
    connection,
    copyPaths: copies.map((copy) => copy.path),
    unsavedIds,
    isFirstPage,
    filter,
    view,
    sort,
  });
  const counts = countsOf(
    connection,
    copies.map((copy) => copy.path),
    unsavedIds,
    isFirstPage
  );

  const pageCount = Math.max(
    1,
    Math.ceil((connection?.totalCount ?? 0) / PAGE_SIZE)
  );
  const pageNumber = after.length + 1;
  const now = Date.now();

  const open = (pending: Pending) => setDialog({ pending, open: true });
  const close = () =>
    setDialog((current) => (current ? { ...current, open: false } : null));

  const headingTarget = (): HTMLElement | null => {
    const heading = headerRef.current?.querySelector('h2') ?? null;
    heading?.setAttribute('tabindex', '-1');
    return heading;
  };
  const afterRowAction =
    (key: string): FocusTarget =>
    () =>
      triggerOfRow(key) ?? headingTarget();
  const afterDeleteTarget =
    (rowKey: string): FocusTarget =>
    () => {
      if (!deleted.current) return afterRowAction(rowKey)();
      const key = afterDelete.current;
      if (key === null) return headingTarget();
      const next = triggerOfRow(key)?.closest('tr')?.querySelector('button');
      return next ?? headingTarget();
    };

  const openDocument = (path: string) =>
    navigate({ view: 'document', collection, path });
  const openFolder = (path: string) =>
    navigate({ view: 'folder', collection, folder: path });

  const rowMenuOf = (row: TableRow): ReactNode => {
    if (row.kind === 'document') {
      if (row.isCopy) return null;
      const items: ReactNode[] = [];
      if (caps.canRename) {
        items.push(
          <DropdownMenuItem
            key='rename'
            icon='edit'
            onClick={() => open({ kind: 'rename', row })}
          >
            Rename
          </DropdownMenuItem>
        );
      }
      if (caps.canDuplicate) {
        items.push(
          <DropdownMenuItem
            key='duplicate'
            icon='doc-new'
            onClick={() => open({ kind: 'duplicate', row })}
          >
            Duplicate
          </DropdownMenuItem>
        );
      }
      if (caps.canDelete) {
        items.push(
          <DropdownMenuItem
            key='delete'
            variant='destructive'
            onClick={() => {
              const index = rows.findIndex(
                (candidate) => candidate.key === row.key
              );
              afterDelete.current = rows[index + 1]?.key ?? null;
              deleted.current = false;
              open({ kind: 'delete', row });
            }}
          >
            Delete
          </DropdownMenuItem>
        );
      }
      return items.length === 0 ? null : (
        <RowMenu rowKey={row.key} label={row.name} items={items} />
      );
    }
    const items: ReactNode[] = [];
    if (caps.canRename) {
      items.push(
        <DropdownMenuItem
          key='rename'
          icon='edit'
          onClick={() => open({ kind: 'rename-folder', row })}
        >
          Rename
        </DropdownMenuItem>
      );
    }
    if (caps.canDelete) {
      items.push(
        <DropdownMenuItem
          key='delete'
          variant='destructive'
          onClick={() => {
            const index = rows.findIndex(
              (candidate) => candidate.key === row.key
            );
            afterDelete.current = rows[index + 1]?.key ?? null;
            deleted.current = false;
            open({ kind: 'delete-folder', row });
          }}
        >
          Delete
        </DropdownMenuItem>
      );
    }
    return items.length === 0 ? null : (
      <RowMenu rowKey={row.key} label={row.folder.name} items={items} />
    );
  };

  const wide = tier === 'desktop';
  const sortOf = (key: SortKey) => (sort.key === key ? sort.direction : 'none');
  const press = (key: SortKey) => () => {
    const next = nextSort(sort, key);
    setSort(next);
    setServerSort(serverSortOf(next, serverSort));
  };

  const columns: DataTableColumn[] = wide
    ? [
        {
          key: 'title',
          label: 'Title',
          sort: sortOf('title'),
          onSort: press('title'),
        },
        {
          key: 'status',
          label: 'Status',
          className: 'w-37.5',
          sort: sortOf('status'),
          onSort: press('status'),
        },
        {
          key: 'updated',
          label: 'Last edited',
          align: 'right',
          className: 'w-55',
          sort: sortOf('updated'),
          onSort: press('updated'),
        },
        {
          key: 'actions',
          label: 'Actions',
          className: 'w-12 text-transparent',
        },
      ]
    : [
        { key: 'title', label: 'Title' },
        {
          key: 'actions',
          label: 'Actions',
          className: 'w-12 text-transparent',
        },
      ];

  const menuCell = (row: TableRow): DataTableCell | undefined => {
    const menu = rowMenuOf(row);
    return menu ? { type: 'node', node: menu } : undefined;
  };

  const wideRow = (row: TableRow): DataTableRow => {
    if (row.kind === 'folder') {
      return {
        id: row.key,
        cells: {
          title: {
            type: 'link',
            icon: 'folder',
            text: `${row.folder.name}/`,
            mono: true,
            onClick: () => openFolder(row.folder.path),
          },
          status: {
            type: 'muted',
            text: plural(row.folder.documentCount, 'document', 'documents'),
          },
          actions: menuCell(row),
        },
      };
    }
    return {
      id: row.key,
      cells: {
        title: {
          type: 'link',
          icon: 'doc',
          text: row.name,
          onClick: () => openDocument(row.path),
        },
        status: row.unsaved
          ? { type: 'badge', kind: 'unsaved', text: 'Unsaved' }
          : { type: 'muted', text: 'Saved' },
        updated: { type: 'node', node: <LastEdited row={row} now={now} /> },
        actions: menuCell(row),
      },
    };
  };

  const listRow = (row: TableRow): DataTableRow => {
    const folderRow = row.kind === 'folder';
    const name = folderRow ? `${row.folder.name}/` : row.name;
    const second = folderRow ? (
      <span className='text-sm text-muted-foreground'>
        {plural(row.folder.documentCount, 'document', 'documents')}
      </span>
    ) : (
      <LastEdited row={row} now={now} />
    );
    return {
      id: row.key,
      cells: {
        title: {
          type: 'node',
          node: (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='flex min-w-0 items-center gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    folderRow
                      ? openFolder(row.folder.path)
                      : openDocument(row.path)
                  }
                  className="min-w-0 cursor-pointer rounded-xs border-0 bg-transparent p-0 text-left font-sans text-base leading-control font-medium text-foreground outline-none after:absolute after:inset-0 after:content-[''] focus-visible:shadow-focus-ring"
                >
                  {name}
                </button>
                {!folderRow && row.unsaved ? (
                  <Badge kind='unsaved'>Unsaved</Badge>
                ) : null}
              </span>
              {second}
            </div>
          ),
        },
        actions: menuCell(row),
      },
    };
  };

  const skeletonRows: DataTableRow[] = Array.from(
    { length: SKELETON_ROWS },
    (_, index) => ({
      id: `loading-${index}`,
      cells: Object.fromEntries(
        columns
          .filter((column) => column.key !== 'actions')
          .map((column): [string, DataTableCell] => [
            column.key,
            { type: 'node', node: <Skeleton className='h-4 w-2/3' /> },
          ])
      ),
    })
  );

  const isLoading = page.isPending;
  let folderMissing = false;
  if (error instanceof ContentError && folder !== '') {
    folderMissing = error.code === 'not-found' || error.code === 'invalid-path';
  }

  const viewCount = counts[view];
  const emptyText = (() => {
    if (error instanceof ContentError) return error.message;
    if (error) return GENERIC_FAILURE;
    if (filterText !== '') return `No documents match “${filterText}”.`;
    if (view !== 'all') return `No ${view} documents on this page.`;
    const where = folder === '' ? label : (folder.split('/').at(-1) ?? folder);
    return `No documents in ${where} yet.`;
  })();

  const breadcrumb =
    folder === '' ? null : (
      <Breadcrumb
        aria-label='Folder path'
        items={[
          {
            label,
            onClick: () => navigate({ view: 'collection', collection }),
          },
          ...folder.split('/').map((part, index, parts) => ({
            label: part,
            current: index === parts.length - 1,
            onClick:
              index === parts.length - 1
                ? undefined
                : () =>
                    navigate({
                      view: 'folder',
                      collection,
                      folder: parts.slice(0, index + 1).join('/'),
                    }),
          })),
        ]}
      />
    );

  const newMenu =
    caps.canCreateDocument || caps.canCreateFolder ? (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              ref={newButton}
              variant='primary'
              icon='plus'
              full={tier === 'phone'}
            />
          }
        >
          New
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' aria-label='New'>
          {caps.canCreateDocument ? (
            <Tooltip>
              <TooltipTrigger
                render={<DropdownMenuItem disabled icon='doc-new' />}
              >
                Document
              </TooltipTrigger>
              <TooltipContent side='right'>
                {`New document is not available yet. It arrives with ${NEW_DOCUMENT_PBI}.`}
              </TooltipContent>
            </Tooltip>
          ) : null}
          {caps.canCreateFolder ? (
            <DropdownMenuItem
              icon='folder'
              onClick={() => open({ kind: 'new-folder' })}
            >
              Folder
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

  const filterControls = (
    <>
      <SearchBox
        label='Filter by title or filename'
        value={filterText}
        onChange={(event) => setFilterText(event.target.value)}
        onClear={() => setFilterText('')}
        className={
          tier === 'desktop'
            ? 'w-70 max-w-full'
            : tier === 'phone'
              ? 'min-w-0 basis-full'
              : 'min-w-0 flex-1'
        }
      />
      {tier === 'phone' ? (
        <SelectChoice<StatusView>
          label='Filter by status'
          value={view}
          options={STATUS_OPTIONS}
          onChange={setView}
          className='w-28'
        />
      ) : (
        <Segmented
          aria-label='Filter by status'
          size='sm'
          options={STATUS_OPTIONS}
          value={view}
          onValueChange={setView}
        />
      )}
      {wide ? null : (
        <SelectChoice
          label='Sort by'
          value={`${sort.key}:${sort.direction}`}
          options={SORT_OPTIONS}
          onChange={(next) => {
            const chosen = SORT_OPTIONS.find((option) => option.value === next);
            if (!chosen) return;
            setSort(chosen.sort);
            setServerSort(serverSortOf(chosen.sort, serverSort));
          }}
        />
      )}
      <span
        aria-live='polite'
        className='ml-auto text-sm whitespace-nowrap text-muted-foreground tabular-nums'
      >
        {plural(viewCount, 'document', 'documents')}
      </span>
    </>
  );

  const showPager = pageCount > 1 || after.length > 0;

  const dialogs = dialog ? renderDialog(dialog) : null;

  function renderDialog({ pending, open: isOpen }: NonNullable<typeof dialog>) {
    if (pending.kind === 'new-folder') {
      return (
        <NameDialog
          open={isOpen}
          title='New folder'
          label='Folder name'
          confirmLabel='Create folder'
          initialName=''
          onSubmit={async (name) => {
            await actions.createFolder(joinFolder(folder, name));
          }}
          onClose={close}
          focusAfter={() => newButton.current ?? headingTarget()}
        />
      );
    }
    if (pending.kind === 'rename' || pending.kind === 'duplicate') {
      const { row } = pending;
      const parts = namePartsOf(row.path);
      const isRename = pending.kind === 'rename';
      return (
        <NameDialog
          open={isOpen}
          title={`${isRename ? 'Rename' : 'Duplicate'} “${row.name}”`}
          description={
            isRename
              ? "The file name is part of the document's address."
              : 'The copy is a new document with everything the original has. Nothing is written until you save it.'
          }
          label={isRename ? 'File name' : 'File name for the copy'}
          confirmLabel={isRename ? 'Rename' : 'Duplicate'}
          initialName={isRename ? parts.stem : `${parts.stem}-copy`}
          extension={parts.extension}
          onSubmit={async (name) => {
            const to = `${parts.dir}${name}${parts.extension}`;
            if (isRename) {
              if (to !== row.path) await actions.renameDocument(row.path, to);
              return;
            }
            await actions.duplicateDocument(row.path, to);
            openDocument(to);
          }}
          onClose={close}
          focusAfter={afterRowAction(row.key)}
        />
      );
    }
    if (pending.kind === 'delete') {
      const { row } = pending;
      return (
        <DeleteDocumentDialog
          open={isOpen}
          path={row.path}
          hasDraft={row.unsaved}
          referrersOf={actions.referrersOf}
          deleteDocument={actions.deleteDocument}
          onGone={() => void page.refetch()}
          onDeleted={() => {
            deleted.current = true;
          }}
          onClose={close}
          focusAfter={afterDeleteTarget(row.key)}
        />
      );
    }
    if (pending.kind === 'rename-folder') {
      const { row } = pending;
      return (
        <NameDialog
          open={isOpen}
          title={`Rename “${row.folder.name}/”`}
          label='Folder name'
          confirmLabel='Rename'
          initialName={row.folder.name}
          onSubmit={async (name) => {
            const to = joinFolder(parentFolderOf(row.folder.path), name);
            if (to !== row.folder.path) {
              await actions.renameFolder(row.folder.path, to);
            }
          }}
          onClose={close}
          focusAfter={afterRowAction(row.key)}
        />
      );
    }
    const { row } = pending;
    return (
      <DeleteFolderDialog
        open={isOpen}
        name={row.folder.name}
        path={row.folder.path}
        documentCount={row.folder.documentCount}
        draftCount={drafts.draftsUnder(row.folder.path)}
        deleteFolder={actions.deleteFolder}
        onDeleted={() => {
          deleted.current = true;
        }}
        onClose={close}
        focusAfter={afterDeleteTarget(row.key)}
      />
    );
  }

  return (
    <section
      aria-label={`${label} documents`}
      className='flex h-full min-h-0 flex-col bg-card'
    >
      <PanelHeader
        ref={headerRef}
        heading={label}
        action={headerAction}
        closeLabel={onClose ? 'Close' : undefined}
        onClose={onClose}
      />
      <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='min-w-0'>{breadcrumb}</div>
          {newMenu}
        </div>
        {folderMissing ? (
          <div className='flex flex-col items-start gap-2 rounded-md border border-border p-4'>
            <EmptyState variant='plain' text='Folder not found.' />
            <Button
              variant='ghost'
              icon='arrow-left'
              href={formatAdminRoute({ view: 'collection', collection })}
            >
              {`Back to ${label}`}
            </Button>
          </div>
        ) : (
          <>
            <DataTable
              caption={`${label} documents`}
              columns={columns}
              rows={
                isLoading
                  ? skeletonRows
                  : error
                    ? []
                    : rows.map(wide ? wideRow : listRow)
              }
              emptyText={emptyText}
              emptyActionLabel={error ? 'Retry' : undefined}
              onEmptyAction={error ? () => void page.refetch() : undefined}
              filter={filterControls}
              aria-busy={isLoading}
            />
            {showPager ? (
              <nav
                aria-label='Pages'
                className='flex items-center justify-between gap-3 text-sm text-muted-foreground'
              >
                <Button
                  size='sm'
                  icon='chevron-left'
                  disabled={after.length === 0}
                  focusableWhenDisabled
                  onClick={() => setAfter(after.slice(0, -1))}
                >
                  Previous
                </Button>
                <span aria-live='polite' className='tabular-nums'>
                  {`Page ${pageNumber} of ${pageCount}`}
                </span>
                <Button
                  size='sm'
                  iconEnd='chevron-right'
                  disabled={
                    !connection?.pageInfo.hasNextPage ||
                    !connection.pageInfo.endCursor
                  }
                  focusableWhenDisabled
                  onClick={() => {
                    const cursor = connection?.pageInfo.endCursor;
                    if (cursor) setAfter([...after, cursor]);
                  }}
                >
                  Next
                </Button>
              </nav>
            ) : null}
          </>
        )}
      </div>
      {dialogs}
    </section>
  );
}

/**
 * The documents of a collection folder as a table: folders first, then documents, with filter,
 * status views, sorting, paging and the row actions. State resets when the folder changes.
 * `headerAction` takes the shell's Restore button.
 */
export function CollectionTable({
  collection,
  folder,
  headerAction,
  onClose,
}: TableBodyProps) {
  return (
    <CollectionTableBody
      key={`${collection}/${folder}`}
      collection={collection}
      folder={folder}
      headerAction={headerAction}
      onClose={onClose}
    />
  );
}
