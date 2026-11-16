import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@tinacms/ui/components/alert-dialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { TinaErrorSummaryPane } from '@tinacms/ui/components/error-summary-pane';
import { Input } from '@tinacms/ui/components/input';
import { Sheet, SheetContent, SheetTitle } from '@tinacms/ui/components/sheet';
import { guardConsole } from '../test/console-guard';

guardConsole();

const stubWidth = (width: number) =>
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = Number(/min-width: (\d+)px/.exec(query)?.[1] ?? 0);
    return {
      matches: width >= min,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

afterEach(() => vi.unstubAllGlobals());

describe('a dialog on a phone', () => {
  beforeEach(() => stubWidth(390));

  const open = (props: { keepOnDismiss?: boolean } = {}) => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} {...props}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Rename</DialogTitle>
          <Input aria-label='Name' />
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    return onOpenChange;
  };

  it('opens with focus in the field and shows a handle and × even without showCloseButton', async () => {
    open();
    expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Close sheet' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it.each(['Close sheet', 'Close', 'Cancel'])(
    'closes with %s',
    async (name) => {
      const onOpenChange = open();
      await userEvent.click(await screen.findByRole('button', { name }));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange.mock.calls[0][0]).toBe(false);
    }
  );

  it('keeps the sheet on a handle tap while keepOnDismiss is set, but × still closes', async () => {
    const onOpenChange = open({ keepOnDismiss: true });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Close sheet' })
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('has no handle from 768px up', async () => {
    stubWidth(1280);
    open();
    await screen.findByRole('textbox', { name: 'Name' });
    expect(
      screen.queryByRole('button', { name: 'Close sheet' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Close' })
    ).not.toBeInTheDocument();
  });
});

describe('a confirm', () => {
  const open = () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <AlertDialog open onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>Discard?</AlertDialogTitle>
          <AlertDialogDescription>Edits are lost.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <button type='button' onClick={onConfirm}>
              Discard
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    return { onOpenChange, onConfirm };
  };
  const scrim = () =>
    document.querySelector<HTMLElement>(
      '[data-slot="foot-sheet-scrim"], [data-slot="alert-dialog-overlay"]'
    );

  it('counts × , the handle, the scrim and Escape as Cancel on a phone', async () => {
    stubWidth(390);
    const { onOpenChange, onConfirm } = open();
    expect(
      await screen.findByRole('alertdialog', { name: 'Discard?' })
    ).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close sheet' }));
    await userEvent.click(scrim() as HTMLElement);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledTimes(4);
    for (const [next] of onOpenChange.mock.calls) expect(next).toBe(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('ignores a scrim click from 768px up', async () => {
    stubWidth(1280);
    const { onOpenChange } = open();
    await screen.findByRole('alertdialog');
    await userEvent.click(scrim() as HTMLElement);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('the error list on a phone', () => {
  beforeEach(() => stubWidth(390));
  const ERRORS = [
    { id: 'e1', label: 'Title', message: 'Enter a title.' },
    { id: 'e2', label: 'Heading', message: 'Enter a heading.' },
  ];

  it('is a dialog named Errors with × and a handle, and no Pin or Esc hint', async () => {
    render(<TinaErrorSummaryPane errors={ERRORS} />);
    const dialog = await screen.findByRole('dialog', { name: /^Errors/ });
    expect(dialog).toHaveAccessibleName(expect.stringContaining('2'));
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Close sheet' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /pin/i })).toBeNull();
    expect(screen.queryByText(/to hide/)).toBeNull();
    expect(screen.getAllByText('Go to field')).toHaveLength(2);
  });

  it('keeps its element in the page while closed', () => {
    render(<TinaErrorSummaryPane errors={ERRORS} open={false} />);
    expect(document.getElementById('error-pane')).not.toBeNull();
  });

  it('closes on a row tap, then selects the row once, even on a double tap', async () => {
    const order: string[] = [];
    const onSelect = vi.fn(() => order.push('select'));
    const onClose = vi.fn(() => order.push('close'));
    const view = render(
      <TinaErrorSummaryPane
        errors={ERRORS}
        onSelect={onSelect}
        onClose={onClose}
      />
    );
    const row = await screen.findByRole('button', { name: /^Heading/ });
    await userEvent.dblClick(row);
    expect(onClose).toHaveBeenCalledTimes(1);
    view.rerender(
      <TinaErrorSummaryPane
        errors={ERRORS}
        open={false}
        onSelect={onSelect}
        onClose={onClose}
      />
    );
    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    expect(onSelect).toHaveBeenCalledWith(ERRORS[1]);
    expect(order).toEqual(['close', 'select']);
  });

  it('calls onClose once on Escape', async () => {
    const onClose = vi.fn();
    render(<TinaErrorSummaryPane errors={ERRORS} onClose={onClose} />);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('floats with Pin from 768px up', () => {
    stubWidth(1280);
    render(<TinaErrorSummaryPane errors={ERRORS} wide />);
    expect(screen.getByRole('button', { name: 'Pin' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Close sheet' })).toBeNull();
  });
});

describe('a sheet', () => {
  const open = (side: 'left' | 'right' | 'bottom') =>
    render(
      <Sheet open>
        <SheetContent side={side} className='w-(--sidebar-width)'>
          <SheetTitle>Panel</SheetTitle>
          <Input aria-label='Name' />
        </SheetContent>
      </Sheet>
    );

  it.each(['left', 'right'] as const)(
    'fills the width of a phone on the %s',
    async (side) => {
      stubWidth(390);
      open(side);
      const panel = await screen.findByRole('dialog', { name: 'Panel' });
      expect(panel.className.split(' ').at(-1)).toBe('w-full');
    }
  );

  it('keeps the caller’s width from 768px up', async () => {
    stubWidth(1280);
    open('right');
    const panel = await screen.findByRole('dialog', { name: 'Panel' });
    expect(panel.className.split(' ')).not.toContain('w-full');
    expect(panel.className).toContain('w-(--sidebar-width)');
  });

  it('is a foot sheet at the bottom on a phone, and not from 768px up', async () => {
    stubWidth(390);
    const view = open('bottom');
    expect(
      await screen.findByRole('button', { name: 'Close sheet' })
    ).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    view.unmount();
    stubWidth(1280);
    open('bottom');
    await screen.findByRole('dialog', { name: 'Panel' });
    expect(screen.queryByRole('button', { name: 'Close sheet' })).toBeNull();
  });
});
