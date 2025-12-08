'use client';

import React from 'react';

import type { TTableCellElement } from '@udecode/plate-table';

import { cn, withProps } from '@udecode/cn';
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
  type PlateElementProps,
} from '@udecode/plate/react';

import { blockSelectionVariants } from './block-selection';

type TableCellElementProps = PlateElementProps & {
  isHeader?: boolean;
};

export const TableCellElement: React.ForwardRefExoticComponent<
  TableCellElementProps & React.RefAttributes<HTMLTableCellElement>
> = React.forwardRef<HTMLTableCellElement, TableCellElementProps>(
  ({ children, className, isHeader, style, ...props }, ref) => {
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
  }
);

TableCellElement.displayName = 'TableCellElement';

export const TableCellHeaderElement: React.FC<PlateElementProps> = withProps(
  TableCellElement,
  {
    isHeader: true,
  }
) as React.FC<PlateElementProps>;
