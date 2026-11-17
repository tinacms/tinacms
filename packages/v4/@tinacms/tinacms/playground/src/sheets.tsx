import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@tinacms/ui/components/alert-dialog';
import { Button } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tinacms/ui/components/dialog';
import { SaveToBranchDialog } from '@tinacms/ui/components/save-to-branch-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@tinacms/ui/components/sheet';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Bare overlays for the e2e tests. `?case=branch` shows "Save to a new branch" and counts what
// its callbacks hear (`name=` pre-fills it, `saving=1` holds it busy); `?case=sheet&side=` shows a
// sheet.
const params = new URLSearchParams(location.search);
const side = params.get('side');

function Branch() {
  const [calls, setCalls] = useState({ cancel: 0, open: 0 });
  return (
    <>
      <output id='calls'>{`cancel=${calls.cancel} open=${calls.open}`}</output>
      <SaveToBranchDialog
        open
        reason={params.get('reason') === 'deleted' ? 'deleted' : 'protected'}
        branch='main'
        document='Hello'
        defaultName={params.get('name') ?? ''}
        saving={params.get('saving') === '1'}
        onSave={() => {}}
        onCancel={() => setCalls((c) => ({ ...c, cancel: c.cancel + 1 }))}
        onOpenChange={() => setCalls((c) => ({ ...c, open: c.open + 1 }))}
      />
    </>
  );
}

function Plain() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plain</DialogTitle>
        </DialogHeader>
        <div style={{ flexShrink: 0, height: 1500 }}>A long body.</div>
        <DialogFooter>
          <DialogClose render={<Button variant='ghost' />}>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Nested() {
  return (
    <Dialog open>
      <DialogContent>
        <DialogTitle>Parent</DialogTitle>
        <DialogFooter>
          <Button>Parent action</Button>
        </DialogFooter>
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogTitle>Child</AlertDialogTitle>
            <AlertDialogFooter>
              <Button>Child action</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

function Panel() {
  return (
    <Sheet open>
      <SheetContent
        side={side === 'left' || side === 'bottom' ? side : 'right'}
      >
        <SheetTitle>Panel</SheetTitle>
        <SheetDescription>A bare sheet.</SheetDescription>
      </SheetContent>
    </Sheet>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('sheets.html is missing #root');
const cases = {
  sheet: <Panel />,
  plain: <Plain />,
  nested: <Nested />,
  branch: <Branch />,
};
const name = params.get('case');
createRoot(root).render(
  cases[
    name === 'sheet' || name === 'plain' || name === 'nested' ? name : 'branch'
  ]
);
