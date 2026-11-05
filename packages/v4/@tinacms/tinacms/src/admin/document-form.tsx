import { Button } from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuNote,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { FormLevel } from '@tinacms/ui/components/form-level';
import { toast } from '@tinacms/ui/components/toast';
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
import { type FormScope, FormScopeContext } from '../editor/context';
import { Field, FieldNode } from '../editor/field';
import {
  fieldsAlong,
  holdsRevealedError,
  levelDrillsIn,
  levelsFor,
  type OpenLevel,
} from '../editor/form-view-state';
import {
  useDiscardEdits,
  useFieldRegistry,
  useFormId,
  useFormSave,
  useSaveFailure,
  useStaleDraft,
} from '../editor/hooks';
import {
  useFormErrors,
  useFormStore,
  useFormValues,
  useIsFormDirty,
} from '../form/form-store';
import type { TinaDocument } from '../core/schema/types';
import { countFailingFields } from '../editor/field-errors';
import { DiscardConfirm } from './discard-confirm';
import { DocumentStatus } from './document-status';

function SaveButton() {
  const formId = useFormId();
  const dirty = useIsFormDirty(formId);
  const save = useFormSave();
  const [failure, setFailure] = useSaveFailure();
  const errorCount = countFailingFields(Object.keys(useFormErrors(formId)));
  const [pending, setPending] = useState(false);
  return (
    <div className='flex flex-col items-stretch gap-2'>
      <Button
        variant='primary'
        type='button'
        className='min-w-40'
        disabled={!dirty && !pending}
        busy={pending}
        count={errorCount}
        srLabel={`, ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`}
        onClick={() => {
          setFailure(null);
          setPending(true);
          save()
            .catch((cause) => {
              console.error('[tinacms] Save failed:', cause);
              let message = 'Save failed.';
              if (cause instanceof Error && cause.message) {
                message = cause.message;
              }
              setFailure(message);
              toast({ tone: 'error', title: 'Save failed', text: message });
            })
            .finally(() => setPending(false));
        }}
      >
        Save
      </Button>
      {failure ? (
        <p role='alert' className='text-sm text-destructive'>
          {failure}
        </p>
      ) : null}
    </div>
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
      className='flex flex-none items-start gap-2 border-t border-border bg-card px-4 py-3'
    >
      <div className='mt-1 min-w-0 flex-1'>
        <DocumentStatus />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              ref={menuButton}
              variant='icon'
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

const toastOwners = new Map<string, number>();
const TOAST_REMOUNT_GRACE_MS = 400;

// The prompt is a bottom-right toast, so the form stays editable behind it. One
// toast per document: its id holds the path, and leaving the document removes it.
function ResumeDraftToast({ scope }: { scope: FormScope }) {
  const stale = useStaleDraft();
  const values = useFormValues(scope.formId);
  const [confirming, setConfirming] = useState(false);
  const discardButton = useRef<HTMLElement | null>(null);
  const cause = stale?.cause;
  const fields = stale?.leftoverFields.join(', ');
  // `stale` is a new object whenever the form changes. The toast must not show
  // again for that, so the effect keys on what the toast says, and the buttons
  // read the latest actions. While the confirm is open the buttons do nothing.
  const resume = useEffectEvent(() => {
    if (!confirming) stale?.resume();
  });
  const askToDiscard = useEffectEvent(() => {
    if (confirming) return;
    discardButton.current = document.activeElement as HTMLElement | null;
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
      actionsInline: true,
      title: 'Resume your unsaved edits?',
      text:
        cause === 'leftover'
          ? `Your earlier edit to ${fields} is still kept.`
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
  }, [cause, fields, toastId]);
  // A change of wording replaces the toast in place; only an empty list or a
  // different document takes it away.
  const present = cause !== undefined;
  useEffect(() => {
    if (!present) return;
    toastOwners.set(toastId, (toastOwners.get(toastId) ?? 0) + 1);
    return () => {
      toastOwners.set(toastId, (toastOwners.get(toastId) ?? 1) - 1);
      // The form unmounts while a save reloads its document. A form that comes
      // back soon keeps the toast, because Sonner drops a toast that is dismissed
      // and shown again under one id.
      setTimeout(() => {
        if (!toastOwners.get(toastId)) toast.dismiss(toastId);
      }, TOAST_REMOUNT_GRACE_MS);
    };
  }, [present, toastId]);
  return (
    <DiscardConfirm
      open={confirming}
      onOpenChange={setConfirming}
      onConfirm={() => stale?.discard()}
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
  const unstored = useFormStore((state) => state.unstored[scope.formId]);
  useEffect(() => {
    if (!unstored || warnedStorage.has(scope.path)) return;
    warnedStorage.add(scope.path);
    toast({
      id: `storage-warning:${scope.path}`,
      tone: 'warning',
      title: 'Edits can’t be stored in this browser',
      text: 'The browser’s storage is full or blocked. Free space, then reload.',
      dismissible: true,
      duration: Number.POSITIVE_INFINITY,
    });
  }, [unstored, scope.path]);
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
      <FieldNode address={current.address} node={current.node} />
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
