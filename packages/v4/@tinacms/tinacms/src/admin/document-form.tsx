import { Button } from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuNote,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { tinaResolveLabel } from '@tinacms/ui/components/error-summary-pane';
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
  AfterSaveHookError,
  FormValidationError,
  useDiscardEdits,
  useFieldRegistry,
  useFormCheck,
  useFormId,
  useFormSave,
  useFormSaveWith,
  useOptionalContentSlice,
  useStaleDraft,
} from '../editor/hooks';
import {
  type FormId,
  useFormErrors,
  useFormStore,
  useFormValues,
  useIsFormDirty,
  type FormStore,
} from '../form/form-store';
import type { TinaDocument } from '../core/schema/types';
import type { StoredDraft } from '../form/drafts';
import { DiscardConfirm } from './discard-confirm';
import { DocumentStatus } from './document-status';
import { ContentError } from '../core/content/contract';
import { ErrorSuccessBubble, useErrorSummary } from './error-summary';
import { saveFailureWords } from './save-failure';
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

type NewBranchRequest = { name: string; from: string | undefined };

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
  const saveWith = useFormSaveWith();
  const check = useFormCheck();
  const content = useOptionalContentSlice();
  const narrow = useNarrow();
  const view = useBranchView();
  const summary = useErrorSummary();
  const [pending, setPending] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [name, setName] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmError, setConfirmError] = useState<string>();
  const saveButton = useRef<HTMLButtonElement>(null);
  // A failed protected save to a new branch. Retry sends it again while the
  // form's save phase is still the failure it recorded (ADR-018 §2).
  const remembered = useRef<{
    request: NewBranchRequest;
    failure: FormStore['saves'][FormId];
  } | null>(null);
  // Set while the deleted dialog saves: the phase leaves branch-gone, but the toast stays.
  const keepGoneToast = useRef(false);
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
  const currentBranch = useRef(branchName);
  useEffect(() => {
    currentBranch.current = branchName;
  }, [branchName]);
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

  const savePhase = useFormStore((state) => state.saves[formId]);
  // Discard and a branch switch clear the failure. The toast that named it goes
  // too, and Retry no longer sends the remembered request.
  useEffect(() => {
    const live = useFormStore.getState().saves[formId];
    if (remembered.current && live !== remembered.current.failure) {
      remembered.current = null;
    }
    if (
      !isBranchGone(savePhase) &&
      !keepGoneToast.current &&
      goneToasts.delete(failedToastId)
    ) {
      toast.dismiss(failedToastId);
    }
  }, [savePhase, formId, failedToastId]);

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

  // Query the provider again. The cached branch list can be out of date.
  const branchIsBack = () =>
    content?.branches?.list().then(
      (list) => list.some((entry) => entry.name === branchName),
      () => false
    ) ?? Promise.resolve(false);

  const saveHere = () => {
    setPending(true);
    if (isProtected && branchName !== undefined) {
      const previous = useFormStore.getState().saves[formId];
      check()
        .then((valid) => {
          if (valid) {
            toast.dismiss(failedToastId);
            openDialog('protected', branchName);
          } else if (summary.block()) {
            useFormStore.getState().restoreSavePhase(formId, previous);
            toast.dismiss(failedToastId);
          } else showFailure(new FormValidationError());
        })
        .finally(() => setPending(false));
      return;
    }
    save()
      .then(() => toast.dismiss(failedToastId))
      .catch((cause) => {
        if (cause instanceof FormValidationError && summary.block()) {
          toast.dismiss(failedToastId);
          return;
        }
        showFailure(cause);
        if (isBranchGoneError(cause)) {
          openDialog('deleted', branchName ?? '');
        }
      })
      .finally(() => setPending(false));
  };

  // An `AfterSaveHookError` means the branch exists and the editor is on it.
  const sendToNewBranch = async (request: NewBranchRequest) => {
    const action = view?.saveToNewBranch;
    if (!action || !scope) return;
    await saveWith({
      write: (value) =>
        action({
          ...request,
          collection: scope.collection.name,
          path: scope.path,
          value,
        }),
      afterWrite: () => {
        remembered.current = null;
        view.switchTo(request.name);
      },
    });
  };

  const saveToProtected = (request: NewBranchRequest) => {
    setPending(true);
    sendToNewBranch(request)
      .then(() => toast.dismiss(failedToastId))
      .catch((cause) => {
        if (cause instanceof FormValidationError && summary.block()) {
          toast.dismiss(failedToastId);
          return;
        }
        if (!(cause instanceof AfterSaveHookError)) {
          remembered.current = {
            request,
            failure: useFormStore.getState().saves[formId],
          };
        }
        showFailure(cause);
      })
      .finally(() => setPending(false));
  };

  const saveFromDeleted = (request: NewBranchRequest) => {
    const previous = useFormStore.getState().saves[formId];
    setSaving(true);
    keepGoneToast.current = true;
    const done = () => {
      keepGoneToast.current = false;
      setSaving(false);
    };
    sendToNewBranch(request).then(
      () => {
        done();
        setDialog(null);
        goneToasts.delete(failedToastId);
        toast.dismiss(failedToastId);
      },
      (cause) => {
        done();
        if (cause instanceof AfterSaveHookError) {
          setDialog(null);
          showFailure(cause);
          return;
        }
        useFormStore.getState().restoreSavePhase(formId, previous);
        if (cause instanceof FormValidationError) {
          setDialog(null);
          if (!summary.block()) showFailure(cause);
          return;
        }
        console.error('[tinacms] Could not make the branch:', cause);
        setConfirmError('Couldn’t make the branch. Try again.');
      }
    );
  };

  const run = useEffectEvent(() => {
    if (dialog || pending) return;
    if (remembered.current && view?.saveToNewBranch) {
      saveToProtected(remembered.current.request);
      return;
    }
    remembered.current = null;
    if (isBranchGone(useFormStore.getState().saves[formId])) {
      setPending(true);
      const failure = useFormStore.getState().saves[formId];
      const startedOn = branchName;
      branchIsBack().then((back) => {
        const stale =
          useFormStore.getState().saves[formId] !== failure ||
          currentBranch.current !== startedOn;
        if (stale) {
          setPending(false);
        } else if (back) {
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
    if (!view?.saveToNewBranch || branchNameError(chosen, taken, true)) return;
    if (dialog.reason === 'protected') {
      setDialog(null);
      saveToProtected({ name: chosen, from: dialog.branch });
      return;
    }
    saveFromDeleted({ name: chosen, from: undefined });
  };

  const { blocked } = summary;
  return (
    <>
      <Button
        ref={saveButton}
        variant='primary'
        type='button'
        className='min-w-41 shrink-0'
        disabled={!(blocked || dirty || pending)}
        busy={pending}
        data-resolve=''
        icon={blocked ? 'error' : undefined}
        aria-expanded={blocked ? summary.paneOpen : undefined}
        aria-controls={blocked ? 'error-pane' : undefined}
        onClick={blocked ? summary.resolve : run}
      >
        {blocked
          ? tinaResolveLabel(summary.count)
          : isProtected
            ? NEW_BRANCH_LABEL
            : DEFAULT_LABEL}
      </Button>
      <SaveToBranchDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (open) return;
          setDialog(null);
          remembered.current = null;
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
        canSave={view?.saveToNewBranch !== undefined}
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
  const values = useFormValues(formId);
  const scope = use(FormScopeContext);
  const [confirming, setConfirming] = useState(false);
  // Read when the confirm opens, so typing in the title does not change it.
  const [documentName, setDocumentName] = useState('');
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <div
      data-slot='form-bar'
      className='relative flex h-14 flex-none items-center gap-2 border-t border-border bg-card px-3'
    >
      <ErrorSuccessBubble />
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
            onClick={() => {
              setDocumentName(documentTitle(values, scope?.path ?? ''));
              setConfirming(true);
            }}
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
        title={`Discard unsaved edits to “${documentName}”?`}
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
