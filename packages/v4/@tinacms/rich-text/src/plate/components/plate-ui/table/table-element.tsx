'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import type { TTableElement } from '@udecode/plate-table';
import { TableProvider, useTableElement } from '@udecode/plate-table/react';
import { PlateElement, useReadOnly, withHOC } from '@udecode/plate/react';

import {
  ActiveTableCellProvider,
  useActiveTableCell,
} from './table-active-cell';
import { TableAddButtons } from './table-handles';

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const table = props.element as TTableElement;

    return (
      <ActiveTableCellProvider table={table}>
        <TableBody ref={ref} table={table} className={className} {...props}>
          {children}
        </TableBody>
      </ActiveTableCellProvider>
    );
  })
);

const TableBody = withRef<typeof PlateElement, { table: TTableElement }>(
  ({ children, className, table, ...props }, ref) => {
    const readOnly = useReadOnly();
    const active = useActiveTableCell();
    const {
      isSelectingCell,
      marginLeft,
      props: tableProps,
    } = useTableElement();

    return (
      <PlateElement
        ref={ref}
        className={cn(className, 'overflow-x-auto py-2')}
        style={{ paddingLeft: marginLeft }}
        {...props}
      >
        <div
          className={cn(
            'group/table relative w-fit min-w-full',
            !readOnly && 'pt-7 pr-7 pb-7 pl-7'
          )}
        >
          <table
            className={cn(
              'mr-0 table h-px w-full border-collapse border border-border not-tina-prose',
              isSelectingCell && 'selection:bg-transparent'
            )}
            {...tableProps}
          >
            <tbody className='min-w-full'>{children}</tbody>
          </table>
          {!readOnly && active ? <TableAddButtons table={table} /> : null}
        </div>
      </PlateElement>
    );
  }
);
