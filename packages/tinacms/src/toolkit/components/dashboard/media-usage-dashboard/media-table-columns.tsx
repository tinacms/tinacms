import React from 'react';
import { BiFile, BiMovie } from 'react-icons/bi';
import { Button } from '../../ui/button';
import { SortableHeader } from '../dashboard-ui';
import type { MediaUsage } from './media-usage-scanner';
import type { ColumnDef, FilterFn, Row } from '@tanstack/react-table';

// Filter types for media type and usage status
export type MediaFilterType = 'all' | 'image' | 'video' | 'other';
export type UsageFilterType = 'all' | 'used' | 'unused';

/**
 * Filter function to filter media items based on their type. (TanStack filter function)
 *
 * @param row - The row being evaluated
 * @param _columnId - The ID of the column being filtered (not used here)
 * @param filterValue - The selected media type filter value
 * @returns A boolean indicating whether the row matches the filter criteria
 */
export const mediaTypeFilterFn: FilterFn<MediaUsage> = (
  row: Row<MediaUsage>,
  _columnId: string,
  filterValue: MediaFilterType
) => {
  if (filterValue === 'all') return true;
  return row.original.type === filterValue;
};

/**
 * Filter function to filter media items based on their usage status. (TanStack filter function)
 *
 * @param row - The table row containing the media item
 * @param _columnId - The ID of the column being filtered (not used in this function)
 * @param filterValue - The selected usage filter value ('all', 'used', or 'unused')
 * @returns A boolean indicating whether the row matches the filter criteria
 */
export const usageFilterFn: FilterFn<MediaUsage> = (
  row: Row<MediaUsage>,
  _columnId: string,
  filterValue: UsageFilterType
) => {
  if (filterValue === 'all') return true;
  const count = row.original.count;
  if (filterValue === 'used') return count > 0;
  if (filterValue === 'unused') return count === 0;
  return true;
};

/**
 * Returns the TanStack column definitions for the media inventory table.
 *
 * @param onPreview - Optional callback fired when an image thumbnail is clicked
 */
export const getMediaColumns = (
  onPreview?: (item: MediaUsage) => void
): ColumnDef<MediaUsage>[] => [
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
    header: ({ column }) => (
      <SortableHeader column={column}>Filename</SortableHeader>
    ),
    cell: ({ row }) => {
      const media = row.original.media;
      return (
        <span className='font-medium text-gray-800'>{media.filename}</span>
      );
    },
    filterFn: mediaTypeFilterFn,
  },
  {
    id: 'directory',
    accessorFn: (row) => row.media.directory || '/',
    header: ({ column }) => (
      <SortableHeader column={column}>Directory</SortableHeader>
    ),
    cell: ({ getValue }) => (
      <span className='text-sm text-gray-500'>{getValue() as string}</span>
    ),
  },
  {
    id: 'usage',
    accessorFn: (row) => row.count,
    header: ({ column }) => (
      <SortableHeader column={column} align='right'>
        Usage Count
      </SortableHeader>
    ),
    cell: ({ row }) => {
      const count = row.original.count;
      const isExpanded = row.getIsExpanded();
      return count > 0 ? (
        <Button
          variant='default'
          size='sm'
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
          className='rounded-full px-3 py-1 flex items-center gap-1 min-w-[3rem] justify-center ml-auto'
          title='View where this file is used'
        >
          {count} <span className='text-[10px]'>{isExpanded ? '▲' : '▼'}</span>
        </Button>
      ) : (
        <span className='text-gray-500 bg-gray-50 rounded-full px-3 py-1 inline-block min-w-[3rem] text-center border border-orange-100 bg-orange-50 text-orange-800 ml-auto'>
          0 (Unused)
        </span>
      );
    },
    filterFn: usageFilterFn,
    meta: { align: 'right' },
  },
];
