import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@tinacms/ui/components/alert-dialog';
import { Button } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@tinacms/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { Input } from '@tinacms/ui/components/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@tinacms/ui/components/sheet';
import { Toaster } from '@tinacms/ui/components/sonner';
import { Toast, toast } from '@tinacms/ui/components/toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';

const overlays: Array<{
  name: string;
  role: 'dialog' | 'alertdialog';
  render: (body: ReactNode) => ReactNode;
}> = [
  {
    name: 'Dialog',
    role: 'dialog',
    render: (body) => (
      <Dialog>
        <DialogTrigger render={<Button>Open</Button>} />
        <DialogContent>
          <DialogTitle>Create a branch</DialogTitle>
          {body}
          <DialogFooter>
            <Button variant='primary'>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    name: 'AlertDialog',
    role: 'alertdialog',
    render: (body) => (
      <AlertDialog>
        <AlertDialogTrigger render={<Button>Open</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Create a branch</AlertDialogTitle>
          {body}
          <AlertDialogFooter>
            <Button variant='primary'>Create</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  {
    name: 'Sheet',
    role: 'dialog',
    render: (body) => (
      <Sheet>
        <SheetTrigger render={<Button>Open</Button>} />
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create a branch</SheetTitle>
          </SheetHeader>
          {body}
          <Button variant='primary'>Create</Button>
        </SheetContent>
      </Sheet>
    ),
  },
];

describe.each(overlays)('$name', ({ role, render: renderOverlay }) => {
  it('moves focus in, keeps Tab inside, and returns focus on Escape', async () => {
    const user = userEvent.setup();
    render(
      <>
        {renderOverlay(<Input aria-label='Branch name' />)}
        <Button>Outside</Button>
      </>
    );
    const opener = screen.getByRole('button', { name: 'Open' });
    await user.click(opener);
    const overlay = await screen.findByRole(role, { name: 'Create a branch' });
    await waitFor(() =>
      expect(overlay).toContainElement(document.activeElement as HTMLElement)
    );

    for (let i = 0; i < 4; i++) {
      await user.tab();
      expect(overlay).toContainElement(document.activeElement as HTMLElement);
    }

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole(role)).toBeNull());
    expect(opener).toHaveFocus();
  });
});

function renderMenu(onDiscard = vi.fn()) {
  render(
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button>Document actions</Button>} />
      <DropdownMenuContent aria-label='Document actions'>
        <DropdownMenuItem hint='in Docs'>Duplicate</DropdownMenuItem>
        <DropdownMenuItem disabled hint='Saving'>
          Rename
        </DropdownMenuItem>
        <DropdownMenuCheckboxItem defaultChecked>
          Show uncommitted only
        </DropdownMenuCheckboxItem>
        <DropdownMenuLinkItem href='https://tina.io'>Docs</DropdownMenuLinkItem>
        <DropdownMenuItem variant='destructive' onClick={onDiscard}>
          Discard unsaved edits
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return onDiscard;
}

describe('DropdownMenu', () => {
  it('moves with the arrow keys, wraps round, and a greyed item does nothing', async () => {
    const user = userEvent.setup();
    renderMenu();
    screen.getByRole('button', { name: 'Document actions' }).focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu', { name: 'Document actions' });
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: /Duplicate/ })).toHaveFocus()
    );
    await user.keyboard('{ArrowDown}');
    const rename = screen.getByRole('menuitem', { name: /Rename/ });
    expect(rename).toHaveFocus();
    expect(rename).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{End}');
    expect(
      screen.getByRole('menuitem', { name: 'Discard unsaved edits' })
    ).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /Duplicate/ })).toHaveFocus();
  });

  it('picks with Enter and closes', async () => {
    const user = userEvent.setup();
    const onDiscard = renderMenu();
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    const discard = await screen.findByRole('menuitem', {
      name: 'Discard unsaved edits',
    });
    expect(discard).toHaveAttribute('data-variant', 'destructive');
    discard.focus();
    await user.keyboard('{Enter}');
    expect(onDiscard).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('closes on Escape and returns focus to its button', async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Document actions' });
    await user.click(trigger);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('says a link item opens a new tab', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    const link = await screen.findByRole('menuitem', {
      name: 'Docs (opens in a new tab)',
    });
    expect(link).toHaveAttribute('target', '_blank');
  });
});

describe('Tooltip', () => {
  it('opens on keyboard focus and closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger
          render={<Button variant='icon' icon='search' aria-label='Search' />}
        />
        <TooltipContent>Search</TooltipContent>
      </Tooltip>
    );
    await user.tab();
    const bubble = () =>
      document.querySelector('[data-slot="tooltip-content"]');
    await waitFor(() => expect(bubble()).toHaveTextContent('Search'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(bubble()).toBeNull());
  });
});

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    { title: 'Changes saved', tone: 'success', role: 'status' },
    { title: 'Couldn’t save', tone: 'error', role: 'alert' },
    { title: 'Link copied', tone: 'neutral', role: 'status' },
  ] as const)('$title is announced as $role', ({ title, tone, role }) => {
    render(<Toast tone={tone} title={title} />);
    expect(screen.getByRole(role)).toHaveTextContent(title);
  });

  it('names its actions and its dismiss button', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    render(
      <Toast
        tone='error'
        title='Couldn’t save'
        text='Your edits are kept.'
        action={{ label: 'Retry', onClick: onRetry }}
        onDismiss={onDismiss}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('shows from toast() without taking focus, and an error stays', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <>
        <Toaster />
        <Button>Save</Button>
      </>
    );
    const save = screen.getByRole('button', { name: 'Save' });
    save.focus();
    act(() => {
      toast({ tone: 'error', title: 'Couldn’t save' });
      toast({ tone: 'success', title: 'Changes saved' });
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t save');
    expect(save).toHaveFocus();
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    await waitFor(() => expect(screen.queryByText('Changes saved')).toBeNull());
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t save');
  });

  it('replaces a toast by id, and runs onDismiss when code dismisses it', async () => {
    const onDismiss = vi.fn();
    render(<Toaster />);
    act(() => {
      toast({ id: 'save', tone: 'info', title: 'Saving', onDismiss });
      toast({ id: 'save', tone: 'success', title: 'Changes saved', onDismiss });
    });
    expect(await screen.findByText('Changes saved')).toBeInTheDocument();
    expect(screen.queryByText('Saving')).toBeNull();
    act(() => {
      toast.dismiss('save');
    });
    await waitFor(() => expect(screen.queryByText('Changes saved')).toBeNull());
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
