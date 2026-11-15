'use client';

import React, { useRef, useState } from 'react';

import { setCellBackground } from '@udecode/plate-table';
import {
  TablePlugin,
  useTableBordersDropdownMenuContentState,
  useTableMergeState,
} from '@udecode/plate-table/react';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Combine,
  EraserIcon,
  Grid2X2Icon,
  PaintBucketIcon,
  SquareStackIcon,
  Trash2Icon,
  Ungroup,
  XIcon,
} from 'lucide-react';

import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../dropdown-menu';
import type { ActiveTableCell } from './table-active-cell';

const subContentClass =
  'max-h-(--radix-dropdown-menu-content-available-height) w-max min-w-44 overflow-y-auto! [&_[role=menuitem]]:whitespace-nowrap [&_[role=menuitem]_svg]:size-4 [&_[role=menuitem]_svg]:shrink-0';

const menuContentClass = subContentClass;

const destructiveClass =
  'text-destructive focus:bg-status-failed-subtle focus:text-destructive';

type Axis = 'row' | 'column';

function MenuSub({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <DropdownMenuSub open={open} onOpenChange={setOpen}>
      <DropdownMenuSubTrigger ref={triggerRef}>
        {icon}
        <span className='ml-2'>{label}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        collisionPadding={8}
        className={subContentClass}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }}
      >
        {children}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export function TableActionsMenuContent({
  axis,
  active,
}: {
  axis: Axis;
  active: ActiveTableCell;
}) {
  const { editor, tf } = useEditorPlugin(TablePlugin);
  const isRow = axis === 'row';
  const last = isRow ? active.rowCount <= 2 : active.colCount <= 1;

  const run = (action: () => void) => () => {
    editor.tf.collapse({ edge: 'focus' });
    action();
    editor.tf.focus();
  };

  return (
    <DropdownMenuContent
      align='start'
      collisionPadding={8}
      className={menuContentClass}
      aria-label={`${isRow ? 'Row' : 'Column'} ${(isRow ? active.row : active.col) + 1} actions`}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        editor.tf.focus();
      }}
    >
      <DropdownMenuGroup>
        <DropdownMenuItem
          onSelect={run(() =>
            isRow
              ? tf.insert.tableRow({ before: true })
              : tf.insert.tableColumn({ before: true })
          )}
        >
          {isRow ? <ArrowUp /> : <ArrowLeft />}
          <span className='ml-2'>
            {isRow ? 'Insert row above' : 'Insert column left'}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={run(() =>
            isRow ? tf.insert.tableRow() : tf.insert.tableColumn()
          )}
        >
          {isRow ? <ArrowDown /> : <ArrowRight />}
          <span className='ml-2'>
            {isRow ? 'Insert row below' : 'Insert column right'}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={destructiveClass}
          disabled={last}
          onSelect={run(() =>
            isRow ? tf.remove.tableRow() : tf.remove.tableColumn()
          )}
        >
          <XIcon />
          <span className='ml-2'>{isRow ? 'Delete row' : 'Delete column'}</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <MenuSub icon={<SquareStackIcon className='size-4' />} label='Cell'>
        <CellActions />
      </MenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className={destructiveClass}
        onSelect={run(() => tf.remove.table())}
      >
        <Trash2Icon />
        <span className='ml-2'>Delete table</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

function CellActions() {
  const { editor, tf } = useEditorPlugin(TablePlugin);
  const { canMerge, canSplit } = useTableMergeState();
  const selectedCells = usePluginOption(TablePlugin, 'selectedCells');

  return (
    <>
      <DropdownMenuItem
        disabled={!canMerge}
        onSelect={() => {
          tf.table.merge();
          editor.tf.focus();
        }}
      >
        <Combine />
        <span className='ml-2'>Merge cells</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={!canSplit}
        onSelect={() => {
          tf.table.split();
          editor.tf.focus();
        }}
      >
        <Ungroup />
        <span className='ml-2'>Split cell</span>
      </DropdownMenuItem>
      <MenuSub
        icon={<PaintBucketIcon className='size-4' />}
        label='Background color'
      >
        <DropdownMenuItem
          onSelect={() => {
            setCellBackground(editor, {
              color: null,
              selectedCells: selectedCells ?? [],
            });
            editor.tf.focus();
          }}
        >
          <EraserIcon />
          <span className='ml-2'>Clear</span>
        </DropdownMenuItem>
      </MenuSub>
      <MenuSub icon={<Grid2X2Icon className='size-4' />} label='Cell borders'>
        <BorderItems />
      </MenuSub>
    </>
  );
}

function BorderItems() {
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  const items: [
    string,
    boolean,
    Parameters<typeof getOnSelectTableBorder>[0],
  ][] = [
    ['Top Border', hasTopBorder, 'top'],
    ['Right Border', hasRightBorder, 'right'],
    ['Bottom Border', hasBottomBorder, 'bottom'],
    ['Left Border', hasLeftBorder, 'left'],
    ['No Border', hasNoBorders, 'none'],
    ['Outside Borders', hasOuterBorders, 'outer'],
  ];

  return (
    <>
      {items.map(([label, checked, border]) => (
        <DropdownMenuCheckboxItem
          key={border}
          checked={checked}
          onCheckedChange={getOnSelectTableBorder(border)}
        >
          {label}
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
}
