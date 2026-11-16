import { Button } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
        <DialogTitle>Plain</DialogTitle>
        <div style={{ flexShrink: 0, height: 1500 }}>A long body.</div>
        <DialogFooter>
          <DialogClose render={<Button variant='ghost' />}>Cancel</DialogClose>
        </DialogFooter>
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
const cases = { sheet: <Panel />, plain: <Plain />, branch: <Branch /> };
createRoot(root).render(
  cases[
    params.get('case') === 'sheet'
      ? 'sheet'
      : params.get('case') === 'plain'
        ? 'plain'
        : 'branch'
  ]
);
