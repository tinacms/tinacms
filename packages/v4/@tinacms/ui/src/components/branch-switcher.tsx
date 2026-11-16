import { type KeyboardEvent, type ReactNode, useState } from 'react';

import { Button } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tinacms/ui/components/dialog';
import { Badge } from '@tinacms/ui/components/badge';
import { Icon } from '@tinacms/ui/components/icon';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { BRANCH_NAME_HINT, branchNameError } from '@tinacms/ui/lib/branch-name';
import { cn } from '@tinacms/ui/lib/utils';

type BranchEntry = {
  name: string;
  protected?: boolean;
  /** The open pull request's number, shown after the name and searchable. */
  pullRequest?: number;
  /** Documents with unsaved edits on this branch. */
  unsaved?: number;
  /** `false` while the branch is still being made: its row is greyed and cannot be picked. */
  ready?: boolean;
};

type BranchSwitcherProps = {
  /** The branch edits save to. Left out while it is not known yet, as when the list failed to load. */
  current?: string;
  branches: BranchEntry[];
  /** Disables the button, for example while a save runs. It has no tooltip: the Status bar gives the reason. */
  disabled?: boolean;
  /** Stops a switch and shows these words, such as "Save or discard your changes first". */
  blockedMessage?: string;
  onSwitch: (name: string) => void;
  /** Without it the New branch form checks the name but Create branch stays off. */
  onCreate?: (name: string) => void;
  /** `loading` shows a skeleton and `failed` shows the problem with Retry, both in place. */
  status?: 'ready' | 'loading' | 'failed';
  onRetry?: () => void;
  defaultOpen?: boolean;
  defaultFullScreen?: boolean;
};

/** The top bar button: the branch in the code font, with a lock and "protected" on a protected branch. */
function BranchButtonLabel({
  current,
  isProtected,
}: {
  current: string | undefined;
  isProtected: boolean;
}): ReactNode {
  if (current === undefined) return <span>Branches</span>;
  return (
    <>
      {isProtected ? <Icon glyph='lock' size={14} /> : null}
      <span className='min-w-0 truncate font-mono tracking-code'>
        {current}
      </span>
      {isProtected ? (
        <span className='text-xs text-muted-foreground-strong max-md:hidden'>
          protected
        </span>
      ) : null}
    </>
  );
}

function BranchLine({
  branch,
  current,
  blocked,
  onPick,
}: {
  branch: BranchEntry;
  current: boolean;
  blocked: boolean;
  onPick: () => void;
}) {
  return (
    <li>
      <button
        type='button'
        data-branch-row=''
        aria-current={current ? 'true' : undefined}
        aria-disabled={
          (blocked || branch.ready === false) && !current ? true : undefined
        }
        onClick={() => {
          if (!blocked && !current && branch.ready !== false) onPick();
        }}
        className={cn(
          'box-border flex min-h-8.5 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-base leading-control outline-none hover:bg-muted focus-visible:shadow-focus-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-45 aria-disabled:hover:bg-transparent',
          current && 'bg-pressed font-semibold'
        )}
      >
        {branch.ready === false ? (
          <Icon
            glyph='spinner'
            size={14}
            className='motion-safe:animate-spin text-muted-foreground'
          />
        ) : (
          <Icon
            glyph={branch.protected ? 'lock' : 'branch'}
            size={14}
            className={current ? 'text-primary' : undefined}
          />
        )}
        <span className='min-w-0 flex-1 truncate font-mono tracking-code'>
          {branch.name}
        </span>
        {branch.ready === false ? (
          <span className='text-xs text-muted-foreground'>Getting ready</span>
        ) : null}
        {branch.pullRequest ? (
          <span className='text-xs text-muted-foreground tabular-nums'>
            #{branch.pullRequest}
          </span>
        ) : null}
        {branch.unsaved ? (
          <Badge
            kind='count'
            tone='change'
            count={branch.unsaved}
            srLabel={`, ${branch.unsaved} unsaved`}
          />
        ) : null}
      </button>
    </li>
  );
}

function BranchGroup({
  heading,
  description,
  branches,
  current,
  blocked,
  onSwitch,
}: {
  heading?: string;
  description?: string;
  branches: BranchEntry[];
  current: string;
  blocked: boolean;
  onSwitch: (name: string) => void;
}) {
  if (branches.length === 0) return null;
  return (
    <section aria-label={heading ?? 'Branches'} className='flex flex-col gap-1'>
      {heading ? (
        <div className='px-2.5'>
          <h3 className='m-0 text-xs font-medium text-muted-foreground-strong'>
            {heading}
          </h3>
          {description ? (
            <p className='m-0 text-xs text-muted-foreground'>{description}</p>
          ) : null}
        </div>
      ) : null}
      <ul className='m-0 flex list-none flex-col p-0'>
        {branches.map((branch) => (
          <BranchLine
            key={branch.name}
            branch={branch}
            current={branch.name === current}
            blocked={blocked}
            onPick={() => onSwitch(branch.name)}
          />
        ))}
      </ul>
    </section>
  );
}

/**
 * The branch button and the pop-up it opens: a search box, the current branch first,
 * then the others, protected branches in one Protected group, and a full screen toggle.
 */
function BranchSwitcher({
  current,
  branches,
  disabled = false,
  blockedMessage,
  onSwitch,
  onCreate,
  status = 'ready',
  onRetry,
  defaultOpen = false,
  defaultFullScreen = false,
}: BranchSwitcherProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [fullScreen, setFullScreen] = useState(defaultFullScreen);
  const isProtected = branches.some(
    (branch) => branch.name === current && branch.protected
  );
  const blocked = blockedMessage !== undefined;
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const wanted = query.trim().toLowerCase().replace(/^#/, '');
  const matching = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(wanted) ||
      (branch.pullRequest !== undefined &&
        String(branch.pullRequest).includes(wanted))
  );
  const [submitted, setSubmitted] = useState(false);
  const typed = newName.trim();
  const takenNames = branches.map((branch) => branch.name);
  const nameError = branchNameError(typed, takenNames, submitted);
  const move = (event: KeyboardEvent<HTMLElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const rows = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[data-branch-row]'),
    ];
    const at = rows.findIndex((row) => row === document.activeElement);
    if (at === -1 && event.key !== 'ArrowDown') return;
    if (at === -1 && !(document.activeElement instanceof HTMLInputElement))
      return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? rows.length - 1
          : at === -1
            ? 0
            : Math.min(
                Math.max(at + (event.key === 'ArrowDown' ? 1 : -1), 0),
                rows.length - 1
              );
    rows[next]?.focus();
  };
  const currentFirst = [
    ...matching.filter((branch) => branch.name === current),
    ...matching.filter(
      (branch) => branch.name !== current && !branch.protected
    ),
  ];
  const protectedBranches = matching.filter(
    (branch) => branch.protected && branch.name !== current
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant='ghost'
            size='sm'
            icon='branch'
            iconEnd='chevron-down'
            disabled={disabled}
            aria-label={
              current === undefined
                ? 'Branches'
                : `Branch: ${current}${isProtected ? ', protected' : ''}`
            }
            className='max-w-full shrink'
          />
        }
      >
        <BranchButtonLabel current={current} isProtected={isProtected} />
      </DialogTrigger>
      <DialogContent
        size='md'
        showCloseButton={false}
        onKeyDown={move}
        className={cn(
          fullScreen &&
            'top-14 bottom-7 left-0 h-auto w-full max-w-none translate-x-0 translate-y-0 rounded-none'
        )}
      >
        <DialogHeader className='flex-row items-start justify-between gap-2'>
          <div className='flex min-w-0 flex-col gap-1'>
            <DialogTitle>Branches</DialogTitle>
            <DialogDescription className='sr-only'>
              Edits save to the branch you choose.
            </DialogDescription>
          </div>
          <div className='flex flex-none items-center gap-1'>
            <Button
              variant='icon'
              size='sm'
              icon={fullScreen ? 'restore' : 'maximise'}
              aria-label={fullScreen ? 'Exit full screen' : 'Full screen'}
              onClick={() => setFullScreen((value) => !value)}
            />
            <Button
              variant='icon'
              size='sm'
              icon='close'
              aria-label='Close'
              onClick={() => setOpen(false)}
            />
          </div>
        </DialogHeader>
        {blocked ? (
          <p role='status' className='m-0 text-sm text-destructive'>
            {blockedMessage}
          </p>
        ) : null}
        <SearchBox
          label='Search branches'
          placeholder='Name or pull request number'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
        />
        {status === 'loading' ? (
          <div
            aria-busy='true'
            aria-label='Loading branches'
            role='group'
            className='flex flex-col gap-2'
          >
            <span className='text-sm text-muted-foreground'>
              Loading branches
            </span>
            {[0, 1, 2].map((row) => (
              <span
                key={row}
                className='h-8.5 animate-pulse rounded-sm bg-muted motion-reduce:animate-none'
              />
            ))}
          </div>
        ) : status === 'failed' ? (
          <div role='alert' className='flex items-center gap-2 text-sm'>
            <span className='min-w-0 flex-1 text-destructive'>
              Couldn't load branches.
              {current === undefined
                ? ' You can keep editing.'
                : ` You're still on ${current} and can keep editing.`}
            </span>
            {onRetry ? (
              <Button size='sm' onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {matching.length === 0 ? (
              <p className='m-0 text-sm text-muted-foreground'>
                No branch matches “{query.trim()}”.
              </p>
            ) : null}
            <BranchGroup
              branches={currentFirst}
              current={current ?? ''}
              blocked={blocked}
              onSwitch={(name) => {
                onSwitch(name);
                setOpen(false);
              }}
            />
            <BranchGroup
              heading='Protected'
              description='Saving on these makes a new branch.'
              branches={protectedBranches}
              current={current ?? ''}
              blocked={blocked}
              onSwitch={(name) => {
                onSwitch(name);
                setOpen(false);
              }}
            />
          </>
        )}
        {creating ? (
          <form
            aria-label='New branch form'
            className='flex flex-col gap-2 border-t border-border-subtle pt-3'
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
              if (typed === '' || branchNameError(typed, takenNames, true))
                return;
              if (!onCreate) return;
              onCreate(typed);
              setOpen(false);
            }}
          >
            <h3 className='m-0 text-base font-semibold'>New branch</h3>
            <p className='m-0 text-sm text-muted-foreground'>
              It starts with no unsaved edits. Yours stay on the branch they
              were made on.
            </p>
            <SearchBox
              label='New branch name'
              placeholder='Branch name'
              icon='branch'
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value);
                if (event.target.value.trim() === '' && newName !== '') {
                  setSubmitted(true);
                }
              }}
              onClear={() => {
                setNewName('');
                setSubmitted(true);
              }}
              aria-invalid={nameError ? true : undefined}
            />
            <p className='m-0 text-xs text-muted-foreground'>
              {BRANCH_NAME_HINT}
            </p>
            {nameError ? (
              <p role='alert' className='m-0 text-sm text-destructive'>
                {nameError}
              </p>
            ) : null}
            <div className='flex justify-end gap-2'>
              <Button onClick={() => setCreating(false)}>
                Back to branches
              </Button>
              <Button
                variant='primary'
                type='submit'
                disabled={
                  !onCreate || (typed !== '' && nameError !== undefined)
                }
              >
                Create branch
              </Button>
            </div>
          </form>
        ) : (
          <div className='border-t border-border-subtle pt-2'>
            <Button
              variant='ghost'
              size='sm'
              icon='plus'
              onClick={() => setCreating(true)}
            >
              New branch
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { BranchEntry, BranchSwitcherProps };
export { BranchSwitcher };
