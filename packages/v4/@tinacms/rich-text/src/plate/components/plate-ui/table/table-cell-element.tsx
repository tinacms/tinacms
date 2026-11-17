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
>(({ children, className, isHeader, style, attributes, ...props }, ref) => {
  const { api } = useEditorPlugin(TablePlugin);
  const element = props.element as TTableCellElement;

  const rowId = useElementSelector(([node]) => node.id as string, [], {
    key: TableRowPlugin.key,
  });
  const isSelectingRow = useBlockSelected(rowId);
  const { colIndex, minHeight, rowIndex, selected, width } =
    useTableCellElement();
  const readOnly = useReadOnly();
  const headerLook = isHeader || rowIndex === 0;
  const active = useActiveTableCell();
  const colSpan = api.table.getColSpan(element);
  const rowSpan = api.table.getRowSpan(element);
  const range = active?.range;
  const inRange =
    !!range &&
    rowIndex >= range.top &&
    rowIndex - rowSpan + 1 <= range.bottom &&
    colIndex >= range.left &&
    colIndex - colSpan + 1 <= range.right;
  const isSelected = selected || inRange;
  const firstRow = rowIndex - rowSpan + 1;
  const firstCol = colIndex - colSpan + 1;
  const showRowHandle =
    !readOnly &&
    active !== null &&
    firstCol === 0 &&
    active.row >= firstRow &&
    active.row <= rowIndex;
  const showColumnHandle =
    !readOnly &&
    active !== null &&
    firstRow === 0 &&
    active.col >= firstCol &&
    active.col <= colIndex;

  return (
    <PlateElement
      ref={ref}
      as={isHeader ? 'th' : 'td'}
      attributes={{
        ...attributes,
        'aria-selected': isSelected || undefined,
        colSpan,
        rowSpan,
      }}
      className={cn(
        'relative h-full overflow-visible border border-border p-0',
        element.background
          ? 'bg-(--cellBackground)'
          : headerLook
            ? 'bg-muted'
            : 'bg-background',
        cn(
          headerLook && 'text-left font-medium [&_>_*]:m-0',
          'before:size-full',
          isSelected && 'before:z-10 before:bg-muted',
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

      {showRowHandle && active ? (
        <TableHandle axis='row' active={active} />
      ) : null}
      {showColumnHandle && active ? (
        <TableHandle axis='column' active={active} />
      ) : null}

      {isSelectingRow ? (
        <div className={blockSelectionVariants()} contentEditable={false} />
      ) : null}
    </PlateElement>
  );
});

export const TableCellHeaderElement = withProps(TableCellElement, {
  isHeader: true,
});
