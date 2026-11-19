'use client';

import React from 'react';

import { cn } from '@tinacms/ui/lib/utils';
import type { TTableElement } from '@udecode/plate-table';
import type { TElement } from '@udecode/plate';
import { TablePlugin } from '@udecode/plate-table/react';
import { useEditorPlugin } from '@udecode/plate/react';
import { GripHorizontal, GripVertical, PlusIcon } from 'lucide-react';

import { DropdownMenu, DropdownMenuTrigger } from '../dropdown-menu';
import type { ActiveTableCell } from './table-active-cell';
import { TableActionsMenuContent } from './table-menu';

const handleClass =
  'relative flex items-center justify-center rounded-sm border border-border bg-card text-muted-foreground shadow-xs outline-none hover:bg-muted hover:text-foreground focus-visible:shadow-focus-ring data-[state=open]:bg-selected data-[state=open]:text-foreground pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-10 pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2 pointer-coarse:after:content-[""]';

const addClass =
  'flex items-center justify-center gap-1 rounded-sm border border-dashed border-border bg-transparent text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:shadow-focus-ring';

export function TableHandle({
  axis,
  active,
}: {
  axis: 'row' | 'column';
  active: ActiveTableCell;
}) {
  const isRow = axis === 'row';
  const label = `${isRow ? 'Row' : 'Column'} ${(isRow ? active.row : active.col) + 1} actions`;

  return (
    <div
      contentEditable={false}
      className={cn(
        'absolute z-30 select-none',
        isRow
          ? '-left-6 top-1/2 -translate-y-1/2'
          : '-top-6 left-1/2 -translate-x-1/2'
      )}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            aria-label={label}
            className={cn(handleClass, isRow ? 'h-6 w-4' : 'h-4 w-6')}
            onMouseDown={(event) => event.preventDefault()}
          >
            {isRow ? (
              <GripVertical className='size-3' />
            ) : (
              <GripHorizontal className='size-3' />
            )}
          </button>
        </DropdownMenuTrigger>
        <TableActionsMenuContent axis={axis} active={active} />
      </DropdownMenu>
    </div>
  );
}

export function TableAddRow({ table }: { table: TTableElement }) {
  const { editor, tf } = useEditorPlugin(TablePlugin);

  const addRow = () => {
    const path = editor.api.findPath(table);
    if (!path) return;
    tf.insert.tableRow({ at: path });
  };

  return (
    <div contentEditable={false} className='select-none'>
      <button
        type='button'
        className={cn(addClass, 'absolute right-0 bottom-0 left-7 h-6')}
        onMouseDown={(event) => event.preventDefault()}
        onClick={addRow}
      >
        <PlusIcon className='size-3' />
        <span>Add a row</span>
      </button>
    </div>
  );
}

export function TableAddColumn({ table }: { table: TTableElement }) {
  const { editor, tf } = useEditorPlugin(TablePlugin);

  const addColumn = () => {
    const path = editor.api.findPath(table);
    const firstRow = table.children[0] as TElement | undefined;
    if (!path || !firstRow) return;
    tf.insert.tableColumn({
      fromCell: [...path, 0, firstRow.children.length - 1],
    });
  };

  return (
    <button
      type='button'
      aria-label='Add a column'
      className={cn(addClass, 'w-6 flex-1')}
      onMouseDown={(event) => event.preventDefault()}
      onClick={addColumn}
    >
      <PlusIcon className='size-3' />
    </button>
  );
}
