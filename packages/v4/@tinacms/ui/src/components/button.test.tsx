import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AddInput } from '@tinacms/ui/components/add-button';
import {
  Button,
  type ButtonVariant,
  buttonHeight,
  buttonVariants,
} from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
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

  it('is always a button: links style an <a> with buttonVariants instead', () => {
    // @ts-expect-error Button has no href; a link would get role="button"
    render(<Button href='/docs'>Docs</Button>);
    expect(screen.queryByRole('link')).toBeNull();
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

describe('Button variants', () => {
  it('gives every variant of one size the same height', () => {
    const variants: ButtonVariant[] = [
      'primary',
      'outline',
      'ghost',
      'destructive',
      'icon',
    ];
    for (const size of ['md', 'sm'] as const) {
      for (const variant of variants) {
        const classes = buttonVariants({ variant, size }).split(' ');
        expect(classes).toContain(buttonHeight[size]);
        expect(classes).not.toContain(
          buttonHeight[size === 'md' ? 'sm' : 'md']
        );
      }
    }
  });

  it('rejects removed variants and selected on variants that cannot be selected', () => {
    // @ts-expect-error secondary is outline now
    void (<Button variant='secondary'>Cancel</Button>);
    // @ts-expect-error toolbar is outline now
    void (<Button variant='toolbar'>Filter</Button>);
    // @ts-expect-error inverse is gone
    void (<Button variant='inverse'>Undo</Button>);
    // @ts-expect-error only outline and icon can be selected
    void (<Button variant='primary' selected />);
    // @ts-expect-error a destructive button supplies its own bin
    void (<Button variant='destructive' icon='doc' />);
  });

  it('is outline by default', () => {
    render(<Button>Open</Button>);
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute(
      'data-slot',
      'button'
    );
  });

  it('always draws the bin on a destructive button, once', () => {
    render(<Button variant='destructive'>Delete</Button>);
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.querySelectorAll('svg')).toHaveLength(1);
    expect(button.querySelector('.lucide-trash2')).not.toBeNull();
  });

  it('draws a red bin alone for a destructive icon button', () => {
    render(
      <Button variant='icon' destructive>
        Remove beach.jpg
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Remove beach.jpg' });
    expect(button.querySelectorAll('svg')).toHaveLength(1);
    expect(button.querySelector('.lucide-trash2')).not.toBeNull();
  });
});

describe('Button disabled', () => {
  it('ignores presses and shows no tooltip on an icon button', async () => {
    const onClick = vi.fn();
    render(
      <Button variant='icon' icon='close' disabled onClick={onClick}>
        Close panel
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Close panel' });
    expect(button).toBeDisabled();
    await userEvent.hover(button);
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.queryByText('Close panel')).toBeNull();
  });
});

describe('Icon button tooltip', () => {
  it('shows the name and shortcut on keyboard focus', async () => {
    render(
      <Button variant='icon' icon='search' shortcut='⌘K'>
        Search
      </Button>
    );
    await userEvent.tab();
    const tip = await screen.findByText('⌘K', {
      selector: '[data-slot=tooltip-content] kbd',
    });
    expect(tip.closest('[data-slot=tooltip-content]')).toHaveTextContent(
      'Search'
    );
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute(
      'aria-keyshortcuts',
      'Meta+K'
    );
  });

  it('still opens the menu when it is the render target of a menu trigger', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant='icon' icon='more'>
              More actions
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Rename' })
    ).toBeVisible();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});

describe('Button busy', () => {
  it('shows a spinner, ignores presses and stays focusable', async () => {
    const onClick = vi.fn();
    render(
      <Button variant='primary' busy icon='doc' onClick={onClick}>
        Save
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button.querySelector('.lucide-loader-circle')).not.toBeNull();
    expect(button.querySelectorAll('svg')).toHaveLength(1);
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.click(button);
    await userEvent.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not submit a form while busy', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button variant='primary' type='submit' busy>
          Save
        </Button>
      </form>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('lets disabled win over busy', () => {
    render(
      <Button busy disabled>
        Save
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

describe('Button count', () => {
  it('reads an error count as words after the name', () => {
    render(
      <Button variant='primary' count={3} srLabel=', 3 errors'>
        Save
      </Button>
    );
    expect(
      screen.getByRole('button', { name: /^Save\s?, 3 errors$/ })
    ).toBeVisible();
  });

  it('shows nothing for a count of 0', () => {
    render(
      <Button variant='primary' count={0} srLabel=', 0 errors'>
        Save
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
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
