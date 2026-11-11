import { Avatar } from '@tinacms/ui/components/avatar';
import { Button } from '@tinacms/ui/components/button';
import { EmptyState } from '@tinacms/ui/components/empty-state';
import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { ListRow } from '@tinacms/ui/components/list-row';
import { useEffect, useId, useRef, useState } from 'react';
import { useTinaSchema } from '../../admin/hooks';
import { useAdminRoute } from '../../admin/use-admin-route';
import type { HomePanelContext } from '../../core/slot/contract';
import { useCollectionLists } from '../../editor/collection-lists';
import { useContentMode } from '../../editor/content-mode';
import { useUnsavedFormIds } from '../../form/form-store';
import {
  type RecentRow,
  exactTimeOf,
  recentRowsOf,
  relativeTimeOf,
} from './recent-rows';

const SCROLL_PAGE = 20;
const NARROW_PAGE = 5;
const ROW = '[data-slot=list-row-main]';

// A phone has no room for the name, so the avatar carries it for a screen reader.
function When({
  row,
  now,
  compact,
}: {
  row: RecentRow;
  now: number;
  compact: boolean;
}) {
  if (!row.updatedAt) return null;
  return (
    <span className='inline-flex items-center gap-1.5 whitespace-nowrap'>
      {row.author ? (
        <Avatar
          as='static'
          size='sm'
          name={row.author}
          label={compact ? row.author : undefined}
        />
      ) : null}
      {row.author && !compact ? <span>{row.author}</span> : null}
      <time
        dateTime={row.updatedAt.toISOString()}
        title={exactTimeOf(row.updatedAt)}
      >
        {relativeTimeOf(row.updatedAt, now)}
      </time>
    </span>
  );
}

function Rows({
  rows,
  paged,
  compact,
  panelId,
}: {
  rows: RecentRow[];
  paged: boolean;
  compact: boolean;
  panelId: string;
}) {
  const { navigate } = useAdminRoute();
  const page = paged ? NARROW_PAGE : SCROLL_PAGE;
  const [shown, setShown] = useState(page);
  const visible = rows.slice(0, shown);
  const hasMore = visible.length < rows.length;
  const list = useRef<HTMLUListElement>(null);
  const end = useRef<HTMLLIElement>(null);
  const pressedAt = useRef<number | null>(null);
  const now = Date.now();

  useEffect(() => {
    const at = pressedAt.current;
    if (at === null || hasMore) return;
    pressedAt.current = null;
    const row = list.current?.querySelectorAll<HTMLElement>(ROW)[at];
    (row ?? document.getElementById(panelId))?.focus();
  }, [hasMore, panelId]);

  useEffect(() => {
    const mark = end.current;
    if (paged || !hasMore || !mark) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(Number.POSITIVE_INFINITY);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown((count) => count + SCROLL_PAGE);
        }
      },
      { root: list.current }
    );
    observer.observe(mark);
    return () => observer.disconnect();
  }, [paged, hasMore, shown]);

  return (
    <div className='flex flex-col'>
      <ul
        ref={list}
        aria-label='Recent documents'
        className={
          paged
            ? 'm-0 flex list-none flex-col gap-1 p-0'
            : 'm-0 flex max-h-90 list-none flex-col gap-1 overflow-y-auto p-0'
        }
      >
        {visible.map((row) => (
          <li key={row.path} title={row.path}>
            <ListRow
              icon='doc'
              title={row.title}
              wrap
              unsaved={row.unsaved}
              aside={
                row.updatedAt ? (
                  <When row={row} now={now} compact={compact} />
                ) : undefined
              }
              onClick={() =>
                navigate({
                  view: 'document',
                  collection: row.collection,
                  path: row.path,
                })
              }
            />
          </li>
        ))}
        {!paged && hasMore ? (
          <li ref={end} aria-hidden='true' className='h-px flex-none' />
        ) : null}
      </ul>
      {paged && hasMore ? (
        <div className='mt-1 border-t border-border pt-2'>
          <Button
            variant='ghost'
            full
            onClick={() => {
              pressedAt.current = visible.length;
              setShown((count) => count + NARROW_PAGE);
            }}
          >
            Show more
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The editor's unsaved documents, then the newest documents of every
 * collection. A desktop scrolls inside the panel; a tablet and a phone show
 * five rows and Show more.
 */
export function RecentDocumentsPanel({ tier }: HomePanelContext) {
  const { collections } = useTinaSchema();
  const { lists, retryFailed } = useCollectionLists(
    collections.map(({ name }) => name)
  );
  const unsavedIds = new Set<string>(useUnsavedFormIds());
  const mode = useContentMode();
  const panelId = useId();
  const isLoading = lists.some(({ status }) => status === 'loading');
  const hasFailed = lists.some(({ status }) => status === 'failed');
  const rows = isLoading || hasFailed ? [] : recentRowsOf(lists, unsavedIds);
  const hasDocuments = lists.some(({ documents }) => documents.length > 0);
  const isUnavailable = rows.length === 0 && hasDocuments;
  const problem = hasFailed
    ? "Couldn't load recent documents."
    : isUnavailable
      ? 'Not available on this setup'
      : undefined;
  return (
    <HomePanelTray
      id={panelId}
      title='Recent documents'
      loading={isLoading ? 6 : false}
      problem={isLoading ? undefined : problem}
      onRetry={hasFailed ? retryFailed : undefined}
    >
      {rows.length === 0 ? (
        <EmptyState
          variant='plain'
          text={
            mode === 'branches'
              ? 'Nothing edited on this branch yet.'
              : 'Nothing edited yet.'
          }
        />
      ) : (
        <Rows
          key={tier === 'desktop' ? 'scroll' : 'paged'}
          rows={rows}
          paged={tier !== 'desktop'}
          compact={tier === 'phone'}
          panelId={panelId}
        />
      )}
    </HomePanelTray>
  );
}
