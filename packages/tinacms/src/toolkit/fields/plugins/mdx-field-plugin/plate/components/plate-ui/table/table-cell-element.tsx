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
} from '@udecode/plate/react';

import { blockSelectionVariants } from './block-selection';

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
  const { borders, minHeight, selected, width } = useTableCellElement();

  return (
    <PlateElement
      ref={ref}
      as={isHeader ? 'th' : 'td'}
      elementToAttributes={() => ({
        colSpan: api.table.getColSpan(element),
        rowSpan: api.table.getRowSpan(element),
      })}
      className={cn(
        className,
        'h-full overflow-visible border-none bg-background p-0',
        element.background ? 'bg-(--cellBackground)' : 'bg-background',
        isHeader && 'text-left *:m-0',
        'before:size-full',
        selected && 'before:z-10 before:bg-brand/5',
        "before:absolute before:box-border before:content-[''] before:select-none",
        borders.bottom?.size && `before:border-b before:border-b-border`,
        borders.right?.size && `before:border-r before:border-r-border`,
        borders.left?.size && `before:border-l before:border-l-border`,
        borders.top?.size && `before:border-t before:border-t-border`
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
      attributes={{
        ...props.attributes,
      }}
    >
      <div
        className='relative z-20 box-border h-full px-3 py-2'
        style={{ minHeight }}
      >
        {children}
      </div>

      {isSelectingRow && (
        <div className={blockSelectionVariants()} contentEditable={false} />
      )}
    </PlateElement>
  );
});

export const TableCellHeaderElement = withProps(TableCellElement, {
  isHeader: true,
});
