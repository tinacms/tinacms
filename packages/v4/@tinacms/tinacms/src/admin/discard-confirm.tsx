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
import type { RefObject } from 'react';

/**
 * Discarding cannot be undone, so it asks first. Cancel and Escape keep everything
 * and return focus to `returnFocusTo`.
 */
export function DiscardConfirm({
  open,
  onOpenChange,
  onConfirm,
  returnFocusTo,
  title = 'Discard unsaved edits?',
  description = 'Discarding can’t be undone.',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  returnFocusTo?: RefObject<HTMLElement | null>;
  title?: string;
  description?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent finalFocus={returnFocusTo}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
