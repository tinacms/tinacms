import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@tinacms/ui/components/alert-dialog';
import { Button } from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { FormLevel } from '@tinacms/ui/components/form-level';
import { toast } from '@tinacms/ui/components/toast';
import {
  type ReactNode,
  type RefObject,
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
  useIsFormDirty,
} from '../form/form-store';
import { countFailingFields } from '../editor/field-errors';
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

// Discarding cannot be undone, so it asks first. Cancel and Escape keep the edits.
function DiscardConfirm({
  open,
  onOpenChange,
  onConfirm,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  returnFocusTo?: RefObject<HTMLElement | null>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent finalFocus={returnFocusTo}>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved edits?</AlertDialogTitle>
          <AlertDialogDescription>
            Discarding can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant='outline' />}>
            Cancel
          </AlertDialogClose>
          <Button
            type='button'
            variant='destructive'
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Discard
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
        <DropdownMenuContent align='end' aria-label='Document actions'>
          <DropdownMenuItem
            variant='destructive'
            disabled={!dirty}
            onClick={() => setConfirming(true)}
          >
            Discard unsaved edits
          </DropdownMenuItem>
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

// The prompt is a bottom-right toast, so the form stays editable behind it.
function ResumeDraftToast() {
  const stale = useStaleDraft();
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!stale) return;
    const id = toast({
      tone: 'warning',
      actionsInline: true,
      title: 'Resume your unsaved edits?',
      text: 'The document changed since. Resume puts your edits on top.',
      dismissible: false,
      duration: Number.POSITIVE_INFINITY,
      action: { label: 'Resume', onClick: stale.resume },
      secondaryAction: {
        label: 'Discard',
        destructive: true,
        onClick: () => setConfirming(true),
      },
    });
    return () => {
      toast.dismiss(id);
    };
  }, [stale]);
  return (
    <DiscardConfirm
      open={confirming}
      onOpenChange={setConfirming}
      onConfirm={() => stale?.discard()}
    />
  );
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
      <ResumeDraftToast />
      <ActiveFieldLevels scope={scope} />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <FormFields scope={scope} />
      </div>
      <FormBar />
    </>
  );
}
