import { Button } from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuNote,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { FormLevel } from '@tinacms/ui/components/form-level';
import { SaveToBranchDialog } from '@tinacms/ui/components/save-to-branch-dialog';
import { toast } from '@tinacms/ui/components/toast';
import {
  branchNameError,
  branchNameFromPath,
  freeName,
} from '@tinacms/ui/lib/branch-name';
import {
  type ReactNode,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { useStore } from 'zustand';
import {
  FieldLockContext,
  type FormScope,
  FormScopeContext,
} from '../editor/context';
import { Field, FieldNode } from '../editor/field';
import {
  fieldsAlong,
  holdsRevealedError,
  levelDrillsIn,
  levelsFor,
  lockAbove,
  type OpenLevel,
} from '../editor/form-view-state';
import { useBranchView } from '../editor/branch';
import {
  FormValidationError,
  useDiscardEdits,
  useFieldRegistry,
  useFormCheck,
  useFormId,
  useFormSave,
  useOptionalContentSlice,
  useStaleDraft,
} from '../editor/hooks';
import {
  useFormErrors,
  useFormStore,
  useFormValues,
  useIsFormDirty,
} from '../form/form-store';
import type { TinaDocument } from '../core/schema/types';
import type { StoredDraft } from '../form/drafts';
import { countFailingFields } from '../editor/field-errors';
import { DiscardConfirm } from './discard-confirm';
import { DocumentStatus } from './document-status';
import { ContentError } from '../core/content/contract';
import { saveFailureWords } from './save-failure';
import { SaveToNewBranchContext } from './save-to-new-branch';
import { leftoverText } from './leftover-text';
import { useNarrow } from './use-narrow';

const toastOwners = new Map<string, number>();
const liveRetries = new Map<string, () => void>();
const TOAST_REMOUNT_GRACE_MS = 400;

const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearDismissTimer = (toastId: string) => {
  clearTimeout(dismissTimers.get(toastId));
  dismissTimers.delete(toastId);
};

const dismissNowIfUnowned = (toastId: string) => {
  clearDismissTimer(toastId);
  if (!toastOwners.get(toastId)) toast.dismiss(toastId);
};

const dismissIfUnowned = (toastId: string) => {
  clearDismissTimer(toastId);
  dismissTimers.set(
    toastId,
    setTimeout(() => dismissNowIfUnowned(toastId), TOAST_REMOUNT_GRACE_MS)
  );
};

export function flushPendingToastDismissals() {
  for (const toastId of [...dismissTimers.keys()]) dismissNowIfUnowned(toastId);
}

// Removes the toast once no form owns it. The form unmounts while a save reloads
// its document; one that comes back soon keeps the toast, because Sonner drops a
// toast that is dismissed and shown again under one id.
function useToastOwner(toastId: string, present: boolean) {
  useEffect(() => {
    if (!present) return;
    clearDismissTimer(toastId);
    toastOwners.set(toastId, (toastOwners.get(toastId) ?? 0) + 1);
    return () => {
      toastOwners.set(toastId, (toastOwners.get(toastId) ?? 1) - 1);
      dismissIfUnowned(toastId);
    };
  }, [present, toastId]);
}

type DialogState = {
  reason: 'protected' | 'deleted';
  branch: string;
  defaultName: string;
};

// Failed toasts whose action means "save to a new branch" rather than Retry.
const goneToasts = new Set<string>();

const isBranchGoneError = (cause: unknown) => {
  if (cause instanceof ContentError) {
    return cause.code === 'branch-not-found';
  }
  return false;
};

const isBranchGone = (save: { phase: string; reason?: string } | undefined) =>
  save?.phase === 'failed' && save.reason === 'branch-gone';

const DEFAULT_LABEL = 'Save';
const NEW_BRANCH_LABEL = 'Save to new branch';

// Save, or Save to new branch on a protected branch. `run` is the one gate:
// Save, the toast's action and Retry all come through it.
function SaveButton() {
  const scope = use(FormScopeContext);
  const formId = useFormId();
  const dirty = useIsFormDirty(formId);
  const values = useFormValues(formId);
  const save = useFormSave();
  const check = useFormCheck();
  const handler = use(SaveToNewBranchContext);
  const content = useOptionalContentSlice();
  const narrow = useNarrow();
  const view = useBranchView();
  const errorCount = countFailingFields(Object.keys(useFormErrors(formId)));
  const [pending, setPending] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [name, setName] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmError, setConfirmError] = useState<string>();
  const saveButton = useRef<HTMLButtonElement>(null);
  const failedToastId = `save-failed:${formId}`;
  const branchName = view?.name;
  const isProtected =
    view?.mode === 'branches' &&
    view.listState === 'ready' &&
    branchName !== undefined &&
    view.branches.some((entry) => entry.name === branchName && entry.protected);
  const listed = view?.branches.map((entry) => entry.name) ?? [];
  const taken =
    dialog?.reason === 'deleted'
      ? listed.filter((entry) => entry !== dialog.branch)
      : listed;
  const nameError =
    confirmError ?? branchNameError(name.trim(), taken, revealed);
  useToastOwner(failedToastId, true);
  const retry = useEffectEvent(() => run());
  useEffect(() => {
    const live = () => retry();
    liveRetries.set(failedToastId, live);
    return () => {
      if (liveRetries.get(failedToastId) === live) {
        liveRetries.delete(failedToastId);
      }
    };
  }, [failedToastId]);

  const openDialog = (reason: DialogState['reason'], branch: string) => {
    const defaultName =
      reason === 'deleted'
        ? freeName(
            branch,
            listed.filter((entry) => entry !== branch),
            { suffixed: true }
          )
        : freeName(branchNameFromPath(scope?.path ?? ''), listed);
    setName(defaultName);
    setRevealed(false);
    setConfirmError(undefined);
    setDialog({ reason, branch, defaultName });
  };

  const branchGone = useFormStore((state) => isBranchGone(state.saves[formId]));
  // Discard and a branch switch clear the failure. The toast that named it goes too.
  useEffect(() => {
    if (!branchGone && goneToasts.delete(failedToastId)) {
      toast.dismiss(failedToastId);
    }
  }, [branchGone, failedToastId]);

  const showFailure = (cause: unknown) => {
    // The raw reason is for the console. The editor reads fixed words.
    console.error('[tinacms] Save failed:', cause);
    if (isBranchGoneError(cause)) goneToasts.add(failedToastId);
    else goneToasts.delete(failedToastId);
    const { title, text, disk, action } = saveFailureWords(
      cause,
      view?.defaultBranch
    );
    toast({
      id: failedToastId,
      tone: 'error',
      title,
      text,
      dismissible: !disk,
      actionsInline: !narrow && !disk,
      action: {
        label: action,
        onClick: () => {
          const live = liveRetries.get(failedToastId);
          if (
            goneToasts.has(failedToastId) &&
            !isBranchGone(useFormStore.getState().saves[formId])
          ) {
            toast.dismiss(failedToastId);
          } else if (live) live();
          else toast.dismiss(failedToastId);
        },
      },
      secondaryAction: disk
        ? { label: 'Dismiss', onClick: () => toast.dismiss(failedToastId) }
        : undefined,
    });
    dismissIfUnowned(failedToastId);
  };

  // Reads the provider's branch list again, so a branch put back is noticed.
  const branchIsBack = () =>
    content?.branches?.list().then(
      (list) => list.some((entry) => entry.name === branchName),
      () => false
    ) ?? Promise.resolve(false);

  const saveHere = () => {
    setPending(true);
    if (isProtected && branchName !== undefined) {
      check()
        .then((valid) => {
          if (valid) {
            toast.dismiss(failedToastId);
            openDialog('protected', branchName);
          } else showFailure(new FormValidationError());
        })
        .finally(() => setPending(false));
      return;
    }
    save()
      .then(() => toast.dismiss(failedToastId))
      .catch((cause) => {
        showFailure(cause);
        if (isBranchGoneError(cause)) {
          openDialog('deleted', branchName ?? '');
        }
      })
      .finally(() => setPending(false));
  };

  const run = useEffectEvent(() => {
    if (dialog || pending) return;
    if (isBranchGone(useFormStore.getState().saves[formId])) {
      setPending(true);
      branchIsBack().then((back) => {
        if (back) {
          useFormStore.getState().clearSavePhase(formId);
          saveHere();
        } else {
          setPending(false);
          openDialog('deleted', branchName ?? '');
        }
      });
      return;
    }
    saveHere();
  });

  const confirm = (typed: string) => {
    if (!dialog) return;
    const chosen = typed.trim();
    setRevealed(true);
    if (!handler || branchNameError(chosen, taken, true)) return;
    const request = { name: chosen, reason: dialog.reason, formId };
    if (dialog.reason === 'protected') {
      setDialog(null);
      setPending(true);
      handler(request)
        .catch((cause) => showFailure(cause))
        .finally(() => setPending(false));
      return;
    }
    setSaving(true);
    handler(request).then(
      () => {
        setSaving(false);
        setDialog(null);
        toast.dismiss(failedToastId);
        useFormStore.getState().clearSavePhase(formId);
      },
      (cause) => {
        console.error('[tinacms] Could not make the branch:', cause);
        setSaving(false);
        setConfirmError('Couldn’t make the branch. Try again.');
      }
    );
  };

  return (
    <>
      <Button
        ref={saveButton}
        variant='primary'
        type='button'
        className='min-w-41 shrink-0'
        disabled={!dirty && !pending}
        busy={pending}
        count={errorCount}
        srLabel={`, ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`}
        onClick={run}
      >
        {isProtected ? NEW_BRANCH_LABEL : DEFAULT_LABEL}
      </Button>
      <SaveToBranchDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        reason={dialog?.reason}
        branch={dialog?.branch ?? ''}
        document={documentTitle(values, scope?.path ?? '')}
        name={name}
        onNameChange={(next) => {
          setName(next);
          setRevealed(true);
          setConfirmError(undefined);
        }}
        error={nameError}
        saving={saving}
        canSave={handler !== undefined}
        onSave={confirm}
        returnFocusTo={saveButton}
      />
    </>
  );
}

// The Unsaved tag, the Document actions menu and Save, fixed at the foot of the form.
function FormBar() {
  const formId = useFormId();
  const dirty = useIsFormDirty(formId);
  const discard = useDiscardEdits();
  const [confirming, setConfirming] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <div
      data-slot='form-bar'
      className='flex h-14 flex-none items-center gap-2 border-t border-border bg-card px-3'
    >
      <div className='min-w-0 flex-1'>
        <DocumentStatus />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              ref={menuButton}
              variant='icon'
              size='sm'
              icon='more'
              aria-label='Document actions'
            />
          }
        />
        <DropdownMenuContent
          side='top'
          align='end'
          aria-label='Document actions'
        >
          <DropdownMenuItem
            variant='destructive'
            disabled={!dirty}
            onClick={() => setConfirming(true)}
          >
            Discard unsaved edits
          </DropdownMenuItem>
          <DropdownMenuNote>More document actions come later.</DropdownMenuNote>
        </DropdownMenuContent>
      </DropdownMenu>
      <SaveButton />
      <DiscardConfirm
        open={confirming}
        onOpenChange={setConfirming}
        onConfirm={discard}
        returnFocusTo={menuButton}
      />
    </div>
  );
}

const RESUME_TEXT = {
  kept: 'Kept in this browser since your last visit.',
  changed: 'The document changed since. Resume puts your edits on top.',
} as const;

const documentTitle = (values: TinaDocument | undefined, path: string) => {
  const named = values?.title;
  if (typeof named === 'string' && named.trim() !== '') return named;
  return path.split('/').at(-1) ?? path;
};

// The prompt is a bottom-right toast, so the form stays editable behind it. One
// toast per document: its id holds the path, and leaving the document removes it.
function ResumeDraftToast({ scope }: { scope: FormScope }) {
  const stale = useStaleDraft();
  const values = useFormValues(scope.formId);
  const narrow = useNarrow();
  const [confirming, setConfirming] = useState(false);
  const discardButton = useRef<HTMLElement | null>(null);
  // The copies on screen when the confirm opened. Only these go on Confirm.
  const shown = useRef<readonly StoredDraft[]>([]);
  const cause = stale?.cause;
  const fields = stale?.leftoverFields.join(', ');
  const fieldCount = stale?.leftoverFields.length ?? 0;
  // `stale` is a new object whenever the form changes. The toast must not show
  // again for that, so the effect keys on what the toast says, and the buttons
  // read the latest actions. While the confirm is open the buttons do nothing.
  const resume = useEffectEvent(() => {
    if (!confirming) stale?.resume();
  });
  const askToDiscard = useEffectEvent(() => {
    if (confirming) return;
    discardButton.current = document.activeElement as HTMLElement | null;
    shown.current = stale?.copies ?? [];
    setConfirming(true);
  });
  const toastId = `resume-draft:${scope.path}`;
  useEffect(() => {
    if (!cause) {
      toast.dismiss(toastId);
      return;
    }
    toast({
      id: toastId,
      tone: 'warning',
      actionsInline: !narrow,
      title: 'Resume your unsaved edits?',
      text:
        cause === 'leftover'
          ? leftoverText(fields ?? '', fieldCount)
          : RESUME_TEXT[cause],
      dismissible: false,
      duration: Number.POSITIVE_INFINITY,
      action: { label: 'Resume', onClick: resume },
      secondaryAction: {
        label: 'Discard',
        destructive: true,
        onClick: askToDiscard,
      },
    });
  }, [cause, fields, fieldCount, toastId, narrow]);
  // A change of wording replaces the toast in place; only an empty list or a
  // different document takes it away.
  useToastOwner(toastId, cause !== undefined);
  return (
    <DiscardConfirm
      open={confirming}
      onOpenChange={setConfirming}
      onConfirm={() => stale?.discard(shown.current)}
      returnFocusTo={discardButton}
      title={`Discard earlier unsaved edits to “${documentTitle(values, scope.path)}”?`}
      description='Discarded edits can’t be brought back. What you typed since stays.'
    />
  );
}

// Edits that cannot be written to storage are not kept. The warning stays until
// dismissed and shows once per document in a session.
const warnedStorage = new Set<string>();
function StorageWarning({ scope }: { scope: FormScope }) {
  const failures = useFormStore((state) => state.failures[scope.formId]);
  const swapFailures = useFormStore(
    (state) => state.swapFailures[scope.formId]
  );
  const lastSwap = useRef(swapFailures);
  useEffect(() => {
    // A swap that did nothing warns every time, so Resume never looks dead.
    const swapped = swapFailures !== lastSwap.current;
    lastSwap.current = swapFailures;
    if (!failures) return;
    if (warnedStorage.has(scope.path) && !swapped) return;
    warnedStorage.add(scope.path);
    toast({
      id: `storage-warning:${scope.path}`,
      tone: 'warning',
      title: 'Edits can’t be stored in this browser',
      text: 'The browser’s storage is full or blocked. Free space, then reload.',
      dismissible: true,
      duration: Number.POSITIVE_INFINITY,
    });
  }, [failures, swapFailures, scope.path]);
  return null;
}

function ActiveFieldLevels({ scope }: { scope: FormScope }) {
  const registry = useFieldRegistry();
  const { getValues } = useFormContext();
  const active = useFormStore((state) => state.active);
  const showLevelsFor = useEffectEvent((address: string) => {
    const { view, collection } = scope;
    const { openLevels } = view.getState();
    const levels = levelsFor(
      address,
      collection.fields,
      (path) => getValues(path),
      (step) => levelDrillsIn(registry.get(step.node.type), step)
    );
    const top = openLevels.at(-1)?.address;
    const sameLevels =
      levels.length === openLevels.length &&
      levels.every(
        (level, index) => level.address === openLevels[index]?.address
      );
    if (sameLevels || top === address || top?.startsWith(`${address}.`)) return;
    view.getState().showLevels(levels);
  });
  useEffect(() => {
    if (active && active.formId === scope.formId) showLevelsFor(active.address);
  }, [active, scope.formId]);
  return null;
}

// Reads the whole view and every error for the trail. `children` keeps its
// element identity, so a re-render here does not reach the fields.
function OpenLevelFrame({
  scope,
  current,
  children,
}: {
  scope: FormScope;
  current: OpenLevel;
  children: ReactNode;
}) {
  const errors = useFormErrors(useFormId());
  const { getValues } = useFormContext();
  const view = useStore(scope.view);
  const { collection, path } = scope;
  const { closeLevelsAbove } = scope.view.getState();

  const errorAddresses = Object.keys(errors);
  const steps = [
    {
      label: path.split('/').at(-1) ?? path,
      onClick: () => closeLevelsAbove(0),
      invalid: holdsRevealedError(view, errorAddresses),
    },
    ...fieldsAlong(current.address, collection.fields, getValues).map(
      (step) => {
        const keep = view.openLevels.filter(
          (level) =>
            level.address === step.address ||
            step.address.startsWith(`${level.address}.`)
        ).length;
        return {
          label: step.label,
          onClick: () => closeLevelsAbove(keep),
          invalid: holdsRevealedError(view, errorAddresses, step.address),
        };
      }
    ),
  ];
  return (
    <FormLevel pinHeaders steps={steps} onUp={steps.at(-2)?.onClick}>
      {children}
    </FormLevel>
  );
}

function FormFields({ scope }: { scope: FormScope }) {
  const current = useStore(scope.view, (state) => state.openLevels.at(-1));
  const { getValues } = useFormContext();
  if (!current) {
    return (
      <FormLevel pinHeaders>
        {scope.collection.fields.map((node) => (
          <Field key={node.name} address={node.name} />
        ))}
      </FormLevel>
    );
  }
  return (
    <OpenLevelFrame scope={scope} current={current}>
      <FieldLockContext
        value={lockAbove(current.address, scope.collection.fields, getValues)}
      >
        <FieldNode address={current.address} node={current.node} />
      </FieldLockContext>
    </OpenLevelFrame>
  );
}

export function DocumentForm() {
  const scope = use(FormScopeContext);
  if (!scope) return null;

  return (
    <>
      <ResumeDraftToast scope={scope} />
      <StorageWarning scope={scope} />
      <ActiveFieldLevels scope={scope} />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <FormFields scope={scope} />
      </div>
      <FormBar />
    </>
  );
}
