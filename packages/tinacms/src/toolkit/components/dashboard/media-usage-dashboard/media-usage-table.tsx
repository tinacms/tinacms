import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from 'lucide-react';
import { BiFile, BiMovie } from 'react-icons/bi';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnFiltersState,
  ColumnDef,
  ExpandedState,
  FilterFn,
  PaginationState,
  Row,
  SortingState,
} from '@tanstack/react-table';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import type { DocumentReference, MediaUsage } from './media-usage-scanner';

type MediaFilterType = 'all' | 'image' | 'video' | 'other';
type UsageFilterType = 'all' | 'used' | 'unused';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_COLUMN_FILTERS: ColumnFiltersState = [
  { id: 'type', value: 'all' satisfies MediaFilterType },
  { id: 'usage', value: 'all' satisfies UsageFilterType },
];

const getUsageCount = (item: MediaUsage) => item.usedIn.length;

const resetExpandedState = (): ExpandedState => ({});

const resetPagination = (): PaginationState => ({
  pageIndex: DEFAULT_PAGE_INDEX,
  pageSize: DEFAULT_PAGE_SIZE,
});

const groupDocumentsByCollection = (usedIn: DocumentReference[]) => {
  const grouped = new Map<string, DocumentReference[]>();

  for (const doc of usedIn) {
    const existingDocs = grouped.get(doc.collectionName) ?? [];
    existingDocs.push(doc);
    grouped.set(doc.collectionName, existingDocs);
  }

  return grouped;
};

const mediaTypeFilterFn: FilterFn<MediaUsage> = (
  row: Row<MediaUsage>,
  _columnId: string,
  filterValue: MediaFilterType
) => {
  if (filterValue === 'all') return true;
  return row.original.type === filterValue;
};

const usageFilterFn: FilterFn<MediaUsage> = (
  row: Row<MediaUsage>,
  _columnId: string,
  filterValue: UsageFilterType
) => {
  if (filterValue === 'all') return true;
  const count = getUsageCount(row.original);
  if (filterValue === 'used') return count > 0;
  if (filterValue === 'unused') return count === 0;
  return true;
};

const getMediaColumns = (
  onPreview?: (item: MediaUsage) => void
): ColumnDef<MediaUsage>[] => [
  {
    // Hidden behavior-only column so TanStack can filter by media type.
    id: 'type',
    accessorFn: (row) => row.type,
    filterFn: mediaTypeFilterFn,
    enableSorting: false,
    header: () => null,
    cell: () => null,
  },
  {
    id: 'preview',
    header: () => (
      <span className='font-medium text-muted-foreground'>Preview</span>
    ),
    cell: ({ row }) => {
      const media = row.original.media;
      const type = row.original.type;

      return (
        <div className='w-12 h-12 rounded overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400'>
          {type !== 'image' ? (
            type === 'video' ? (
              <BiMovie className='text-3xl' />
            ) : (
              <BiFile className='text-3xl' />
            )
          ) : (
            <img
              src={media.thumbnails?.['75x75'] || media.src}
              alt={media.filename}
              className={`w-full h-full object-cover ${
                onPreview
                  ? 'cursor-pointer hover:opacity-80 transition-opacity'
                  : ''
              }`}
              onClick={() => onPreview?.(row.original)}
            />
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'filename',
    accessorFn: (row) => row.media.filename,
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type='button'
          className='font-medium text-muted-foreground !cursor-pointer flex items-center gap-1'
          onClick={column.getToggleSortingHandler()}
        >
          Filename
          {sorted === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : sorted === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4' />
          )}
        </button>
      );
    },
    cell: ({ row }) => (
      <span className='font-medium text-gray-800'>
        {row.original.media.filename}
      </span>
    ),
  },
  {
    id: 'directory',
    accessorFn: (row) => row.media.directory || '/',
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type='button'
          className='font-medium text-muted-foreground !cursor-pointer flex items-center gap-1'
          onClick={column.getToggleSortingHandler()}
        >
          Directory
          {sorted === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : sorted === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4' />
          )}
        </button>
      );
    },
    cell: ({ getValue }) => (
      <span className='text-sm text-gray-500'>{getValue() as string}</span>
    ),
  },
  {
    id: 'usage',
    accessorFn: getUsageCount,
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type='button'
          className='font-medium text-muted-foreground !cursor-pointer ml-auto flex items-center gap-1'
          onClick={column.getToggleSortingHandler()}
        >
          Usage Count
          {sorted === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : sorted === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const count = getUsageCount(row.original);
      const isExpanded = row.getIsExpanded();

      return count > 0 ? (
        <Button
          variant='default'
          size='sm'
          onClick={row.getToggleExpandedHandler()}
          className='rounded-full px-3 py-1 flex items-center gap-1 min-w-[3rem] justify-center ml-auto bg-tina-orange text-white hover:bg-tina-orange-dark'
          title='View where this file is used'
        >
          {count}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </Button>
      ) : (
        <span className='text-orange-800 rounded-full px-3 py-1 inline-block min-w-[3rem] text-center border border-orange-100 bg-orange-50 ml-auto'>
          0 (Unused)
        </span>
      );
    },
    filterFn: usageFilterFn,
  },
];

export const MediaUsageTable = ({
  mediaItems,
  onClose,
  onPreview,
}: {
  mediaItems: MediaUsage[];
  onClose?: () => void;
  onPreview: (item: MediaUsage) => void;
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    DEFAULT_COLUMN_FILTERS
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>(resetExpandedState);
  const [pagination, setPagination] =
    useState<PaginationState>(resetPagination);

  const columns = useMemo(() => getMediaColumns(onPreview), [onPreview]);

  const typeFilter =
    (columnFilters.find((filter) => filter.id === 'type')?.value as
      | MediaFilterType
      | undefined) ?? 'all';
  const usageFilter =
    (columnFilters.find((filter) => filter.id === 'usage')?.value as
      | UsageFilterType
      | undefined) ?? 'all';

  // Central TanStack state/config wiring
  const table = useReactTable({
    data: mediaItems,
    columns,
    initialState: { columnVisibility: { type: false } },
    state: { sorting, columnFilters, expanded, pagination },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => getUsageCount(row.original) > 0,
  });

  const handleTypeFilterChange = (value: MediaFilterType) => {
    setExpanded(resetExpandedState());
    table.getColumn('type')?.setFilterValue(value);
  };

  const handleUsageFilterChange = (value: UsageFilterType) => {
    setExpanded(resetExpandedState());
    table.getColumn('usage')?.setFilterValue(value);
  };

  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const { pageIndex } = table.getState().pagination;

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
      <div className='flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50/50 px-6 py-4'>
        <h3 className='text-lg font-semibold text-gray-800'>Media Inventory</h3>
        <MediaFilters
          typeFilter={typeFilter}
          usageFilter={usageFilter}
          setTypeFilter={handleTypeFilterChange}
          setUsageFilter={handleUsageFilterChange}
        />
      </div>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='!py-8 text-center text-gray-500'
                >
                  {mediaItems.length === 0
                    ? 'No media files found.'
                    : 'No media files match the current filters.'}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === 'usage'
                            ? 'text-sm font-medium text-right'
                            : cell.column.id === 'preview'
                              ? '!py-3'
                              : ''
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Detail-panel style expansion: render a second row that spans the table. */}
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className='border-b border-orange-100 bg-tina-orange/5'
                      >
                        <ExpandedRowContent
                          usedIn={row.original.usedIn}
                          onClose={onClose}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <TablePagination
          pageIndex={pageIndex}
          pageCount={pageCount}
          filteredRowCount={filteredRowCount}
          onPrevious={() => table.previousPage()}
          onNext={() => table.nextPage()}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
        />
      )}
    </div>
  );
};

const MediaFilters = ({
  typeFilter,
  usageFilter,
  setTypeFilter,
  setUsageFilter,
}: {
  typeFilter: MediaFilterType;
  usageFilter: UsageFilterType;
  setTypeFilter: (value: MediaFilterType) => void;
  setUsageFilter: (value: UsageFilterType) => void;
}) => (
  <div className='flex items-center gap-3'>
    <Select
      value={typeFilter}
      onValueChange={(value) => setTypeFilter(value as MediaFilterType)}
    >
      <SelectTrigger className='w-[130px] bg-white border-gray-200 text-gray-700 h-9'>
        <SelectValue placeholder='All Types' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All Types</SelectItem>
        <SelectItem value='image'>Images</SelectItem>
        <SelectItem value='video'>Videos</SelectItem>
        <SelectItem value='other'>Other</SelectItem>
      </SelectContent>
    </Select>
    <Select
      value={usageFilter}
      onValueChange={(value) => setUsageFilter(value as UsageFilterType)}
    >
      <SelectTrigger className='w-[130px] bg-white border-gray-200 text-gray-700 h-9'>
        <SelectValue placeholder='All Usage' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All Usage</SelectItem>
        <SelectItem value='used'>Used Only</SelectItem>
        <SelectItem value='unused'>Unused Only</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const TablePagination = ({
  pageIndex,
  pageCount,
  filteredRowCount,
  onPrevious,
  onNext,
  canPreviousPage,
  canNextPage,
}: {
  pageIndex: number;
  pageCount: number;
  filteredRowCount: number;
  onPrevious: () => void;
  onNext: () => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
}) => (
  <div className='px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between'>
    <span className='text-sm text-gray-500'>
      Page <span className='font-medium'>{pageIndex + 1}</span> of{' '}
      <span className='font-medium'>{pageCount}</span>
      <span className='ml-2 text-gray-400'>({filteredRowCount} results)</span>
    </span>
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={onPrevious}
        disabled={!canPreviousPage}
      >
        Previous
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={onNext}
        disabled={!canNextPage}
      >
        Next
      </Button>
    </div>
  </div>
);

const ExpandedRowContent = ({
  usedIn,
  onClose,
}: {
  usedIn: DocumentReference[];
  onClose?: () => void;
}) => {
  const count = usedIn.length;
  const groupedCollections = groupDocumentsByCollection(usedIn);

  return (
    <>
      <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
        Used in {count} document{count !== 1 ? 's' : ''}:
      </p>
      <div className='flex flex-wrap gap-3'>
        {[...groupedCollections].map(([collection, docs]) => {
          const collectionLabel = docs[0]?.collectionLabel || collection;
          return (
            <div
              key={collection}
              className='bg-white rounded-lg border border-orange-100 p-3 min-w-[200px]'
            >
              <h4 className='text-[10px] font-bold uppercase tracking-tight mb-2'>
                <a
                  href={`#/collections/${collection}/~`}
                  onClick={() => onClose?.()}
                  className='text-tina-orange-dark hover:text-tina-orange hover:underline transition-colors'
                >
                  {collectionLabel}
                </a>
              </h4>
              <ul className='space-y-1'>
                {docs.map((doc) => (
                  <li
                    key={doc.editUrl || doc.breadcrumbs.join('/')}
                    className='text-xs flex items-start gap-1.5 text-gray-700'
                  >
                    <BiFile className='text-gray-400 mt-0.5 flex-shrink-0' />
                    {doc.editUrl ? (
                      <a
                        href={doc.editUrl}
                        onClick={() => onClose?.()}
                        className='hover:text-tina-orange-dark hover:underline transition-colors break-all'
                      >
                        {doc.breadcrumbs.join('/')}
                      </a>
                    ) : (
                      <span className='break-all'>
                        {doc.breadcrumbs.join('/')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
};
