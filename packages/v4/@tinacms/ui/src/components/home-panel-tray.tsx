import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import { Announcement } from '@tinacms/ui/components/announcement';
import { EmptyState } from '@tinacms/ui/components/empty-state';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { useLoadingWords } from '@tinacms/ui/hooks/use-loading-words';
import { cn } from '@tinacms/ui/lib/utils';

type HomePanelTrayProps = Omit<
  ComponentProps<'section'>,
  'children' | 'title'
> & {
  /** The panel's title, such as "Recent documents". Screen readers hear the panel as a region by this name. */
  title: string;
  /** A quiet count after the title, such as "7" for seven collections. */
  count?: string;
  /** The panel's one action, at the end of its title line. */
  action?: ReactNode;
  /** What the panel holds, on its white sheet. A `TileGrid` sits straight on the grey. Hidden while `loading` or `problem` is set. */
  children?: ReactNode;
  /** Grey placeholder rows while the content loads. `true` draws three; a number draws that many. */
  loading?: boolean | number;
  /** What screen readers hear once while `loading`. "Loading" and the `title` by default. */
  loadingLabel?: string;
  /** The one sentence shown in place of the content when it can't load, or when this setup does not have the data. */
  problem?: string;
  /** Shows Retry under `problem`. Leave it out when trying again can't help. */
  onRetry?: () => void;
};

// After a Retry that works, focus moves to the panel so it is not lost with the
// Retry button, and the sheet's new words are said once.
function useBackAfterRetry(problem: boolean, loading: boolean) {
  const panel = useRef<HTMLElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const retried = useRef(false);
  const [said, setSaid] = useState({ words: '', tries: 0 });
  useEffect(() => {
    if (!retried.current || problem || loading) return;
    retried.current = false;
    panel.current?.focus({ preventScroll: true });
    const words = (sheet.current?.textContent ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    setSaid((was) => ({ words, tries: was.tries + 1 }));
  }, [problem, loading]);
  const retry = (onRetry: () => void) => () => {
    retried.current = true;
    onRetry();
  };
  return { panel, sheet, retry, ...said };
}

/**
 * One panel on Home: a grey tray with its title on the grey and its content on a white sheet.
 * It draws the loading, can't-load and not-available states the same way for every panel.
 */
function HomePanelTray({
  title,
  count,
  action,
  children,
  loading = false,
  loadingLabel,
  problem,
  onRetry,
  className,
  ...props
}: HomePanelTrayProps) {
  const titleId = useId();
  const loadingRows = loading === true ? 3 : loading || 0;
  const isLoading = loadingRows > 0;
  const said = useLoadingWords(isLoading, loadingLabel ?? `Loading ${title}`);
  const back = useBackAfterRetry(Boolean(problem), isLoading);
  return (
    <section
      ref={back.panel}
      data-slot='home-panel-tray'
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-lg bg-muted px-3 pt-2 pb-3 font-sans text-base text-foreground outline-none',
        className
      )}
      {...props}
    >
      <div className='flex min-h-8 items-center justify-between gap-3 px-4'>
        <h3
          id={titleId}
          className='m-0 flex min-w-0 items-baseline gap-2 text-md leading-title font-semibold'
        >
          <span className='min-w-0 wrap-anywhere'>{title}</span>
          {count ? (
            <span className='text-xs font-normal text-muted-foreground'>
              {count}
            </span>
          ) : null}
        </h3>
        {action ? (
          <span className='inline-flex flex-none items-center'>{action}</span>
        ) : null}
      </div>
      <span role='status' className='sr-only'>
        {said}
      </span>
      {back.tries ? (
        <Announcement words={back.words} sayAgain={back.tries} />
      ) : null}
      <div
        ref={back.sheet}
        data-slot='home-panel-sheet'
        aria-busy={isLoading || undefined}
        className='rounded-md bg-card px-1.5 py-2 shadow-xs has-[>[data-slot=tile-grid]]:bg-transparent has-[>[data-slot=tile-grid]]:p-0 has-[>[data-slot=tile-grid]]:shadow-none'
      >
        {isLoading ? (
          <div className='flex flex-col'>
            {Array.from({ length: loadingRows }, (_, index) => (
              <div key={index} className='flex h-11 items-center gap-3 px-2.5'>
                <Skeleton shape='circle' className='size-4 flex-none' />
                <Skeleton className={index % 2 === 0 ? 'w-2/5' : 'w-3/5'} />
                <span className='flex-1' />
                <Skeleton className='w-16 flex-none' />
              </div>
            ))}
          </div>
        ) : problem ? (
          <EmptyState
            variant='plain'
            live
            text={problem}
            actionLabel={onRetry ? 'Retry' : undefined}
            onAction={onRetry ? back.retry(onRetry) : undefined}
          />
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export type { HomePanelTrayProps };
export { HomePanelTray };
