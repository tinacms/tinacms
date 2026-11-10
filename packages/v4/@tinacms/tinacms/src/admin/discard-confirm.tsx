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

// The dialog opens on Cancel whatever held focus before, such as a field the editor
// was typing in.
// `focusVisible` makes the ring show after a click; TypeScript's FocusOptions lacks it.
const FOCUS_WITH_RING: FocusOptions & { focusVisible: boolean } = {
  focusVisible: true,
};
const focusOnMount = (node: HTMLButtonElement | null) => {
  if (node) requestAnimationFrame(() => node.focus(FOCUS_WITH_RING));
};

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
  description = 'The document goes back to its last saved version. Discarded edits can’t be brought back.',
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
          <AlertDialogTitle className='[overflow-wrap:anywhere]'>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className='[overflow-wrap:anywhere]'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button
                ref={focusOnMount}
                variant='outline'
                className='focus:shadow-focus-ring'
              />
            }
          >
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
