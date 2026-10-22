import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AddInput } from '@tinacms/ui/components/add-button';
import { Button, buttonVariants } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@tinacms/ui/components/dialog';

describe('Button', () => {
  it('names an icon button from its string children', () => {
    render(
      <Button variant='icon' icon='close'>
        Close panel
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Close panel' })).toBeVisible();
  });

  it('activates from the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('exposes a single-press shortcut as aria-keyshortcuts', () => {
    render(<Button shortcut='⌘K'>Search</Button>);
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute(
      'aria-keyshortcuts',
      'Meta+K'
    );
  });

  it('shows the corner count from 1 only', () => {
    const { rerender } = render(
      <Button variant='icon' icon='changes' count={0} aria-label='Changes' />
    );
    expect(screen.queryByText('0')).toBeNull();
    rerender(
      <Button variant='icon' icon='changes' count={3} aria-label='Changes, 3' />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('styles a link through buttonVariants', () => {
    render(
      <a
        href='https://tina.io/docs'
        className={buttonVariants({ variant: 'primary' })}
      >
        Docs
      </a>
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveClass(
      'bg-primary'
    );
  });

  it('keeps the name and icon when a dialog renders it as its close button', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Rename</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close.querySelector('svg')).not.toBeNull();
  });
});

describe('AddInput', () => {
  it('adds the trimmed text on Enter and clears', async () => {
    const onAdd = vi.fn();
    render(<AddInput label='Add a tag' onAdd={onAdd} />);
    const input = screen.getByRole('textbox', { name: 'Add a tag' });
    await userEvent.type(input, '  news  {Enter}');
    expect(onAdd).toHaveBeenCalledWith('news');
    expect(input).toHaveValue('');
  });

  it('ignores Enter on blank text', async () => {
    const onAdd = vi.fn();
    render(<AddInput label='Add a tag' onAdd={onAdd} />);
    await userEvent.type(screen.getByRole('textbox'), '   {Enter}');
    expect(onAdd).not.toHaveBeenCalled();
  });
});
