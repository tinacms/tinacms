import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tinacms/ui/components/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import { Badge } from '@tinacms/ui/components/badge';
import { Icon } from '@tinacms/ui/components/icon';
import { RadioGroup, RadioGroupItem } from '@tinacms/ui/components/radio-group';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { BRANCH_NAME_HINT, branchNameError } from '@tinacms/ui/lib/branch-name';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { dialogTitleClasses } from '@tinacms/ui/lib/dialog-styles';
import { canRetry, type CreateFailure } from '@tinacms/ui/lib/create-failure';
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
  /** With `ready: false`: the branch was made but never became ready. It is disabled with no spinner, until a reload. */
  unready?: boolean;
};

/** Why a create failed: it may still exist, the name is taken, sign-in, or anything else. */
/** What a create ended in. `reason` says why the note's action was refused. */
type BranchNote = {
  kind: 'failed' | 'unready' | 'ready';
  name: string;
  failure?: CreateFailure;
  reason?: string;
  /** The note was released by emptying the name field, so the form it came from stays open. */
  keepForm?: boolean;
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
  /**
   * Makes branch `name` from `from`. Without it the New branch form checks the name but Create
   * branch stays off. The switcher does not close itself afterwards: the caller decides.
   */
  onCreate?: (name: string, from: string) => void;
  /** The default branch, offered next to the current one as where a new branch starts from. */
  baseBranch?: string;
  /** Called when the New branch form opens or closes or its trimmed name changes. The caller decides which outcomes the form holds back. */
  onFormChange?: (shown: boolean, typed: string) => void;
  /** `creating` shows "Creating" on the form; `failed` keeps the form with a Retry. */
  createState?: 'idle' | 'creating' | 'failed';
  /** A new value resets the form: a create ended ready or unready under the name it holds. */
  formResetKey?: number;
  /** The outcome of a create, shown above the list while the switcher is open. One at a time. */
  note?: BranchNote;
  /** Runs the note's action (Retry, or Switch). Return false when it was refused: the note stays. */
  onNoteAction?: () => boolean | void;
  onNoteDismiss?: () => void;
  /** With `createState: 'failed'`: why, for the inline failure. */
  createFailure?: CreateFailure;
  /** The branch being made while the form is not on screen, so the switcher can say so. */
  creatingBranch?: string;
  /** `loading` shows a skeleton and `failed` shows the problem with Retry, both in place. */
  status?: 'ready' | 'loading' | 'failed';
  onRetry?: () => void;
  /** Controlled open state. Left out, the switcher keeps its own, starting from `defaultOpen`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  /** Controlled maximised state. Left out, the switcher keeps its own, starting from `defaultMaximised`. */
  maximised?: boolean;
  onMaximisedChange?: (maximised: boolean) => void;
  defaultMaximised?: boolean;
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
        {branch.ready === false && !branch.unready ? (
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
          <span className='text-xs text-muted-foreground'>
            {branch.unready ? 'Reload to switch' : 'Getting ready'}
          </span>
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

/** What a failed create tells the user to do. Never shows what a server sent back. */
const failureDetail = (name: string, failure?: CreateFailure) => {
  if (failure === 'exists') {
    return `A branch called ${name} already exists. Reload to see it.`;
  }
  if (failure === 'refused') return 'This branch name was refused.';
  if (failure === 'forbidden') {
    return "You don't have permission to create branches.";
  }
  if (failure === 'auth') return 'Sign in again to create a branch.';
  if (failure === 'network')
    return "Can't reach the sign-in service. Try again.";
  if (failure === 'timeout') {
    return 'Check your connection, then retry. It may still have been made, so reload to check.';
  }
  return 'Try again.';
};

const failureLine = (name: string, failure?: CreateFailure) =>
  failure === 'exists'
    ? failureDetail(name, failure)
    : `Couldn't create ${name}. ${failureDetail(name, failure)}`;

/** One note above the list: what a create ended in, its action and Dismiss. */
function OutcomeNote({
  note,
  onAction,
  onDismiss,
}: {
  note: BranchNote;
  onAction: () => void;
  onDismiss: () => void;
}) {
  const failed = note.kind === 'failed';
  const action =
    note.kind === 'failed'
      ? canRetry(note.failure)
        ? 'Retry'
        : undefined
      : note.kind === 'ready'
        ? `Switch to ${note.name}`
        : undefined;
  return (
    <div
      data-slot='branch-outcome-note'
      className='flex flex-none flex-col gap-1.5 text-sm'
    >
      <div
        role={failed ? 'alert' : 'status'}
        className={cn(
          'flex flex-wrap items-center gap-2',
          failed ? 'text-destructive' : 'text-foreground'
        )}
      >
        <span className='min-w-0 flex-[1_1_12rem] [overflow-wrap:anywhere]'>
          {note.kind === 'failed'
            ? failureLine(note.name, note.failure)
            : note.kind === 'unready'
              ? `${note.name} isn't ready yet. It was made. You can switch to it after reloading the page.`
              : `${note.name} is ready`}
        </span>
        {action ? (
          <Button size='sm' onClick={onAction}>
            {action}
          </Button>
        ) : null}
        <Button size='sm' variant='ghost' onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
      {note.reason ? (
        <p className='m-0 text-muted-foreground [overflow-wrap:anywhere]'>
          {note.reason}
        </p>
      ) : null}
    </div>
  );
}

/** Runs `run` once the frame on screen has laid out; the returned function cancels it. */
const afterPaint = (run: () => void) => {
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(run);
  });
  return () => cancelAnimationFrame(frame);
};

/** State that is controlled when the caller passes `value`, else kept here. */
function useControllable(
  value: boolean | undefined,
  initial: boolean,
  onChange: ((next: boolean) => void) | undefined
): [boolean, (next: boolean) => void] {
  const [own, setOwn] = useState(initial);
  const current = value ?? own;
  return [
    current,
    (next) => {
      if (value === undefined) setOwn(next);
      onChange?.(next);
    },
  ];
}

const POPUP_WIDTH =
  'w-[min(26.25rem,var(--available-width))] max-h-[calc(100dvh-96px)]';

/**
 * The branch button and what it opens: a search box, the current branch first, then the
 * others, protected branches in one Protected group, and New branch. From 768px up it opens
 * as a pop-up under the button and can be maximised to fill the work area; on a phone it is
 * a foot sheet.
 */
function BranchSwitcher({
  current,
  branches,
  disabled = false,
  blockedMessage,
  onSwitch,
  onCreate,
  baseBranch,
  onFormChange,
  createState = 'idle',
  formResetKey = 0,
  createFailure,
  note,
  onNoteAction,
  onNoteDismiss,
  creatingBranch,
  status = 'ready',
  onRetry,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  maximised: maximisedProp,
  onMaximisedChange,
  defaultMaximised = false,
}: BranchSwitcherProps) {
  const [open, setOpenState] = useControllable(
    openProp,
    defaultOpen,
    onOpenChange
  );
  // Closes the switcher makes itself (Escape, outside press, focus out, a pick, a tier change).
  const closedHere = useRef(false);
  const setOpen = (next: boolean) => {
    if (!next) closedHere.current = true;
    setOpenState(next);
  };
  const [maximised, setMaximised] = useControllable(
    maximisedProp,
    defaultMaximised,
    onMaximisedChange
  );
  const phone = useTier() === 'phone';
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const isProtected = branches.some(
    (branch) => branch.name === current && branch.protected
  );
  const blocked = blockedMessage !== undefined;
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [startFrom, setStartFrom] = useState<'current' | 'base'>('current');
  const wanted = query.trim().toLowerCase().replace(/^#/, '');
  // The form's own create shows its progress on the form: a new row above it would push it down.
  const known = useRef(new Set<string>());
  if (createState !== 'creating') {
    known.current = new Set(branches.map((branch) => branch.name));
  }
  const hideMaking = createState === 'creating' && creating;
  const matching = branches.filter(
    (branch) =>
      !(
        hideMaking &&
        branch.name === creatingBranch &&
        !known.current.has(branch.name)
      ) &&
      (branch.name.toLowerCase().includes(wanted) ||
        (branch.pullRequest !== undefined &&
          String(branch.pullRequest).includes(wanted)))
  );
  const busy = createState === 'creating';
  const waiting = creatingBranch !== undefined && !busy;
  const [submitted, setSubmitted] = useState(false);
  const typed = newName.trim();
  const takenNames = branches.map((branch) => branch.name);
  const nameError =
    busy || (waiting && typed === creatingBranch)
      ? undefined
      : branchNameError(typed, takenNames, submitted);
  const from = startFrom === 'base' ? baseBranch : (current ?? baseBranch);
  const [dismissed, setDismissed] = useState(false);
  const attempted = useRef('');
  const failed =
    createState === 'failed' &&
    creating &&
    !dismissed &&
    attempted.current !== '' &&
    typed === attempted.current;
  const frame = () =>
    document.querySelector('[data-slot="branch-maximised"]') ?? document;
  const focusField = (field: 'search' | 'name') => {
    frame()
      .querySelector<HTMLInputElement>(`[data-branch-field="${field}"]`)
      ?.focus();
  };
  // A create that ends moves focus only from inside the switcher, never from the page behind it.
  const focusHere = () => {
    const active = document.activeElement;
    return (
      !active ||
      active === document.body ||
      active.closest('[data-slot="branch-maximised"]') !== null ||
      Boolean(
        active.closest('[role="dialog"]')?.querySelector('[data-branch-field]')
      )
    );
  };
  const showActions = () => {
    const root = frame();
    // The sheet shows the line above the buttons, so scrolling to it would push them down.
    (
      (phone ? null : root.querySelector('[data-branch-failure]')) ??
      root.querySelector('[data-branch-actions]')
    )?.scrollIntoView?.({ block: 'nearest' });
  };
  useEffect(() => {
    if (failed) return afterPaint(showActions);
  }, [failed, maximised]);
  // The name a failure said cannot work stays blocked after the failure itself is gone.
  const [refusedNames, setRefusedNames] = useState<string[]>([]);
  // A failure shows even while the switcher is closed, so the note is where the name is learned.
  useEffect(() => {
    if (note?.kind !== 'failed' || canRetry(note.failure)) return;
    const refused = note.name;
    setRefusedNames((names) =>
      names.includes(refused) ? names : [...names, refused]
    );
  }, [note?.kind, note?.name, note?.failure]);
  // A failure that disables the focused Create button must not drop focus out of the view.
  useEffect(() => {
    if (!failed || canRetry(createFailure)) return;
    const active = document.activeElement;
    if (
      !active ||
      active === document.body ||
      active.matches(':disabled, [aria-disabled="true"], [data-disabled]')
    ) {
      focusField('name');
    }
  }, [failed, createFailure]);
  useEffect(() => setDismissed(false), [createState]);

  const wasOpen = useRef(open);
  // A create that ended under the name in the form returns it to the list; a failure keeps it.
  const [seenReset, setSeenReset] = useState(formResetKey);
  const resetFromForm = useRef(false);
  if (seenReset !== formResetKey) {
    resetFromForm.current = creating;
    setSeenReset(formResetKey);
    setCreating(false);
    setNewName('');
    setSubmitted(false);
    setStartFrom('current');
    setRefusedNames([]);
  }
  useEffect(() => {
    if (resetFromForm.current && open && focusHere()) {
      resetFromForm.current = false;
      return afterPaint(() => focusField('search'));
    }
    resetFromForm.current = false;
  }, [formResetKey]);
  useEffect(() => {
    const lost =
      !document.activeElement || document.activeElement === document.body;
    if (!open && wasOpen.current && lost && !closedHere.current) {
      triggerRef.current?.focus();
    }
    closedHere.current = false;
    wasOpen.current = open;
  }, [open]);

  // An open switcher belongs to the tier it opened on. Crossing 768px closes it before the other
  // frame mounts open, so no closed scrim is left over the page; its state is kept for the next open.
  const maximisedNow = useRef(maximised);
  maximisedNow.current = maximised;
  const openedOnPhone = useRef(phone);
  if (!open) openedOnPhone.current = phone;
  const staleTier = open && openedOnPhone.current !== phone;
  const shown = open && !staleTier;
  useEffect(() => {
    if (!staleTier) return;
    setOpen(false);
    if (focusHere()) triggerRef.current?.focus();
  });

  useEffect(() => {
    if (!open && maximised) setMaximised(false);
  });

  const noteKey = note === undefined ? '' : `${note.kind}:${note.name}`;
  useEffect(() => {
    if (
      noteKey !== '' &&
      !noteKey.startsWith('failed:') &&
      !note?.keepForm &&
      typed === ''
    ) {
      const focusInForm =
        document.activeElement?.closest(
          'form[aria-label="New branch form"]'
        ) !== null;
      setCreating(false);
      if (focusInForm && open) return afterPaint(() => focusField('search'));
    }
  }, [noteKey]);

  // A form closed while empty and idle starts the next open as the list, as after Back to branches.
  useEffect(() => {
    if (open || busy || newName.trim() !== '') return;
    setCreating(false);
    setSubmitted(false);
    setStartFrom('current');
  }, [open]);

  const formChange = useRef(onFormChange);
  formChange.current = onFormChange;
  useEffect(() => {
    formChange.current?.(creating, typed);
  }, [creating, typed]);

  useEffect(() => {
    if (!creating) return;
    focusField('name');
    return afterPaint(showActions);
  }, [creating, maximised]);

  const closeAndFocusButton = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const move = (event: KeyboardEvent<HTMLElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const rows = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[data-branch-row]'),
    ];
    const at = rows.findIndex((row) => row === document.activeElement);
    if (at === -1) {
      const onSearch =
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.dataset.branchField === 'search';
      if (event.key !== 'ArrowDown' || !onSearch) return;
    }
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
    ...matching.filter(
      (branch) => branch.ready === false && branch.name !== current
    ),
    ...matching.filter((branch) => branch.name === current),
    ...matching.filter(
      (branch) =>
        branch.name !== current && !branch.protected && branch.ready !== false
    ),
  ];
  const protectedBranches = matching.filter(
    (branch) =>
      branch.protected && branch.name !== current && branch.ready !== false
  );
  const pick = (name: string) => {
    onSwitch(name);
    if (maximised) closeAndFocusButton();
    else setOpen(false);
  };

  const submit = () => {
    setSubmitted(true);
    if (typed === '' || branchNameError(typed, takenNames, true)) return;
    if (!onCreate || from === undefined || blocked || busy || waiting) return;
    attempted.current = typed;
    onCreate(typed, from);
  };

  const startOptions: { value: 'current' | 'base'; label: string }[] = [
    { value: 'current' as const, label: `${current ?? ''} (current)` },
    ...(baseBranch !== undefined && baseBranch !== current
      ? [{ value: 'base' as const, label: baseBranch }]
      : []),
  ];

  // On the bottom-anchored sheet the line goes above the buttons, so they stay under the finger.
  const failureP = failed ? (
    <p
      role='alert'
      data-branch-failure=''
      className='m-0 text-sm text-destructive [overflow-wrap:anywhere]'
    >
      {failureLine(attempted.current, createFailure)}
    </p>
  ) : null;

  /** The same content in every frame; `Title` is the frame's own heading element. */
  const panel = (Title: (props: { children: ReactNode }) => ReactNode) => (
    <>
      <div className='flex flex-none items-start justify-between gap-2'>
        <div className='flex min-w-0 flex-col gap-1'>
          <Title>Branches</Title>
        </div>
        <div className='flex flex-none items-center gap-1'>
          {phone ? null : (
            <Button
              variant='icon'
              size='sm'
              icon={maximised ? 'restore' : 'maximise'}
              aria-label={maximised ? 'Restore' : 'Maximise'}
              aria-pressed={maximised}
              onClick={() => setMaximised(!maximised)}
            />
          )}
          {phone ? null : (
            <Button
              variant='icon'
              size='sm'
              icon='close'
              aria-label='Close branches'
              onClick={closeAndFocusButton}
            />
          )}
        </div>
      </div>
      {blocked ? (
        <p role='status' className='m-0 text-sm text-destructive'>
          {blockedMessage}
        </p>
      ) : null}
      <SearchBox
        ref={searchRef}
        data-branch-field='search'
        label='Search branches'
        placeholder='Branch name'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => {
          setQuery('');
          focusField('search');
        }}
      />
      {creatingBranch !== undefined && (!creating || waiting) ? (
        <p
          role='status'
          className='m-0 flex-none text-sm text-muted-foreground [overflow-wrap:anywhere]'
        >
          Creating {creatingBranch}…
        </p>
      ) : null}
      {note !== undefined && !(failed && note.kind === 'failed') ? (
        <OutcomeNote
          note={note}
          onAction={() => {
            if (onNoteAction?.() === false) return;
            if (note.kind === 'failed') focusField('search');
            else if (maximised) triggerRef.current?.focus();
          }}
          onDismiss={() => {
            onNoteDismiss?.();
            focusField('search');
          }}
        />
      ) : null}
      <div className='flex min-h-0 flex-col gap-3 overflow-y-auto'>
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
              Couldn't load branches. Check your connection, then retry.
              {current === undefined
                ? ' You can keep editing.'
                : ` You're still on ${current} and can keep editing.`}
            </span>
            {onRetry ? (
              <Button
                size='sm'
                onClick={() => {
                  onRetry();
                  focusField('search');
                }}
              >
                Retry
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {matching.length === 0 && query.trim() !== '' ? (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <p className='m-0 min-w-0 flex-1 [overflow-wrap:anywhere]'>
                  No branches match “{query.trim()}”.
                </p>
                <Button
                  size='sm'
                  onClick={() => {
                    setQuery('');
                    focusField('search');
                  }}
                >
                  Clear search
                </Button>
              </div>
            ) : null}
            <BranchGroup
              branches={currentFirst}
              current={current ?? ''}
              blocked={blocked}
              onSwitch={pick}
            />
            <BranchGroup
              heading='Protected'
              description='Saving on these makes a new branch.'
              branches={protectedBranches}
              current={current ?? ''}
              blocked={blocked}
              onSwitch={pick}
            />
          </>
        )}
        {creating ? (
          <form
            aria-label='New branch form'
            className='flex flex-none flex-col gap-2 border-t border-border-subtle pt-3'
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <h3 className='m-0 text-base font-semibold'>New branch</h3>
            <p className='m-0 text-sm text-muted-foreground'>
              It starts with no unsaved changes. Yours stay on the branch they
              were made on.
            </p>
            <SearchBox
              ref={nameRef}
              data-branch-field='name'
              label='New branch name'
              clearLabel='Clear name'
              placeholder='Branch name'
              icon='branch'
              value={newName}
              readOnly={busy}
              onChange={(event) => {
                setNewName(event.target.value);
                if (event.target.value.trim() === '' && newName !== '') {
                  setSubmitted(true);
                }
              }}
              onClear={
                busy
                  ? undefined
                  : () => {
                      setNewName('');
                      setSubmitted(true);
                      focusField('name');
                    }
              }
              aria-invalid={nameError ? true : undefined}
            />
            <p className='m-0 text-xs text-muted-foreground'>
              {BRANCH_NAME_HINT}
            </p>
            {nameError ? (
              <p
                role='alert'
                className='m-0 text-sm text-destructive [overflow-wrap:anywhere]'
              >
                {nameError}
              </p>
            ) : null}
            {waiting ? (
              <p
                role='status'
                className='m-0 text-sm text-muted-foreground [overflow-wrap:anywhere]'
              >
                Wait for {creatingBranch} to finish first
              </p>
            ) : null}
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-medium text-muted-foreground-strong'>
                Start from
              </span>
              {startOptions.length > 1 ? (
                <RadioGroup
                  aria-label='Start from'
                  value={startFrom}
                  disabled={busy}
                  onValueChange={(value) => {
                    if (value === 'current' || value === 'base') {
                      setStartFrom(value);
                    }
                  }}
                >
                  {startOptions.map((option) => (
                    <RadioGroupItem key={option.value} value={option.value}>
                      {option.label}
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              ) : (
                <span className='font-mono text-sm tracking-code [overflow-wrap:anywhere]'>
                  {current ?? baseBranch}
                  {current === undefined ? '' : ' (current)'}
                </span>
              )}
            </div>
            {phone ? failureP : null}
            <div
              data-branch-actions=''
              className='flex justify-end gap-2 max-md:items-stretch max-md:*:min-w-0 max-md:*:flex-1'
            >
              <Button
                className='max-md:h-auto max-md:min-h-9'
                disabled={busy}
                onClick={() => {
                  setCreating(false);
                  setDismissed(true);
                  focusField('search');
                }}
              >
                <span className='min-w-0 max-md:py-1.5 max-md:whitespace-normal'>
                  Back to branches
                </span>
              </Button>
              <Button
                variant='primary'
                type='submit'
                busy={busy}
                className='max-md:h-auto max-md:min-h-9'
                disabled={
                  !onCreate ||
                  from === undefined ||
                  blocked ||
                  waiting ||
                  typed === '' ||
                  nameError !== undefined ||
                  (failed && !canRetry(createFailure)) ||
                  refusedNames.includes(typed)
                }
              >
                {busy
                  ? 'Creating'
                  : failed && canRetry(createFailure)
                    ? 'Retry'
                    : 'Create branch'}
              </Button>
            </div>
            {phone ? null : failureP}
          </form>
        ) : null}
      </div>
      {creating || !onCreate ? null : (
        <div className='flex-none border-t border-border-subtle pt-2'>
          <Button
            variant='ghost'
            size='sm'
            icon='plus'
            disabled={
              busy ||
              status !== 'ready' ||
              (onCreate !== undefined && from === undefined)
            }
            onClick={() => setCreating(true)}
          >
            New branch
          </Button>
        </div>
      )}
    </>
  );

  const trigger = (
    <Button
      ref={triggerRef}
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
  );
  const label = (
    <BranchButtonLabel current={current} isProtected={isProtected} />
  );

  if (phone) {
    return (
      <Dialog open={shown} onOpenChange={setOpen}>
        <DialogTrigger render={trigger}>{label}</DialogTrigger>
        <DialogContent size='md' showCloseButton={false} onKeyDown={move}>
          {panel(({ children }) => (
            <>
              <DialogTitle>{children}</DialogTitle>
              <DialogDescription className='sr-only'>
                Edits save to the branch you choose.
              </DialogDescription>
            </>
          ))}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Popover
        open={shown && !maximised}
        onOpenChange={(next, details) => {
          // Tab off the busy button must not drop the create's own auto-switch.
          if (!next && busy && details.reason === 'focus-out') return;
          if (maximised && next) {
            closeAndFocusButton();
            return;
          }
          setOpen(next);
        }}
      >
        <PopoverTrigger render={trigger}>{label}</PopoverTrigger>
        <PopoverContent
          side='bottom'
          align='start'
          sideOffset={6}
          initialFocus={() => (creating ? nameRef.current : searchRef.current)}
          onKeyDown={move}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (
              !maximisedNow.current &&
              !busy &&
              next instanceof Node &&
              !event.currentTarget.contains(next) &&
              !triggerRef.current?.contains(next)
            ) {
              setOpen(false);
            }
          }}
          className={cn('gap-3 overflow-hidden p-3', POPUP_WIDTH)}
        >
          {panel(({ children }) => (
            <PopoverTitle className={dialogTitleClasses}>
              {children}
            </PopoverTitle>
          ))}
        </PopoverContent>
      </Popover>
      {shown && maximised
        ? createPortal(
            <MaximisedView
              onKeyDown={move}
              onEscape={closeAndFocusButton}
              focusTarget={creating ? nameRef : searchRef}
            >
              {panel(({ children }) => (
                <h2 className={cn('m-0', dialogTitleClasses)}>{children}</h2>
              ))}
            </MaximisedView>,
            document.body
          )
        : null}
    </>
  );
}

/** Tab at either end of the maximised view wraps inside it, as it does in the sheet. */
const wrapTab = (event: KeyboardEvent<HTMLElement>) => {
  const items = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]'
    ),
  ].filter(
    (item) =>
      item.tabIndex >= 0 &&
      !item.matches(':disabled') &&
      item.getClientRects().length > 0
  );
  const end = event.shiftKey ? items[0] : items[items.length - 1];
  if (document.activeElement !== end) return;
  event.preventDefault();
  (event.shiftKey ? items[items.length - 1] : items[0])?.focus();
};

/** The maximised switcher: fills the work area between the Top bar and the Status bar, no scrim. */
function MaximisedView({
  children,
  onKeyDown,
  onEscape,
  focusTarget,
}: {
  children: ReactNode;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onEscape: () => void;
  focusTarget: { current: HTMLInputElement | null };
}) {
  useEffect(() => {
    focusTarget.current?.focus();
  }, []);
  const escape = useRef(onEscape);
  escape.current = onEscape;
  useEffect(() => {
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing) return;
      // A busy Button swallows keys, so Escape on it still closes the view.
      const onBusyButton =
        event.target instanceof Element &&
        event.target.closest(
          'button[aria-disabled="true"], button[data-disabled], button:disabled'
        ) !== null;
      if (!event.defaultPrevented || onBusyButton) escape.current();
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  return (
    <section
      aria-label='Branches'
      data-slot='branch-maximised'
      onKeyDown={(event) => {
        onKeyDown(event);
        if (event.key === 'Tab' && !event.defaultPrevented) {
          wrapTab(event);
        }
      }}
      className='fixed inset-x-0 top-14 bottom-7 z-40 overflow-y-auto bg-background p-6 font-sans text-base leading-control text-foreground'
    >
      <div className='mx-auto flex max-w-190 flex-col gap-3 rounded-md border border-border bg-card p-4'>
        {children}
      </div>
    </section>
  );
}

/** The Top bar spot in local mode: edits save to files on this computer, so there is nothing to switch. */
function LocalFilesBadge() {
  return (
    <Badge kind='label' className='max-w-full'>
      <Icon glyph='folder' size={14} />
      <span className='max-[480px]:sr-only'>Local files</span>
    </Badge>
  );
}

export type { BranchEntry, BranchNote, BranchSwitcherProps };
export { BranchSwitcher, LocalFilesBadge, failureDetail };
