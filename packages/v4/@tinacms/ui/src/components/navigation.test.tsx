import { render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Breadcrumb } from '@tinacms/ui/components/breadcrumb';
import { DropdownMenuItem } from '@tinacms/ui/components/dropdown-menu';
import { NavRow } from '@tinacms/ui/components/nav-row';
import { Pagination } from '@tinacms/ui/components/pagination';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { StatusBar } from '@tinacms/ui/components/status-bar';
import { Tabs, TabsPanel } from '@tinacms/ui/components/tabs';

const tools = [
  { value: 'fields', label: 'Fields' },
  { value: 'history', label: 'History' },
  { value: 'references', label: 'References' },
  { value: 'translations', label: 'Translations' },
] as const;

describe('Tabs', () => {
  it('moves and shows tabs with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs
        tabs={tools}
        aria-label='Document tools'
        onValueChange={onValueChange}
      >
        {tools.map((tab) => (
          <TabsPanel key={tab.value} value={tab.value}>
            {tab.label} panel
          </TabsPanel>
        ))}
      </Tabs>
    );
    expect(
      screen.getByRole('tablist', { name: 'Document tools' })
    ).toBeVisible();
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Fields' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('History panel')).toBeVisible();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Translations' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Fields' })).toHaveFocus();
    expect(onValueChange.mock.calls).toEqual([
      ['history'],
      ['translations'],
      ['fields'],
    ]);
  });

  it('keeps only the shown tab in the Tab order', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tabs tabs={tools} defaultValue='history' />
        <button type='button'>After</button>
      </>
    );
    await user.tab();
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });
});

describe('Tabs, disabled', () => {
  it('reaches a disabled tab with the arrow keys but never shows it', async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        tabs={[
          { value: 'fields', label: 'Fields' },
          { value: 'history', label: 'History', disabled: true },
          { value: 'references', label: 'References' },
        ]}
      />
    );
    await user.tab();
    await user.keyboard('{ArrowRight}');
    const history = screen.getByRole('tab', { name: 'History' });
    expect(history).toHaveFocus();
    expect(history).toHaveAttribute('aria-disabled', 'true');
    expect(history).toHaveAttribute('aria-selected', 'false');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'References' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});

describe('Breadcrumb', () => {
  const path = ['Posts', '2026', 'October', 'Launch', 'Hello world'];

  it('folds after `max` steps and links a step with `href`', () => {
    render(
      <Breadcrumb
        max={5}
        items={path.map((label, index) => ({
          label,
          href: index < path.length - 1 ? `/${label}` : undefined,
        }))}
      />
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByText('2026')).toBeVisible();
    expect(within(nav).getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'href',
      '/Posts'
    );
  });

  it('keeps the link of a folded step', async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb
        items={path.map((label, index) => ({
          label,
          href: index < path.length - 1 ? `/${label}` : undefined,
        }))}
      />
    );
    await user.click(
      screen.getByRole('button', { name: 'Show 2 more levels' })
    );
    expect(
      await screen.findByRole('menuitem', { name: '2026' })
    ).toHaveAttribute('href', '/2026');
  });

  it('folds the middle of a long path into a menu', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <Breadcrumb
        items={path.map((label, index) => ({
          label,
          onClick: index < path.length - 1 ? () => onOpen(label) : undefined,
        }))}
      />
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('button', { name: 'Posts' })).toBeVisible();
    expect(within(nav).queryByText('2026')).toBeNull();
    expect(within(nav).getByRole('button', { name: 'Launch' })).toBeVisible();
    expect(within(nav).getByText('Hello world')).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      within(nav).queryByRole('button', { name: 'Hello world' })
    ).toBeNull();

    const fold = within(nav).getByRole('button', {
      name: 'Show 2 more levels',
    });
    fold.focus();
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('menuitem', { name: 'October' }));
    expect(onOpen).toHaveBeenCalledWith('October');

    await user.click(fold);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    expect(fold).toHaveFocus();
  });

  it('moves focus to the new current step when a fold item removes the fold', async () => {
    const user = userEvent.setup();
    function Trail() {
      const [depth, setDepth] = useState(path.length);
      return (
        <Breadcrumb
          items={path.slice(0, depth).map((label, index) => ({
            label,
            onClick: index < depth - 1 ? () => setDepth(index + 1) : undefined,
          }))}
        />
      );
    }
    render(<Trail />);
    await user.click(
      screen.getByRole('button', { name: 'Show 2 more levels' })
    );
    await user.click(await screen.findByRole('menuitem', { name: '2026' }));
    await waitFor(() => expect(screen.getByText('2026')).toHaveFocus());
    expect(screen.queryByRole('button', { name: /more level/ })).toBeNull();
  });

  it('marks only the step pinned as current', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Posts' },
          { label: 'Hello', current: true },
          { label: 'Draft' },
        ]}
      />
    );
    expect(
      screen
        .getAllByText(/Posts|Hello|Draft/)
        .filter((step) => step.hasAttribute('aria-current'))
    ).toEqual([screen.getByText('Hello')]);
  });

  it('draws a step with nothing to do as text, not a button', () => {
    render(<Breadcrumb items={[{ label: 'Posts' }, { label: 'Hello' }]} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Posts')).not.toHaveAttribute('aria-current');
  });

  it('shows every step of a short path', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Posts', onClick: () => {} }, { label: 'Hello' }]}
      />
    );
    expect(screen.getByRole('button', { name: 'Posts' })).toBeVisible();
    expect(screen.getByText('Hello')).toHaveAttribute('aria-current', 'page');
  });

  it('keeps focus on the trail when a pressed step becomes the current page', async () => {
    const user = userEvent.setup();
    function Trail() {
      const [depth, setDepth] = useState(path.length);
      return (
        <Breadcrumb
          items={path.slice(0, depth).map((label, index) => ({
            label,
            onClick: index < depth - 1 ? () => setDepth(index + 1) : undefined,
          }))}
        />
      );
    }
    render(<Trail />);
    await user.click(screen.getByRole('button', { name: 'Launch' }));
    expect(screen.getByText('Launch')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Launch')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Posts' }));
    expect(screen.getByText('Posts')).toHaveFocus();
  });
});

describe('NavRow', () => {
  it('tells screen readers a folder is open', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <NavRow kind='folder' open onClick={onClick}>
        Posts
      </NavRow>
    );
    const row = screen.getByRole('button', { name: 'Posts' });
    expect(row).toHaveAttribute('aria-expanded', 'true');
    row.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('names the unsaved dot and the unsaved count', () => {
    render(
      <>
        <NavRow unsaved selected aria-current='page'>
          Hello world
        </NavRow>
        <NavRow kind='group' count={2}>
          Posts
        </NavRow>
      </>
    );
    expect(
      screen.getByRole('button', { name: 'Hello world Unsaved' })
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', { name: 'Posts 2 unsaved' })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps its own aria-expanded on a folder', () => {
    render(
      <NavRow kind='folder' aria-expanded>
        Posts
      </NavRow>
    );
    expect(screen.getByRole('button', { name: 'Posts' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('says an external link row opens a new tab', () => {
    render(
      <NavRow
        external
        render={
          <a
            href='https://tina.io/docs'
            target='_blank'
            rel='noopener noreferrer'
          />
        }
      >
        Docs
      </NavRow>
    );
    expect(
      screen.getByRole('link', { name: 'Docs (opens in a new tab)' })
    ).toHaveAttribute('target', '_blank');
  });

  it('keeps every prop when drawn as a link', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault()
    );
    render(
      <NavRow
        selected
        aria-current='page'
        onClick={onClick}
        render={<a href='#/collections/post' />}
      >
        Posts
      </NavRow>
    );
    const row = screen.getByRole('link', { name: 'Posts' });
    expect(row).toHaveAttribute('aria-current', 'page');
    expect(row).not.toHaveAttribute('type');
    await user.click(row);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('cannot be pressed when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <NavRow disabled onClick={onClick}>
        Posts
      </NavRow>
    );
    await user.click(screen.getByRole('button', { name: 'Posts' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('rejects props that do nothing for a kind', () => {
    // @ts-expect-error only a document is unsaved
    void (<NavRow kind='group' unsaved />);
    // @ts-expect-error only a group or folder opens
    void (<NavRow kind='doc' open />);
  });
});

describe('NavRow, section', () => {
  it('shows an amber count from 1 and nothing at 0', () => {
    const { rerender } = render(
      <NavRow kind='section' count={2} countLabel='2 unsaved'>
        Changes
      </NavRow>
    );
    expect(
      screen.getByRole('button', { name: 'Changes 2 unsaved' })
    ).toHaveTextContent('Changes2');
    rerender(
      <NavRow kind='section' count={0}>
        Changes
      </NavRow>
    );
    expect(screen.getByRole('button', { name: 'Changes' })).toHaveTextContent(
      /^Changes$/
    );
  });
});

describe('PanelHeader, height', () => {
  it('is a fixed 44px bar even when the title wraps', () => {
    const { container } = render(<PanelHeader heading='A long title' />);
    expect(container.firstElementChild).toHaveClass('h-11');
  });
});

describe('PanelHeader', () => {
  it('tabs through back, the action, the menu and close', async () => {
    const user = userEvent.setup();
    render(
      <PanelHeader
        backLabel='Return to navigator'
        action={<button type='button'>New</button>}
        menu={<DropdownMenuItem>Sort</DropdownMenuItem>}
        menuLabel='Collections actions'
        closeLabel='Close Collections'
      />
    );
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Return to navigator' })
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'New' })).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Collections actions' })
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Close Collections' })
    ).toHaveFocus();
  });

  it('has no menu button without menu items', () => {
    render(<PanelHeader heading='Collections' />);
    expect(screen.getByRole('heading', { name: 'Collections' })).toBeVisible();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('StatusBar', () => {
  it('marks a protected branch', () => {
    render(<StatusBar branch='main' protectedBranch />);
    expect(screen.getByText('main (protected)')).toBeVisible();
  });

  it('shows local mode', () => {
    render(<StatusBar local />);
    expect(screen.getByText('Local files')).toBeVisible();
  });

  it('announces a failed save and has no actions', () => {
    render(
      <StatusBar branch='docs/v4-launch' state='failed'>
        Save failed
      </StatusBar>
    );
    expect(screen.getByText('Save failed')).toHaveAttribute(
      'aria-live',
      'polite'
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('omits the location when the provider has no branches', () => {
    render(<StatusBar state='idle'>Nothing to save</StatusBar>);
    expect(screen.queryByText('Local files')).toBeNull();
    expect(screen.getByText('Nothing to save')).toBeVisible();
  });
});

describe('Pagination', () => {
  it.each([
    [6, '1 … 5 6 7 … 13'],
    [2, '1 2 3 4 5 … 13'],
    [12, '1 … 9 10 11 12 13'],
  ])('folds a long run of pages around page %i', (page, run) => {
    const { container } = render(<Pagination total={130} page={page} />);
    const shown = [...container.querySelectorAll('li')].map((item) =>
      item.textContent === 'More pages' ? '…' : item.textContent
    );
    expect(shown.slice(1, -1).join(' ')).toBe(run);
  });

  it('shows the range and moves between pages', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination total={48} page={2} onPageChange={onPageChange} />);
    expect(screen.getByText('Showing 11–20 of 48')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Page 5' }));
    expect(onPageChange.mock.calls).toEqual([[3], [5]]);
  });

  it('keeps focus on Next when it reaches the last page', async () => {
    const user = userEvent.setup();
    function Pages() {
      const [page, setPage] = useState(4);
      return <Pagination total={48} page={page} onPageChange={setPage} />;
    }
    render(<Pages />);
    const next = screen.getByRole('button', { name: 'Next' });
    next.focus();
    await user.keyboard('{Enter}');
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveFocus();
  });

  it('disables the ends instead of hiding them', () => {
    const { rerender } = render(<Pagination total={48} page={1} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    rerender(<Pagination total={48} page={5} />);
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('Showing 41–48 of 48')).toBeVisible();
  });
});
