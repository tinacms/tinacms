import type { ComponentProps } from 'react';

import { Button } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

const SLOTS = 7;
const NUMBER = 'min-w-8 justify-center px-2 tabular-nums';
const END =
  'data-disabled:cursor-not-allowed data-disabled:opacity-45 data-disabled:hover:bg-secondary';

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
  /** Items in the whole list. */
  total: number;
  pageSize?: number;
  /** From 1. */
  page: number;
  onPageChange?: (page: number) => void;
  /** "Newer" reads better for documents sorted by date. */
  prevLabel?: string;
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
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(pages, Math.max(1, page));
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
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
        Showing {from === to ? to : `${from}–${to}`} of {total}
      </span>
      <ul className='m-0 flex list-none flex-wrap items-center gap-1 p-0'>
        <li>
          <Button
            size='sm'
            icon='chevron-left'
            disabled={current <= 1}
            focusableWhenDisabled
            className={END}
            onClick={go(current - 1)}
          >
            {prevLabel}
          </Button>
        </li>
        {pageRun(current, pages).map((pageNumber, index) =>
          pageNumber === null ? (
            // The run has at most two ellipses, each fixed in place.
            <li key={`gap-${index}`} aria-hidden='true'>
              <Icon
                glyph='more'
                size={16}
                className='mx-2 text-muted-foreground'
              />
            </li>
          ) : (
            <li key={pageNumber}>
              <Button
                size='sm'
                variant={pageNumber === current ? 'secondary' : 'ghost'}
                selected={pageNumber === current}
                aria-current={pageNumber === current ? 'page' : undefined}
                aria-label={`Page ${pageNumber}`}
                className={NUMBER}
                onClick={pageNumber === current ? undefined : go(pageNumber)}
              >
                {pageNumber}
              </Button>
            </li>
          )
        )}
        <li>
          <Button
            size='sm'
            iconEnd='chevron-right'
            disabled={current >= pages}
            focusableWhenDisabled
            className={END}
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
export { Pagination };
