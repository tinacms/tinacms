import { type ReactNode, useState } from 'react';

import { Button } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tinacms/ui/components/dialog';
import { Icon } from '@tinacms/ui/components/icon';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { cn } from '@tinacms/ui/lib/utils';

type BranchEntry = { name: string; protected?: boolean };

type BranchSwitcherProps = {
  /** The branch edits save to. */
  current: string;
  branches: BranchEntry[];
  /** Disables the button, for example while a save runs. It has no tooltip: the Status bar gives the reason. */
  disabled?: boolean;
  /** Stops a switch and shows these words, such as "Save or discard your changes first". */
  blockedMessage?: string;
  onSwitch: (name: string) => void;
  defaultOpen?: boolean;
  defaultFullScreen?: boolean;
};

/** The top bar button: the branch in the code font, with a lock and "protected" on a protected branch. */
function BranchButtonLabel({
  current,
  isProtected,
}: {
  current: string;
  isProtected: boolean;
}): ReactNode {
  return (
    <>
      {isProtected ? <Icon glyph='lock' size={14} /> : null}
      <span className='min-w-0 truncate font-mono tracking-code'>
        {current}
      </span>
      {isProtected ? (
        <span className='text-xs text-muted-foreground-strong'>protected</span>
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
        aria-current={current ? 'true' : undefined}
        aria-disabled={blocked && !current ? true : undefined}
        onClick={() => {
          if (!blocked && !current) onPick();
        }}
        className={cn(
          'box-border flex min-h-8.5 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-base leading-control outline-none hover:bg-muted focus-visible:shadow-focus-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-45 aria-disabled:hover:bg-transparent',
          current && 'bg-pressed font-semibold'
        )}
      >
        <Icon glyph={branch.protected ? 'lock' : 'branch'} size={14} />
        <span className='min-w-0 flex-1 truncate font-mono tracking-code'>
          {branch.name}
        </span>
        {current ? <Icon glyph='check' size={14} /> : null}
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
  const matching = branches.filter((branch) =>
    branch.name.toLowerCase().includes(query.trim().toLowerCase())
  );
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
            aria-label={`Branch: ${current}${isProtected ? ', protected' : ''}`}
            className='max-w-full'
          />
        }
      >
        <BranchButtonLabel current={current} isProtected={isProtected} />
      </DialogTrigger>
      <DialogContent
        size='md'
        showCloseButton={false}
        className={cn(fullScreen && 'inset-0 h-full max-w-none rounded-none')}
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
        {matching.length === 0 ? (
          <p className='m-0 text-sm text-muted-foreground'>
            No branch matches “{query.trim()}”.
          </p>
        ) : null}
        <BranchGroup
          branches={currentFirst}
          current={current}
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
          current={current}
          blocked={blocked}
          onSwitch={(name) => {
            onSwitch(name);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export type { BranchEntry, BranchSwitcherProps };
export { BranchSwitcher };
