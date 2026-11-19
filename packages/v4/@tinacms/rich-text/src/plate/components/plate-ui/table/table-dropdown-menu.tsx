'use client';

import React, { useState, useSyncExternalStore } from 'react';

import { cn } from '@tinacms/ui/lib/utils';
import { TablePlugin } from '@udecode/plate-table/react';
import { useEditorPlugin } from '@udecode/plate/react';
import { Grid3x3Icon } from 'lucide-react';

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../dropdown-menu';

const GRID = 8;
const START = 2;

const clamp = (value: number) => Math.min(GRID, Math.max(1, value));

const NARROW = '(max-width: 639px)';

const subscribeNarrow = (notify: () => void) => {
  const query = window.matchMedia?.(NARROW);
  query?.addEventListener('change', notify);
  return () => query?.removeEventListener('change', notify);
};

const useNarrow = () =>
  useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia?.(NARROW).matches ?? false,
    () => false
  );

// A side submenu would run off a phone screen, so the grid sits inside the Insert menu there.
export function TableInsertSubMenu({ disabled }: { disabled?: boolean }) {
  const narrow = useNarrow();
  if (narrow) {
    return (
      <>
        <DropdownMenuLabel>Table</DropdownMenuLabel>
        <TableSizeGrid disabled={disabled} />
      </>
    );
  }
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={disabled}>
        <Grid3x3Icon className='size-4' />
        <span>Table</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent collisionPadding={8} className='min-w-0 p-1'>
        <TableSizeGrid />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function TableSizeGrid({ disabled }: { disabled?: boolean }) {
  const { editor, tf } = useEditorPlugin(TablePlugin);
  const [size, setSize] = useState({ rowCount: START, colCount: START });

  const move = (event: React.KeyboardEvent) => {
    const { rowCount, colCount } = size;
    const next = {
      ArrowRight: { rowCount, colCount: clamp(colCount + 1) },
      ArrowLeft: { rowCount, colCount: clamp(colCount - 1) },
      ArrowDown: { rowCount: clamp(rowCount + 1), colCount },
      ArrowUp: { rowCount: clamp(rowCount - 1), colCount },
    }[event.key];
    if (!next) return;
    if (event.key === 'ArrowLeft' && colCount === 1) return;
    event.preventDefault();
    event.stopPropagation();
    setSize(next);
  };

  return (
    <DropdownMenuItem
      disabled={disabled}
      aria-label={`Insert a ${size.rowCount} by ${size.colCount} table`}
      className='h-auto flex-col items-stretch gap-1 p-1'
      onKeyDown={move}
      onSelect={() => {
        tf.insert.table(size, { select: true });
        editor.tf.focus();
      }}
    >
      <div className='grid size-[130px] grid-cols-8 gap-0.5' aria-hidden>
        {Array.from({ length: GRID * GRID }, (_, index) => {
          const row = Math.floor(index / GRID);
          const col = index % GRID;
          return (
            <div
              key={index}
              className={cn(
                'size-3 border border-solid bg-muted',
                row < size.rowCount && col < size.colCount && 'border-current'
              )}
              onMouseMove={() =>
                setSize({ rowCount: row + 1, colCount: col + 1 })
              }
            />
          );
        })}
      </div>
      <div className='text-center text-xs'>
        {size.rowCount} x {size.colCount}
      </div>
    </DropdownMenuItem>
  );
}
