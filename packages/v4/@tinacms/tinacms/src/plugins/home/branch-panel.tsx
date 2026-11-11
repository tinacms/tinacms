import { Announcement } from '@tinacms/ui/components/announcement';
import { EmptyState } from '@tinacms/ui/components/empty-state';
import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { Icon } from '@tinacms/ui/components/icon';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { useLoadingWords } from '@tinacms/ui/hooks/use-loading-words';
import { cn } from '@tinacms/ui/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { ReviewUnsavedButton } from '../../admin/review-unsaved';
import { type BranchView, useBranchView } from '../../editor/branch';
import { useContentMode } from '../../editor/content-mode';
import { useUnsavedFormIds } from '../../form/form-store';

const ROW = 'flex min-h-11 min-w-0 items-center gap-3 px-2.5 py-1.5';

function BranchName({ branch }: { branch: BranchView }) {
  if (!branch.name) return null;
  const isProtected = branch.branches.some(
    (candidate) => candidate.name === branch.name && candidate.protected
  );
  return (
    <div className={ROW}>
      <span className='inline-flex flex-none text-muted-foreground'>
        <Icon glyph='branch' size={16} />
      </span>
      <span className='flex min-w-0 flex-col'>
        <span className='font-mono tracking-code wrap-anywhere'>
          {branch.name}
        </span>
        {isProtected ? (
          <span className='text-xs text-muted-foreground'>Protected</span>
        ) : null}
      </span>
    </div>
  );
}

const pullRequestOf = (
  url: string | undefined
): { href: string; label: string } | null => {
  if (!url || !URL.canParse(url)) return null;
  const { protocol, pathname, href } = new URL(url);
  if (protocol !== 'https:' && protocol !== 'http:') return null;
  const last = pathname.split('/').filter(Boolean).at(-1) ?? '';
  return {
    href,
    label: /^\d+$/.test(last) ? `Pull request #${last}` : 'Pull request',
  };
};

function PullRequestRow({ url }: { url: string | undefined }) {
  const pullRequest = pullRequestOf(url);
  const icon = (
    <span className='inline-flex flex-none text-muted-foreground'>
      <Icon glyph='changes' size={16} />
    </span>
  );
  if (!pullRequest) {
    return (
      <div className={ROW}>
        {icon}
        <span className='text-muted-foreground'>{NO_PULL_REQUEST}</span>
      </div>
    );
  }
  return (
    <a
      href={pullRequest.href}
      target='_blank'
      rel='noreferrer'
      className={cn(
        ROW,
        'rounded-sm text-foreground no-underline outline-none hover:bg-muted focus-visible:shadow-focus-inset'
      )}
    >
      {icon}
      <span className='min-w-0 wrap-anywhere'>{pullRequest.label}</span>
      <span className='sr-only'>(opens in a new tab)</span>
    </a>
  );
}

const NO_PULL_REQUEST = 'No pull request yet';

function PullRequestState({
  branch,
  isPending,
  onRetry,
}: {
  branch: BranchView;
  isPending: boolean;
  onRetry: () => void;
}) {
  const said = useLoadingWords(isPending, 'Loading pull request');
  return (
    <>
      <span role='status' className='sr-only'>
        {said}
      </span>
      {isPending ? (
        <div data-slot='pull-request-row' aria-busy='true' className={ROW}>
          <Skeleton shape='circle' className='size-4 flex-none' />
          <Skeleton className='w-2/5' />
        </div>
      ) : branch.listState === 'failed' ? (
        <EmptyState
          data-slot='pull-request-row'
          variant='plain'
          align='left'
          live
          className='px-2.5 py-3'
          text="Couldn't load this branch's pull request."
          actionLabel='Retry'
          onAction={onRetry}
        />
      ) : (
        <PullRequestRow url={branch.pullRequestUrl} />
      )}
    </>
  );
}

function BranchPanelBody({ branch }: { branch: BranchView }) {
  const unsaved = useUnsavedFormIds().length;
  const isPending =
    branch.listState !== 'ready' && branch.listState !== 'failed';
  const body = useRef<HTMLDivElement>(null);
  const retried = useRef(false);
  const [back, setBack] = useState({ words: '', tries: 0 });
  const readWords =
    pullRequestOf(branch.pullRequestUrl)?.label ?? NO_PULL_REQUEST;
  // A ref on the tray replaces the tray's own ref. Thus the panel finds the
  // tray's region from an element inside it.
  useEffect(() => {
    // A Retry that failed is over: a later read from elsewhere must not move focus here.
    if (branch.listState === 'failed') retried.current = false;
    if (!retried.current || branch.listState !== 'ready') return;
    retried.current = false;
    body.current?.closest('section')?.focus({ preventScroll: true });
    setBack((was) => ({ words: readWords, tries: was.tries + 1 }));
  }, [branch.listState, readWords]);
  return (
    <HomePanelTray title='Branch'>
      <div ref={body} className='flex flex-col'>
        {branch.name ? (
          <BranchName branch={branch} />
        ) : isPending ? (
          <div aria-hidden='true' className={ROW}>
            <Skeleton shape='circle' className='size-4 flex-none' />
            <Skeleton className='w-3/5' />
          </div>
        ) : null}
        <PullRequestState
          branch={branch}
          isPending={isPending}
          onRetry={() => {
            retried.current = true;
            branch.retryList();
          }}
        />
        {back.tries ? (
          <Announcement words={back.words} sayAgain={back.tries} />
        ) : null}
        {unsaved > 0 ? (
          <div className='mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border px-2 pt-3 pb-1'>
            <span className='text-sm text-muted-foreground'>
              {unsaved === 1
                ? '1 document not saved yet'
                : `${unsaved} documents not saved yet`}
            </span>
            <ReviewUnsavedButton count={unsaved} />
          </div>
        ) : null}
      </div>
    </HomePanelTray>
  );
}

/**
 * The branch that saves go to. It renders nothing unless the content provider
 * offers branches, so Home in local files has no Branch panel.
 */
export function BranchPanel() {
  const mode = useContentMode();
  const branch = useBranchView();
  if (mode !== 'branches' || !branch) return null;
  return <BranchPanelBody branch={branch} />;
}
