import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from 'lucide-react';
import { BiFile, BiMovie } from 'react-icons/bi';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnFiltersState,
  ColumnDef,
  ExpandedState,
  FilterFn,
  Row,
  SortingState,
} from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '../../../fields/plugins/mdx-field-plugin/plate/components/plate-ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import type { DocumentReference, MediaUsage } from './media-usage-scanner';
import { MEDIA_USAGE_THUMBNAIL_KEY } from './media-usage-thumbnails';

const INFINITE_SCROLL_PAGE_SIZE = 10;

type MediaFilterType = 'all' | 'image' | 'video' | 'other';
type UsageFilterType = 'all' | 'used' | 'unused';

const DEFAULT_COLUMN_FILTERS: ColumnFiltersState = [
  { id: 'type', value: 'all' satisfies MediaFilterType },
  { id: 'usage', value: 'all' satisfies UsageFilterType },
];

const getUsageCount = (item: MediaUsage) => item.usedIn.length;

const SortIcon = ({ sorted }: { sorted: false | 'asc' | 'desc' }) => {
  if (sorted === 'asc') return <ArrowUp className='ml-2 h-4 w-4' />;
  if (sorted === 'desc') return <ArrowDown className='ml-2 h-4 w-4' />;
  return <ArrowUpDown className='ml-2 h-4 w-4' />;
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
      const usageCount = getUsageCount(row.original);
      const isExpanded = row.getIsExpanded();
      const thumbnailSrc = media.thumbnails?.[MEDIA_USAGE_THUMBNAIL_KEY];

      return (
        <div className='flex items-center gap-2'>
          {usageCount > 0 ? (
            <button
              type='button'
              onClick={(event) => {
                event.stopPropagation();
                row.toggleExpanded();
              }}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                isExpanded
                  ? 'border-tina-orange bg-white text-tina-orange'
                  : 'border-tina-orange bg-tina-orange text-white'
              }`}
              title='View where this file is used'
              aria-label={`Toggle usage references for ${row.original.media.filename}`}
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          ) : (
            <span className='block h-5 w-5 shrink-0' aria-hidden='true' />
          )}
          <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-100 text-gray-400'>
            {type === 'image' && thumbnailSrc ? (
              <img
                src={thumbnailSrc}
                alt={media.filename}
                loading='lazy'
                decoding='async'
                className='h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-80'
                onClick={(event) => {
                  event.stopPropagation();
                  onPreview?.(row.original);
                }}
              />
            ) : type === 'video' ? (
              <button
                type='button'
                title='Preview video'
                className='flex h-full w-full cursor-pointer items-center justify-center text-gray-400 transition-opacity hover:opacity-80'
                onClick={(event) => {
                  event.stopPropagation();
                  onPreview?.(row.original);
                }}
              >
                <BiMovie className='text-3xl' />
              </button>
            ) : (
              <BiFile className='text-3xl' />
            )}
          </div>
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
          className='font-medium text-muted-foreground flex items-center gap-1'
          onClick={column.getToggleSortingHandler()}
        >
          Filename
          <SortIcon sorted={sorted} />
        </button>
      );
    },
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span className='block w-full truncate font-medium text-gray-800'>
              {row.original.media.filename}
            </span>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side='top' className='max-w-sm break-all shadow-md'>
              {row.original.media.filename}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
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
          className='font-medium text-muted-foreground flex items-center gap-1'
          onClick={column.getToggleSortingHandler()}
        >
          Directory
          <SortIcon sorted={sorted} />
        </button>
      );
    },
    cell: ({ getValue }) => {
      const directory = getValue() as string;

      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className='block w-full truncate text-sm text-gray-500'>
                {directory}
              </span>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side='top'
                className='max-w-sm break-all shadow-md'
              >
                {directory}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: 'usage',
    accessorFn: getUsageCount,
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type='button'
          className='font-medium text-muted-foreground ml-auto flex items-center gap-1'
          onClick={column.getToggleSortingHandler()}
        >
          Usage
          <SortIcon sorted={sorted} />
        </button>
      );
    },
    cell: ({ row }) => {
      const count = getUsageCount(row.original);

      return (
        <span
          className={`inline-block min-w-[3rem] text-right ${
            count > 0 ? 'font-medium text-gray-800' : 'text-gray-500'
          }`}
        >
          {count}
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
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [visibleCount, setVisibleCount] = useState(INFINITE_SCROLL_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    getRowId: (row) => row.media.src,
    initialState: { columnVisibility: { type: false } },
    state: { sorting, columnFilters, expanded },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => getUsageCount(row.original) > 0,
  });

  const handleTypeFilterChange = (value: MediaFilterType) => {
    setExpanded({});
    setVisibleCount(INFINITE_SCROLL_PAGE_SIZE);
    table.getColumn('type')?.setFilterValue(value);
  };

  const handleUsageFilterChange = (value: UsageFilterType) => {
    setExpanded({});
    setVisibleCount(INFINITE_SCROLL_PAGE_SIZE);
    table.getColumn('usage')?.setFilterValue(value);
  };

  // Reset visible count when sorting changes
  useEffect(() => {
    setVisibleCount(INFINITE_SCROLL_PAGE_SIZE);
  }, [sorting]);

  const allRows = table.getRowModel().rows;
  // slice is safe to over-index, if visibleCount exceeds allRows.length it simply returns all rows
  const visibleRows = allRows.slice(0, visibleCount);
  const hasMore = visibleCount < allRows.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + INFINITE_SCROLL_PAGE_SIZE);
  }, []);

  // IntersectionObserver to trigger loading more rows
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!sentinel || !scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { root: scrollContainer, rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  const filteredRowCount = table.getFilteredRowModel().rows.length;

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
      <div className='flex items-center gap-3 border-b border-gray-200 bg-gray-50/50 px-6 py-4'>
        <h3 className='whitespace-nowrap text-lg font-semibold text-gray-800'>
          Media Inventory
        </h3>
        <MediaFilters
          filteredRowCount={filteredRowCount}
          typeFilter={typeFilter}
          usageFilter={usageFilter}
          setTypeFilter={handleTypeFilterChange}
          setUsageFilter={handleUsageFilterChange}
          className='ml-auto'
        />
      </div>
      <div ref={scrollContainerRef} className='max-h-[45vh] overflow-auto'>
        <Table
          className='border-separate border-spacing-0'
          wrapperClassName='overflow-visible'
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`sticky top-0 z-20 border-b border-gray-200 bg-white ${
                      header.column.id === 'preview'
                        ? 'w-[4rem] pl-9'
                        : header.column.id === 'filename'
                          ? 'w-[20rem]'
                          : header.column.id === 'directory'
                            ? 'w-[14rem]'
                            : header.column.id === 'usage'
                              ? 'w-[5.5rem]'
                              : ''
                    }`}
                  >
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
            {allRows.length === 0 ? (
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
              visibleRows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    style={{ contentVisibility: 'auto' }}
                    onClick={
                      getUsageCount(row.original) > 0
                        ? row.getToggleExpandedHandler()
                        : undefined
                    }
                    className={
                      getUsageCount(row.original) > 0
                        ? row.getIsExpanded()
                          ? 'cursor-pointer bg-[#FFF8F6] hover:bg-[#FFF8F6]'
                          : 'cursor-pointer'
                        : ''
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === 'preview'
                            ? '!px-2 !py-1.5 w-[4rem]'
                            : cell.column.id === 'filename'
                              ? '!px-3 !py-1.5 w-[20rem] max-w-0 overflow-hidden'
                              : cell.column.id === 'directory'
                                ? '!px-3 !py-1.5 w-[14rem] max-w-0 overflow-hidden'
                                : cell.column.id === 'usage'
                                  ? '!pl-2 !pr-4 !py-1.5 w-[5.5rem] text-sm font-medium text-right whitespace-nowrap'
                                  : '!px-3 !py-1.5'
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className='border-b border-gray-150 bg-[#FFEBE5]'
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
        {hasMore && (
          <div ref={sentinelRef} className='h-px' aria-hidden='true' />
        )}
      </div>
    </div>
  );
};

const MediaFilters = ({
  filteredRowCount,
  typeFilter,
  usageFilter,
  setTypeFilter,
  setUsageFilter,
  className,
}: {
  filteredRowCount: number;
  typeFilter: MediaFilterType;
  usageFilter: UsageFilterType;
  setTypeFilter: (value: MediaFilterType) => void;
  setUsageFilter: (value: UsageFilterType) => void;
  className?: string;
}) => (
  <div className={`flex items-center gap-3 ${className ?? ''}`}>
    <span className='text-xs text-gray-500 whitespace-nowrap'>
      {filteredRowCount} {filteredRowCount === 1 ? 'result' : 'results'}
    </span>
    <Select
      value={typeFilter}
      onValueChange={(value) => setTypeFilter(value as MediaFilterType)}
    >
      <SelectTrigger
        aria-label='Filter by media type'
        className='w-[130px] bg-white border-gray-200 text-gray-700 h-9'
      >
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
      <SelectTrigger
        aria-label='Filter by usage status'
        className='w-[130px] bg-white border-gray-200 text-gray-700 h-9'
      >
        <SelectValue placeholder='All Usage' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All Usage</SelectItem>
        <SelectItem value='used'>Used</SelectItem>
        <SelectItem value='unused'>Unused</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const ExpandedRowContent = ({
  usedIn,
  onClose,
}: {
  usedIn: DocumentReference[];
  onClose?: () => void;
}) => {
  const documentCount = usedIn.length;
  const sortedDocs = [...usedIn].sort((a, b) =>
    a.collectionLabel.localeCompare(b.collectionLabel)
  );

  return (
    <>
      <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
        Used in {documentCount} document{documentCount !== 1 ? 's' : ''}:
      </p>
      <table className='w-full text-xs border-collapse'>
        <thead>
          <tr className='text-left text-[10px] font-bold uppercase tracking-tight text-gray-400'>
            <th className='pb-1.5 pr-6 w-40'>Collection</th>
            <th className='pb-1.5'>Document</th>
          </tr>
        </thead>
        <tbody>
          {sortedDocs.map((doc) => {
            const breadcrumb = doc.breadcrumbs.join('/');
            return (
              <tr
                key={doc.editUrl || breadcrumb}
                className='border-t border-gray-150'
              >
                <td className='py-1.5 pr-6 text-gray-500'>
                  <a
                    href={`#/collections/${doc.collectionName}/~`}
                    onClick={() => onClose?.()}
                    className='underline hover:text-tina-orange-dark transition-colors'
                  >
                    {doc.collectionLabel}
                  </a>
                </td>
                <td className='py-1.5 text-gray-700'>
                  <span className='flex items-center gap-1.5'>
                    <BiFile className='text-gray-400 flex-shrink-0' />
                    {doc.editUrl ? (
                      <a
                        href={doc.editUrl}
                        onClick={() => onClose?.()}
                        className='underline hover:text-tina-orange-dark transition-colors break-all'
                      >
                        {breadcrumb}
                      </a>
                    ) : (
                      <span className='break-all'>{breadcrumb}</span>
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
