'use client';

import React from 'react';

import type { TTableCellElement } from '@udecode/plate-table';

import { cn, withProps, withRef } from '@udecode/cn';
import { useBlockSelected } from '@udecode/plate-selection/react';
import {
  TablePlugin,
  TableRowPlugin,
  useTableCellElement,
} from '@udecode/plate-table/react';
import {
  PlateElement,
  useEditorPlugin,
  useElementSelector,
  useReadOnly,
} from '@udecode/plate/react';

import { blockSelectionVariants } from './block-selection';
import { useActiveTableCell } from './table-active-cell';
import { TableHandle } from './table-handles';

export const TableCellElement = withRef<
  typeof PlateElement,
  {
    isHeader?: boolean;
  }
>(({ children, className, isHeader, style, ...props }, ref) => {
  const { api } = useEditorPlugin(TablePlugin);
  const element = props.element as TTableCellElement;

  const rowId = useElementSelector(([node]) => node.id as string, [], {
    key: TableRowPlugin.key,
  });
  const isSelectingRow = useBlockSelected(rowId);
  const { colIndex, minHeight, rowIndex, selected, width } =
    useTableCellElement();
  const readOnly = useReadOnly();
  const active = useActiveTableCell();
  const colSpan = api.table.getColSpan(element);
  const rowSpan = api.table.getRowSpan(element);
  const showRowHandle =
    !readOnly &&
    active !== null &&
    colIndex === 0 &&
    active.row >= rowIndex &&
    active.row < rowIndex + rowSpan;
  const showColumnHandle =
    !readOnly &&
    active !== null &&
    rowIndex === 0 &&
    active.col >= colIndex &&
    active.col < colIndex + colSpan;

  return (
    <PlateElement
      ref={ref}
      as={isHeader ? 'th' : 'td'}
      attributes={() => ({
        ...props.attributes,
        'aria-selected': selected || undefined,
        colSpan,
        rowSpan,
      })}
      className={cn(
        'relative h-full overflow-visible border border-border p-0',
        element.background
          ? 'bg-(--cellBackground)'
          : isHeader
            ? 'bg-muted'
            : 'bg-background',
        cn(
          isHeader && 'text-left font-medium [&_>_*]:m-0',
          'before:size-full',
          selected && 'before:z-10 before:bg-muted',
          "before:absolute before:box-border before:select-none before:content-['']"
        ),
        className
      )}
      style={
        {
          '--cellBackground': element.background,
          maxWidth: width || 240,
          minWidth: width || 120,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        className='relative z-20 box-border h-full px-3 py-2'
        style={{ minHeight }}
      >
        {children}
      </div>

      {showRowHandle && active && <TableHandle axis='row' active={active} />}
      {showColumnHandle && active && (
        <TableHandle axis='column' active={active} />
      )}

      {isSelectingRow && (
        <div className={blockSelectionVariants()} contentEditable={false} />
      )}
    </PlateElement>
  );
});

export const TableCellHeaderElement = withProps(TableCellElement, {
  isHeader: true,
});
