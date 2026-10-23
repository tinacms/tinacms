import type { ComponentProps } from 'react';

import { Button } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

const SLOTS = 7;
const NUMBER = 'min-w-8 justify-center px-2 tabular-nums';

/**
 * The page numbers to draw, with `null` for an ellipsis: every page up to seven,
 * then the first and last with the current page and its neighbours, such as 1 … 5 6 7 … 13.
 */
function pageRun(page: number, pages: number): (number | null)[] {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (pages <= SLOTS) return range(1, pages);
  if (page <= 4) return [...range(1, 5), null, pages];
  if (page >= pages - 3) return [1, null, ...range(pages - 4, pages)];
  return [1, null, page - 1, page, page + 1, null, pages];
}

type PaginationProps = Omit<ComponentProps<'nav'>, 'children'> & {
  /** Items in the whole list, such as 48 documents. */
  total: number;
  /** 10 by default. */
  pageSize?: number;
  /** From 1. */
  page: number;
  /** Gets the page to show, from 1. */
  onPageChange?: (page: number) => void;
  /** Such as "Newer" for documents sorted by date. */
  prevLabel?: string;
  /** Such as "Older". */
  nextLabel?: string;
};

/**
 * Moves through a long list a page at a time. Screen readers hear "Showing 11–20 of 48"
 * when it changes. A button with nowhere to go is disabled, not hidden, so nothing jumps.
 */
function Pagination({
  total,
  pageSize = 10,
  page,
  onPageChange,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  'aria-label': label = 'Pages',
  className,
  ...props
}: PaginationProps) {
  const items = Math.max(0, Math.floor(total) || 0);
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const pages = Math.max(1, Math.ceil(items / size));
  const current = Math.min(pages, Math.max(1, Math.floor(page) || 1));
  const from = items === 0 ? 0 : (current - 1) * size + 1;
  const to = Math.min(items, current * size);
  const go = (next: number) => () => onPageChange?.(next);

  return (
    <nav
      data-slot='pagination'
      aria-label={label}
      className={cn(
        'flex w-full flex-wrap items-center justify-between gap-3 font-sans text-sm text-muted-foreground',
        className
      )}
      {...props}
    >
      <span aria-live='polite' className='tabular-nums'>
        Showing {from === to ? to : `${from}–${to}`} of {items}
      </span>
      <ul className='m-0 flex list-none flex-wrap items-center gap-1 p-0'>
        <li>
          <Button
            size='sm'
            icon='chevron-left'
            disabled={current <= 1}
            onClick={go(current - 1)}
          >
            {prevLabel}
          </Button>
        </li>
        {pageRun(current, pages).map((number, index) =>
          number === null ? (
            // The run has at most two ellipses, each fixed in place.
            <li key={`gap-${index}`} aria-hidden='true'>
              <Icon
                glyph='more'
                size={16}
                className='mx-2 text-muted-foreground'
              />
            </li>
          ) : (
            <li key={number}>
              <Button
                size='sm'
                variant={number === current ? 'secondary' : 'ghost'}
                selected={number === current}
                aria-current={number === current ? 'page' : undefined}
                aria-label={`Page ${number}`}
                className={NUMBER}
                onClick={number === current ? undefined : go(number)}
              >
                {number}
              </Button>
            </li>
          )
        )}
        <li>
          <Button
            size='sm'
            iconEnd='chevron-right'
            disabled={current >= pages}
            onClick={go(current + 1)}
          >
            {nextLabel}
          </Button>
        </li>
      </ul>
    </nav>
  );
}

export type { PaginationProps };
export { Pagination, pageRun };
