import { type FormEvent, type RefObject, useId, useRef, useState } from 'react';

import { Button } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';

type SaveToBranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `protected`: the branch takes no direct saves. `deleted`: the branch is gone. */
  reason?: 'protected' | 'deleted';
  branch: string;
  /** The document's title, or its file name when it has none. */
  document: string;
  /** The name the field starts with when `name` is not controlled. */
  defaultName?: string;
  name?: string;
  onNameChange?: (name: string) => void;
  /** Why the name cannot be used, shown at the field. */
  error?: string;
  /** While true the main action is busy and nothing can close the dialog. */
  saving?: boolean;
  /** `false` turns the main action off, as when nothing can make the branch yet. */
  canSave?: boolean;
  onSave: (name: string) => void;
  onCancel?: () => void;
  /** Where focus goes when the dialog closes. */
  returnFocusTo?: RefObject<HTMLElement | null>;
};

const WORDS = {
  protected: { action: 'Save' },
  deleted: { action: 'Save to new branch' },
} as const;

/** Asks for the name of the branch an edit goes to, when it cannot go where it was made. */
function SaveToBranchDialog({
  open,
  onOpenChange,
  reason = 'protected',
  branch,
  document,
  defaultName = '',
  name: controlledName,
  onNameChange,
  error,
  saving = false,
  canSave = true,
  onSave,
  onCancel,
  returnFocusTo,
}: SaveToBranchDialogProps) {
  const [ownName, setOwnName] = useState(defaultName);
  const name = controlledName ?? ownName;
  const input = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const deleted = reason === 'deleted';

  const close = () => {
    if (saving) return;
    onCancel?.();
    onOpenChange(false);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    onSave(name);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
        else onOpenChange(true);
      }}
    >
      <DialogContent
        showCloseButton={false}
        initialFocus={input}
        finalFocus={returnFocusTo}
        aria-busy={saving || undefined}
      >
        <form className='flex flex-col gap-4' noValidate onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className='[overflow-wrap:anywhere]'>
              {deleted ? `${branch} was deleted` : 'Save to a new branch'}
            </DialogTitle>
            <DialogDescription className='[overflow-wrap:anywhere]'>
              {deleted
                ? `“${document}” wasn’t saved. Your edits are kept: save them to a new branch.`
                : `${branch} is protected. Your edits to “${document}” go to a new branch with a pull request.`}
            </DialogDescription>
          </DialogHeader>
          <FieldWrapper
            label='New branch name'
            htmlFor={`${errorId}-name`}
            required
          >
            <Input
              ref={input}
              id={`${errorId}-name`}
              aria-required
              autoComplete='off'
              spellCheck={false}
              value={name}
              readOnly={saving}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                setOwnName(event.target.value);
                onNameChange?.(event.target.value);
              }}
            />
            {error ? (
              <p
                id={errorId}
                role='alert'
                className='m-0 text-sm text-destructive [overflow-wrap:anywhere]'
              >
                {error}
              </p>
            ) : null}
          </FieldWrapper>
          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              disabled={saving}
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              busy={saving}
              disabled={!canSave}
            >
              {saving ? 'Saving' : WORDS[reason].action}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export type { SaveToBranchDialogProps };
export { SaveToBranchDialog };
