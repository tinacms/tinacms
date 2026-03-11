import React, { useMemo, useState, useEffect } from 'react';
import { Image, ImageOff, Database } from 'lucide-react';
import { BiFile } from 'react-icons/bi';
import {
  DashboardPage,
  DashboardLoadingState,
  DashboardErrorState,
  DashboardSection,
  InfoCard,
  RefreshButton,
} from '../dashboard-ui';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Button } from '../../ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  SortingState,
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
} from '@tanstack/react-table';

import type { MediaUsage, DocumentReference } from './media-usage-scanner';
import { useMediaUsage } from './useMediaUsage';
import {
  getMediaColumns,
  type MediaFilterType,
  type UsageFilterType,
} from './media-table-columns';

/**
 * Media Usage Dashboard component that displays media files and their usage across the CMS
 */
export const MediaUsageDashboard = ({ close }: { close?: () => void }) => {
  const { mediaItems, isLoading, errorOccurred, refresh } = useMediaUsage();

  // State for the image preview lightbox
  const [lightboxImage, setLightboxImage] = useState<MediaUsage | null>(null);

  // Filter dropdowns state
  const [typeFilter, setTypeFilter] = useState<MediaFilterType>('all');
  const [usageFilter, setUsageFilter] = useState<UsageFilterType>('all');

  // TanStack table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Sync dropdown filters to TanStack column filters, reset pagination and collapse rows when filters or sorting change
  useEffect(() => {
    setColumnFilters([
      { id: 'filename', value: typeFilter },
      { id: 'usage', value: usageFilter },
    ]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setExpanded({});
  }, [typeFilter, usageFilter, sorting]);

  // Listen for the escape key to close the lightbox
  useEffect(() => {
    if (!lightboxImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  // Column definitions
  const columns = useMemo(() => getMediaColumns(setLightboxImage), []);

  // TanStack table instance
  const table = useReactTable({
    data: mediaItems,
    columns,
    state: { sorting, columnFilters, expanded, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.count > 0,
  });

  // Memoized statistics for the info cards at the top of the dashboard
  const stats = useMemo(() => {
    return mediaItems.reduce(
      (acc, usage) => {
        if (usage.count === 0) {
          acc.unusedCount++;
        } else {
          acc.usedCount++;
        }
        return acc;
      },
      { totalFiles: mediaItems.length, unusedCount: 0, usedCount: 0 }
    );
  }, [mediaItems]);

  // Render loading state, error state, and main dashboard UI
  if (isLoading) {
    return <DashboardLoadingState message='Loading Media Usage...' />;
  }

  if (errorOccurred) {
    return (
      <DashboardErrorState message='Something went wrong, unable to collect media usage statistics' />
    );
  }

  // Refresh button component that triggers a data refresh when clicked
  const refreshButton = <RefreshButton onClick={refresh} />;

  // Filter components for media type and usage status, placed in the action area of the Media Inventory section
  const inventoryFilters = (
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

  // Calculate the count of filtered rows for pagination display
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const { pageIndex, pageSize } = table.getState().pagination;

  // Main dashboard UI rendering with info cards and media inventory table
  return (
    <DashboardPage
      title='Media Usage Dashboard'
      icon={<Image />}
      action={refreshButton}
    >
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <InfoCard
          iconBg='bg-blue-100'
          icon={<Database className='text-2xl text-blue-600' />}
          label='Total Media Files'
          value={
            <p className='text-3xl font-bold text-gray-800'>
              {stats.totalFiles}
            </p>
          }
        />
        <InfoCard
          iconBg='bg-green-100'
          icon={<Image className='text-2xl text-green-600' />}
          label='In Use'
          value={
            <p className='text-3xl font-bold text-gray-800'>
              {stats.usedCount}
            </p>
          }
        />
        <InfoCard
          iconBg={stats.unusedCount > 0 ? 'bg-orange-100' : 'bg-gray-100'}
          icon={
            <ImageOff
              className={`text-2xl ${stats.unusedCount > 0 ? 'text-orange-600' : 'text-gray-400'}`}
            />
          }
          label='Unused'
          value={
            <p
              className={`text-3xl font-bold ${stats.unusedCount > 0 ? 'text-orange-600' : 'text-gray-800'}`}
            >
              {stats.unusedCount}
            </p>
          }
        />
      </div>

      <DashboardSection title='Media Inventory' action={inventoryFilters}>
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
                    colSpan={4}
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
                            (cell.column.columnDef.meta as any)?.align ===
                            'right'
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
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className='bg-blue-50/30 border-b border-blue-100'
                        >
                          <ExpandedRowContent
                            usedIn={row.original.usedIn}
                            count={row.original.count}
                            close={close}
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
          <div className='px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between'>
            <div className='text-sm text-gray-500'>
              {filteredRowCount === 0 ? (
                <span>
                  Showing <span className='font-medium'>0</span> results
                </span>
              ) : (
                <span>
                  Showing{' '}
                  <span className='font-medium'>
                    {pageIndex * pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className='font-medium'>
                    {Math.min((pageIndex + 1) * pageSize, filteredRowCount)}
                  </span>{' '}
                  of <span className='font-medium'>{filteredRowCount}</span>{' '}
                  results
                </span>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <div className='flex items-center gap-1'>
                {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                  // Logic to show a window of pages around current page
                  let pageNum: number;
                  if (pageCount <= 5) {
                    pageNum = i;
                  } else if (pageIndex <= 2) {
                    pageNum = i;
                  } else if (pageIndex >= pageCount - 3) {
                    pageNum = pageCount - 5 + i;
                  } else {
                    pageNum = pageIndex - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageIndex === pageNum ? 'default' : 'ghost'}
                      size='icon'
                      onClick={() => table.setPageIndex(pageNum)}
                      className='w-8 h-8'
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div
          className='fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer'
          onClick={() => setLightboxImage(null)}
        >
          <div
            className='relative max-w-[95vw] max-h-[95vh] flex flex-col items-center cursor-auto'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className='absolute -top-12 right-0 text-white/70 hover:text-white text-4xl font-light hover:scale-110 transition-transform'
              aria-label='Close preview'
            >
              &times;
            </button>
            <img
              src={
                lightboxImage.media.src ||
                lightboxImage.media.thumbnails?.['75x75']
              }
              alt={lightboxImage.media.filename}
              className='max-w-full max-h-[85vh] object-contain rounded shadow-2xl'
            />
            <div className='text-white/90 text-center mt-4 text-sm font-medium tracking-wide'>
              {lightboxImage.media.filename}
              <span className='mx-3 opacity-30'>|</span>
              {lightboxImage.count > 0 ? (
                <span className='text-green-400 font-semibold'>
                  Used in {lightboxImage.count}{' '}
                  {lightboxImage.count === 1 ? 'doc' : 'docs'}
                </span>
              ) : (
                <span className='text-orange-400 font-semibold'>Unused</span>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
};

/** Expanded row sub-component showing grouped document references */
const ExpandedRowContent = ({
  usedIn,
  count,
  close,
}: {
  usedIn: DocumentReference[];
  count: number;
  close?: () => void;
}) => {
  const grouped = usedIn.reduce(
    (acc, doc) => {
      if (!acc[doc.collection]) {
        acc[doc.collection] = [];
      }
      acc[doc.collection].push(doc);
      return acc;
    },
    {} as Record<string, typeof usedIn>
  );

  return (
    <>
      <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
        Used in {count} document{count !== 1 ? 's' : ''}:
      </p>
      <div className='flex flex-wrap gap-3'>
        {Object.entries(grouped).map(([collection, docs]) => {
          const collectionLabel = docs[0]?.collectionLabel || collection;
          return (
            <div
              key={collection}
              className='bg-white rounded-lg border border-blue-100 p-3 min-w-[200px]'
            >
              <h4 className='text-[10px] font-bold uppercase tracking-tight mb-2'>
                <a
                  href={`#/collections/${collection}/~`}
                  onClick={() => close?.()}
                  className='text-blue-600 hover:text-blue-800 hover:underline transition-colors'
                >
                  {collectionLabel}
                </a>
              </h4>
              <ul className='space-y-1'>
                {docs.map((doc, idx) => (
                  <li
                    key={idx}
                    className='text-xs flex items-start gap-1.5 text-gray-700'
                  >
                    <BiFile className='text-gray-400 mt-0.5 flex-shrink-0' />
                    {doc.editUrl ? (
                      <a
                        href={doc.editUrl}
                        onClick={() => close?.()}
                        className='hover:text-blue-600 hover:underline transition-colors break-all'
                      >
                        {doc.relativePath}
                      </a>
                    ) : (
                      <span className='break-all'>{doc.relativePath}</span>
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
