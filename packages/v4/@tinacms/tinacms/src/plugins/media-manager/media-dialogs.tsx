import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@tinacms/ui/components/alert-dialog';
import { Button } from '@tinacms/ui/components/button';
import { Input } from '@tinacms/ui/components/input';
import { Label } from '@tinacms/ui/components/label';
import { type FormEvent, useId, useState } from 'react';
import { MediaRenameError } from '../../core/media/contract';
import { previewRename, splitFilename } from './media-types';

const renameFailureOf = (cause: unknown, attemptedName: string): string => {
  if (cause instanceof MediaRenameError) {
    switch (cause.code) {
      case 'name-taken':
        return `A file named "${attemptedName}" already exists in this folder. Choose a different name.`;
      case 'not-found':
        return 'This file no longer exists. Refresh the media library and try again.';
      case 'invalid-name':
      case 'invalid-path':
        return "That name isn't valid. Avoid slashes and special characters.";
      case 'unauthorized':
        return "You don't have permission to rename this file.";
      case 'unsupported':
        return cause.message || 'This media store does not support renaming.';
      case 'backend-failure':
        return cause.message || 'Failed to rename the file. Please try again.';
    }
  }
  if (cause instanceof Error && cause.message) {
    return cause.message;
  } else {
    return 'Failed to rename the file. Please try again.';
  }
};

const closeOn =
  (onClose: () => void, busy = false) =>
  (open: boolean) => {
    if (!open && !busy) onClose();
  };

export function DeleteDialog({
  filename,
  onConfirm,
  onClose,
}: {
  filename: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={closeOn(onClose)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {filename}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{filename}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='button' variant='destructive' onClick={onConfirm}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function RenameDialog({
  filename,
  onRename,
  onClose,
}: {
  filename: string;
  onRename: (nextFilename: string) => Promise<void>;
  onClose: () => void;
}) {
  const inputId = useId();
  const [nextBase, setNextBase] = useState(() => splitFilename(filename).base);
  const [processing, setProcessing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const { sanitized, extension, valid, preview, hint } = previewRename(
    nextBase,
    filename
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (processing || !valid) return;
    setProcessing(true);
    setFailure(null);
    try {
      await onRename(sanitized);
      onClose();
    } catch (cause) {
      setFailure(renameFailureOf(cause, sanitized));
      setProcessing(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={closeOn(onClose, processing)}>
      <AlertDialogContent>
        <form className='flex flex-col gap-4' onSubmit={submit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename {filename}</AlertDialogTitle>
            <AlertDialogDescription>
              Renaming this file does not update existing content that uses the
              old path.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex flex-col gap-2'>
            <Label htmlFor={inputId}>File name</Label>
            <div className='flex items-center gap-2'>
              <Input
                id={inputId}
                value={nextBase}
                required
                disabled={processing}
                onChange={(event) => {
                  setNextBase(event.target.value);
                  setFailure(null);
                }}
              />
              {extension ? (
                <span className='shrink-0 text-muted-foreground'>
                  {extension}
                </span>
              ) : null}
            </div>
            {preview ? (
              <p className='text-sm text-muted-foreground'>
                Will be saved as <strong>{preview}</strong>
              </p>
            ) : null}
            {hint ? (
              <p className='text-sm text-muted-foreground'>{hint}</p>
            ) : null}
            {failure ? (
              <p role='alert' className='text-sm text-destructive'>
                {failure}
              </p>
            ) : null}
          </div>
          <AlertDialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={processing}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={processing || !valid}>
              {processing ? 'Renaming…' : 'Rename'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function NewFolderDialog({
  onCreate,
  onClose,
}: {
  onCreate: (name: string) => void;
  onClose: () => void;
}) {
  const inputId = useId();
  const [name, setName] = useState('');
  const folderName = name.trim().replace(/^\/+|\/+$/g, '');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!folderName) return;
    onCreate(folderName);
    onClose();
  };

  return (
    <AlertDialog open onOpenChange={closeOn(onClose)}>
      <AlertDialogContent>
        <form className='flex flex-col gap-4' onSubmit={submit}>
          <AlertDialogHeader>
            <AlertDialogTitle>New Folder</AlertDialogTitle>
            <AlertDialogDescription>
              If you leave the folder before you upload a file to it, the folder
              disappears.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex flex-col gap-2'>
            <Label htmlFor={inputId}>Folder name</Label>
            <Input
              id={inputId}
              value={name}
              required
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={!folderName}>
              Create New Folder
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
