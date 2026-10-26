import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { Badge, type BadgeTone } from '@tinacms/ui/components/badge';
import { EmptyState } from '@tinacms/ui/components/empty-state';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import {
  Pagination,
  type PaginationProps,
} from '@tinacms/ui/components/pagination';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tinacms/ui/components/table';
import { cn } from '@tinacms/ui/lib/utils';

type DataTableSort = 'asc' | 'desc' | 'none';

type DataTableColumn = {
  /** The key each row uses for this column's cell. */
  key: string;
  label: string;
  /** Leave it out for a column that does not sort. `asc` or `desc` while it sorts this way, `none` while it can. */
  sort?: DataTableSort;
  /** What a press on the header does, such as sorting by this column the other way. */
  onSort?: () => void;
  align?: 'left' | 'right';
  /** Hides the column when the table is narrow. */
  hideNarrow?: boolean;
  /** Classes for the column's header and cells, such as a width. */
  className?: string;
};

type DataTableCell =
  | {
      /** The first cell of a row: it opens the row, and the whole row is its target. */
      type: 'link';
      text: string;
      icon?: Glyph | LucideIcon;
      /** The words in the code font, such as a folder name. */
      mono?: boolean;
      /** A grey outlined label after the words, such as "FR missing". */
      tag?: string;
      onClick?: () => void;
    }
  | {
      /** `muted` is smaller grey words, `file` a path that ends in an ellipsis, `num` grey numbers lined up on the right. */
      type: 'text' | 'muted' | 'file' | 'num';
      text: string;
    }
  | {
      type: 'badge';
      text: string;
      kind?: 'tag' | 'unsaved';
      tone?: BadgeTone;
    };

/** One row: a cell for each column key. A missing key leaves the cell empty. */
type DataTableRow = Record<string, DataTableCell | undefined>;

const cellVariants = cva('px-4 py-2.5 whitespace-normal', {
  variants: {
    type: {
      link: '',
      text: '',
      badge: '',
      muted: 'text-sm text-muted-foreground',
      file: 'w-1/5 max-w-0 font-mono text-xs tracking-code whitespace-nowrap text-muted-foreground',
      num: 'text-right text-sm whitespace-nowrap text-muted-foreground tabular-nums',
    },
    align: { left: '', right: 'text-right' },
    hideNarrow: { true: '@max-2xl:hidden', false: '' },
  },
  defaultVariants: { type: 'text', align: 'left', hideNarrow: false },
});

// A badge sits in a flex line of its own, so it is centred on the row and on the words beside it.
const INLINE = 'flex min-w-0 items-center';

const ARROW: Record<DataTableSort, string> = { asc: '↑', desc: '↓', none: '↕' };
const ARIA_SORT = {
  asc: 'ascending',
  desc: 'descending',
  none: 'none',
} as const;

type DataTableProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** What the table lists, such as "Docs documents". Read by screen readers only; always set it. */
  caption: string;
  columns: DataTableColumn[];
  /** One object per row, keyed by column. With no rows the table shows its empty state. */
  rows: DataTableRow[];
  emptyText?: string;
  /** The words of the one way out with no rows. Shows only with `onEmptyAction`. */
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  /** The filter above the table, such as a SearchBox. */
  filter?: ReactNode;
  /** Pages under the table. Leave it out when everything fits on one page. */
  pagination?: PaginationProps;
};

function DataCell({
  column,
  cell,
}: {
  column: DataTableColumn;
  cell?: DataTableCell;
}) {
  const className = cn(
    cellVariants({
      type: cell?.type,
      align: column.align,
      hideNarrow: Boolean(column.hideNarrow),
    }),
    column.className
  );
  if (!cell) return <TableCell className={className} />;
  if (cell.type === 'badge') {
    return (
      <TableCell className={className}>
        <span className={INLINE}>
          {cell.kind === 'unsaved' ? (
            <Badge kind='unsaved'>{cell.text}</Badge>
          ) : (
            <Badge kind='tag' tone={cell.tone}>
              {cell.text}
            </Badge>
          )}
        </span>
      </TableCell>
    );
  }
  if (cell.type === 'link') {
    return (
      <TableCell className={className}>
        <span className={cn(INLINE, 'gap-2.5')}>
          <button
            type='button'
            onClick={cell.onClick}
            className="group/link inline-flex min-w-0 cursor-pointer items-center gap-2.5 rounded-xs border-0 bg-transparent p-0 text-left font-sans text-base leading-control font-medium text-pretty text-foreground outline-none after:absolute after:inset-0 after:content-[''] focus-visible:shadow-focus-ring"
          >
            {cell.icon ? (
              <span className='inline-flex flex-none text-muted-foreground'>
                <Icon glyph={cell.icon} size={16} />
              </span>
            ) : null}
            <span
              className={cn(
                'decoration-slate-300 underline-offset-3 group-hover/link:underline',
                cell.mono && 'font-mono text-sm tracking-code'
              )}
            >
              {cell.text}
            </span>
          </button>
          {cell.tag ? <Badge kind='label'>{cell.tag}</Badge> : null}
        </span>
      </TableCell>
    );
  }
  return (
    <TableCell
      className={className}
      title={cell.type === 'file' ? cell.text : undefined}
    >
      {cell.type === 'file' ? (
        // A column sizes from its content, so a long path would squeeze the titles. The path
        // ends in an ellipsis inside a cell that takes a fifth of the width.
        <span className='block truncate'>{cell.text}</span>
      ) : (
        cell.text
      )}
    </TableCell>
  );
}

/**
 * A list of documents in columns, with a filter above and pages below. A sortable header is a
 * button and screen readers hear its sort order. The first cell of a row is a link that covers the
 * whole row, so each row is one Tab stop. Rows are links, not selections: no checkboxes.
 */
function DataTable({
  caption,
  columns,
  rows,
  emptyText = 'Nothing to show.',
  emptyActionLabel,
  onEmptyAction,
  filter,
  pagination,
  className,
  ...props
}: DataTableProps) {
  return (
    <div
      data-slot='data-table'
      className={cn('flex w-full min-w-0 flex-col gap-3', className)}
      {...props}
    >
      {filter ? (
        <div className='flex flex-wrap items-center gap-2'>{filter}</div>
      ) : null}
      <div className='@container overflow-hidden rounded-md border border-border bg-card font-sans text-base leading-control text-foreground'>
        <Table>
          <TableCaption className='sr-only'>{caption}</TableCaption>
          <TableHeader>
            <TableRow className='border-border'>
              {columns.map((column) => {
                const sort = column.sort ?? 'none';
                return (
                  <TableHead
                    key={column.key}
                    scope='col'
                    aria-sort={
                      column.sort === undefined ? undefined : ARIA_SORT[sort]
                    }
                    className={cn(
                      'h-9 bg-background px-4 text-xs font-medium text-muted-foreground-strong',
                      column.align === 'right' && 'text-right',
                      column.hideNarrow && '@max-2xl:hidden',
                      column.className
                    )}
                  >
                    {column.sort === undefined ? (
                      column.label
                    ) : (
                      <button
                        type='button'
                        onClick={column.onSort}
                        className='-mx-1.5 inline-flex h-7 cursor-pointer items-center gap-1 rounded-sm border-0 bg-transparent px-1.5 font-sans text-xs font-medium text-inherit outline-none hover:bg-muted hover:text-foreground focus-visible:shadow-focus-ring'
                      >
                        {column.label}
                        <span
                          aria-hidden='true'
                          className={
                            sort === 'none'
                              ? 'text-slate-300'
                              : 'text-foreground'
                          }
                        >
                          {ARROW[sort]}
                        </span>
                      </button>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                // Rows carry no id of their own; the order is the one the caller sorted.
                key={index}
                className='relative border-border-subtle hover:bg-muted'
              >
                {columns.map((column) => (
                  <DataCell
                    key={column.key}
                    column={column}
                    cell={row[column.key]}
                  />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 ? (
          <EmptyState
            variant='plain'
            live
            text={emptyText}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        ) : null}
      </div>
      {pagination ? <Pagination {...pagination} /> : null}
    </div>
  );
}

export type {
  DataTableCell,
  DataTableColumn,
  DataTableProps,
  DataTableRow,
  DataTableSort,
};
export { DataTable };
