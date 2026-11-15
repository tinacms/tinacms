'use client';

import React, { createContext, useContext } from 'react';

import {
  type TTableCellElement,
  type TTableElement,
  getCellIndices,
  getTableColumnCount,
} from '@udecode/plate-table';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
} from '@udecode/plate-table/react';
import { useEditorSelector } from '@udecode/plate/react';

export type ActiveTableCell = {
  row: number;
  col: number;
  rowCount: number;
  colCount: number;
};

const ActiveTableCellContext = createContext<ActiveTableCell | null>(null);

export const useActiveTableCell = () => useContext(ActiveTableCellContext);

export function ActiveTableCellProvider({
  table,
  children,
}: {
  table: TTableElement;
  children: React.ReactNode;
}) {
  const key = useEditorSelector(
    (editor) => {
      const focus = editor.selection?.focus;
      if (!focus) return null;
      const cell = editor.api.above<TTableCellElement>({
        at: focus,
        match: { type: [TableCellPlugin.key, TableCellHeaderPlugin.key] },
      });
      if (!cell) return null;
      const owner = editor.api.above({
        at: cell[1],
        match: { type: TablePlugin.key },
      });
      if (!owner || owner[0] !== table) return null;
      const { row, col } = getCellIndices(editor, cell[0]);
      return `${row}:${col}`;
    },
    [table]
  );

  const active: ActiveTableCell | null = key
    ? {
        row: Number(key.split(':')[0]),
        col: Number(key.split(':')[1]),
        rowCount: table.children.length,
        colCount: getTableColumnCount(table),
      }
    : null;

  return (
    <ActiveTableCellContext.Provider value={active}>
      {children}
    </ActiveTableCellContext.Provider>
  );
}
