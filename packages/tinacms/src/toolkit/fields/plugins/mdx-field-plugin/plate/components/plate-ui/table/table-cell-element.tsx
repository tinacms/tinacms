'use client';

import React from 'react';

import { cn, withProps, withRef } from '@udecode/cn';
import {
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import {
  PlateElement,
  useEditorPlugin,
  useElementSelector,
} from 'platejs/react';

import { blockSelectionVariants } from './block-selection';

// Type stub for TTableCellElement (not exported from @platejs/table)
type TTableCellElement = { type: string; colSpan?: number; rowSpan?: number; background?: string; children: any[] };

// Stub hook for useBlockSelected (not exported from @platejs/selection)
const useBlockSelected = (id?: string) => false;

// Stub hook for useTableCellElement (not exported from @platejs/table)
const useTableCellElement = () => ({
  borders: { bottom: true, left: true, right: true, top: true },
  minHeight: 33,
  selected: false,
  width: undefined as number | undefined,
});

export const TableCellElement = withRef<
  typeof PlateElement,
  {
    isHeader?: boolean;
  }
>(({ children, className, isHeader, style, ...props }, ref) => {
  const { api } = useEditorPlugin(BaseTablePlugin);
  const element = props.element as TTableCellElement;

  const rowId = useElementSelector(([node]) => node.id as string, [], {
    key: BaseTableRowPlugin.key,
  });
  const isSelectingRow = useBlockSelected(rowId);
  const { borders, minHeight, selected, width } = useTableCellElement();

  return (
    <PlateElement
      ref={ref}
      as={isHeader ? 'th' : 'td'}
      attributes={() => ({
        ...props.attributes,
        colSpan: api.table.getColSpan(element),
        rowSpan: api.table.getRowSpan(element),
      })}
      className={cn(
        'relative h-full overflow-visible border border-gray-200 bg-background p-0',
        element.background ? 'bg-[--cellBackground]' : 'bg-background',
        cn(
          isHeader && 'text-left [&_>_*]:m-0',
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

      {isSelectingRow && (
        <div className={blockSelectionVariants()} contentEditable={false} />
      )}
    </PlateElement>
  );
});

export const TableCellHeaderElement = withProps(TableCellElement, {
  isHeader: true,
});
