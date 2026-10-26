import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable } from '@tinacms/ui/components/data-table';
import { DiffView } from '@tinacms/ui/components/diff-view';
import { DropdownMenuItem } from '@tinacms/ui/components/dropdown-menu';
import { EmptyState } from '@tinacms/ui/components/empty-state';
import { ListCard } from '@tinacms/ui/components/list-card';
import { ListRow } from '@tinacms/ui/components/list-row';
import { Tile } from '@tinacms/ui/components/tile';

describe('ListRow', () => {
  it('marks the matched words and announces a selected row as pressed', () => {
    render(<ListRow title='About Tina' match='tina' selected />);
    const row = screen.getByRole('button', { name: 'About Tina' });
    expect(row).toHaveAttribute('aria-pressed', 'true');
    expect(within(row).getByText('Tina').tagName).toBe('MARK');
  });

  it('does nothing when a disabled row is pressed, and stays focusable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ListRow
        title='Preparing'
        meta='Not ready yet'
        disabled
        onClick={onClick}
      />
    );
    await user.tab();
    const row = screen.getByRole('button', { name: /Preparing/ });
    expect(row).toHaveFocus();
    expect(row).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Enter} ');
    await user.click(row);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps the action outside the row button, as a second Tab stop', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ListRow
        title='About'
        actionLabel='Commit'
        actionAria='Commit About'
        onAction={onAction}
      />
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'About' })).toHaveFocus();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('shows the Unsaved tag on the row', () => {
    render(<ListRow title='About' unsaved />);
    expect(screen.getByText('Unsaved')).toBeVisible();
  });
});

describe('Tile', () => {
  it('opens from the title and keeps the action as a second stop', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onAction = vi.fn();
    render(
      <Tile
        title='Docs'
        meta='148 documents'
        unsaved='Unsaved'
        actionLabel='New'
        onOpen={onOpen}
        onAction={onAction}
      />
    );
    expect(screen.getByText('Unsaved')).toBeVisible();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Docs' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledOnce();
    await user.tab();
    expect(screen.getByRole('button', { name: 'New in Docs' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('shows no Unsaved tag unless asked', () => {
    render(<Tile title='Docs' />);
    expect(screen.queryByText('Unsaved')).toBeNull();
  });
});

describe('ListCard', () => {
  it('shows the error count while closed and none while open', () => {
    const { rerender } = render(
      <ListCard
        kind='group'
        name='Question 1'
        summary='Why?'
        errorCount={2}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText(/2 errors/)).toBeInTheDocument();
    rerender(
      <ListCard
        kind='group'
        name='Question 1'
        summary='Why?'
        errorCount={2}
        open
        onToggle={() => {}}
      >
        <p>Fields</p>
      </ListCard>
    );
    expect(screen.queryByText(/2 errors/)).toBeNull();
    expect(
      screen.getByRole('button', { name: /^Question 1:/ })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('has no grip and no menu when read-only', () => {
    render(
      <ListCard
        name='Tag 1'
        value='news'
        readOnly
        actions={<DropdownMenuItem>Duplicate</DropdownMenuItem>}
      />
    );
    expect(screen.queryByRole('button', { name: 'Move Tag 1' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Actions for Tag 1' })
    ).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Tag 1' })).toHaveAttribute(
      'readonly'
    );
  });

  it('offers Remove as a destructive menu row', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <ListCard
        name='Tag 1'
        value='news'
        actions={
          <DropdownMenuItem variant='destructive' onClick={onRemove}>
            Remove
          </DropdownMenuItem>
        }
      />
    );
    await user.click(screen.getByRole('button', { name: 'Actions for Tag 1' }));
    const remove = await screen.findByRole('menuitem', { name: 'Remove' });
    expect(remove).toHaveAttribute('data-variant', 'destructive');
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('moves with the arrow keys from the grip', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<ListCard name='Tag 1' value='news' onMove={onMove} />);
    screen.getByRole('button', { name: 'Move Tag 1' }).focus();
    await user.keyboard('{ArrowDown}{ArrowUp}');
    expect(onMove.mock.calls).toEqual([[1], [-1]]);
  });

  it('carries no unsaved marker', () => {
    render(<ListCard name='Tag 1' value='news' />);
    expect(screen.queryByText('Unsaved')).toBeNull();
  });
});

describe('EmptyState', () => {
  it('shows the way out only with an action, and announces when live', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { rerender } = render(
      <EmptyState text='Nothing here.' actionLabel='Clear filters' />
    );
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull();
    rerender(
      <EmptyState
        text='Nothing here.'
        actionLabel='Clear filters'
        onAction={onAction}
        live
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Nothing here.');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe('DiffView', () => {
  it('gives each line a sign and a spoken prefix, so colour is never the only signal', () => {
    render(
      <DiffView
        label='Description'
        lines={[
          { type: 'del', text: 'Old words' },
          { type: 'add', text: 'New words' },
          { type: 'ctx', text: 'Same words' },
        ]}
      />
    );
    const group = screen.getByRole('group', { name: 'Changes to Description' });
    expect(group).toHaveTextContent('Removed: Old words');
    expect(group).toHaveTextContent('Added: New words');
    expect(group).toHaveTextContent('Unchanged: Same words');
    expect(group).toHaveTextContent('−');
    expect(group).toHaveTextContent('+');
  });
});

describe('DataTable', () => {
  const rows = [
    {
      title: { type: 'link', text: 'About' } as const,
      status: { type: 'badge', text: 'Unsaved', kind: 'unsaved' } as const,
    },
  ];

  it('sorts from a header button and announces the order', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <DataTable
        caption='Docs documents'
        columns={[
          { key: 'title', label: 'Title', sort: 'asc', onSort },
          { key: 'status', label: 'Status' },
        ]}
        rows={rows}
      />
    );
    expect(screen.getByRole('columnheader', { name: /Title/ })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
    expect(
      screen.getByRole('columnheader', { name: 'Status' })
    ).not.toHaveAttribute('aria-sort');
    await user.click(screen.getByRole('button', { name: /Title/ }));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it('opens a row from its first cell', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DataTable
        caption='Docs documents'
        columns={[{ key: 'title', label: 'Title' }]}
        rows={[{ title: { type: 'link', text: 'About', onClick } }]}
      />
    );
    await user.click(screen.getByRole('button', { name: 'About' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows the live empty state with no rows', () => {
    render(
      <DataTable
        caption='Docs documents'
        columns={[{ key: 'title', label: 'Title' }]}
        rows={[]}
        emptyText='No matches.'
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('No matches.');
  });

  it('puts the filter above and the page words below', () => {
    render(
      <DataTable
        caption='Docs documents'
        columns={[{ key: 'title', label: 'Title' }]}
        rows={rows}
        filter={<input aria-label='Search titles' />}
        pagination={{ total: 48, page: 2, pageSize: 10 }}
      />
    );
    expect(
      screen.getByRole('textbox', { name: 'Search titles' })
    ).toBeVisible();
    expect(screen.getByText(/Showing 11 to 20 of 48/)).toBeInTheDocument();
  });
});
