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
import type { Point } from '@udecode/plate';
import { useEditorSelector } from '@udecode/plate/react';

export type ActiveTableCell = {
  row: number;
  col: number;
  rowCount: number;
  colCount: number;
  range: { top: number; left: number; bottom: number; right: number } | null;
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
      const cellAt = (at: Point) => {
        const cell = editor.api.above<TTableCellElement>({
          at,
          match: { type: [TableCellPlugin.key, TableCellHeaderPlugin.key] },
        });
        if (!cell) return null;
        const owner = editor.api.above({
          at: cell[1],
          match: { type: TablePlugin.key },
        });
        if (!owner || owner[0] !== table) return null;
        const { row, col } = getCellIndices(editor, cell[0]);
        return {
          row,
          col,
          bottom: row + (cell[0].rowSpan ?? 1) - 1,
          right: col + (cell[0].colSpan ?? 1) - 1,
        };
      };
      const selection = editor.selection;
      if (!selection) return null;
      const focus = cellAt(selection.focus);
      if (!focus) return null;
      const anchor = cellAt(selection.anchor) ?? focus;
      const spans = anchor.row !== focus.row || anchor.col !== focus.col;
      const top = Math.min(anchor.row, focus.row);
      const left = Math.min(anchor.col, focus.col);
      const bottom = Math.max(anchor.bottom, focus.bottom);
      const right = Math.max(anchor.right, focus.right);
      return `${focus.row}:${focus.col}:${spans ? `${top}:${left}:${bottom}:${right}` : ''}`;
    },
    [table]
  );

  const [row, col, ...range] = key ? key.split(':') : [];
  const active: ActiveTableCell | null = key
    ? {
        row: Number(row),
        col: Number(col),
        rowCount: table.children.length,
        colCount: getTableColumnCount(table),
        range:
          range[0] === ''
            ? null
            : {
                top: Number(range[0]),
                left: Number(range[1]),
                bottom: Number(range[2]),
                right: Number(range[3]),
              },
      }
    : null;

  return (
    <ActiveTableCellContext.Provider value={active}>
      {children}
    </ActiveTableCellContext.Provider>
  );
}
