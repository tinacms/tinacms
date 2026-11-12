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

const closeOn =
  (onClose: () => void, busy = false) =>
  (open: boolean) => {
    if (!open && !busy) onClose();
  };

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
            <Button type='button' variant='ghost' onClick={onClose}>
              Cancel
            </Button>
            <Button variant='primary' type='submit' disabled={!folderName}>
              Create New Folder
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
