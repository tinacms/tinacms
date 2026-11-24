import { useState } from 'react';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@tinacms/ui/components/button';
import { BranchSwitcher } from '@tinacms/ui/components/branch-switcher';
import { branchSwitcherStates } from './branch-switcher.states';
import {
  SaveProgress,
  SaveProgressCard,
} from '@tinacms/ui/components/save-progress';
import { SaveToBranchDialog } from '@tinacms/ui/components/save-to-branch-dialog';
import { saveToBranchDialogStates } from './save-to-branch-dialog.states';
import { saveProgressStates } from './save-progress.states';
import { statusBarStates } from './status-bar.states';
import { StatusBar } from '@tinacms/ui/components/status-bar';
import { TopBar } from '@tinacms/ui/components/top-bar';
import { topBarStates } from './top-bar.states';

const branches = [{ name: 'main', protected: true }, { name: 'feature/news' }];

describe('Top bar states', () => {
  it.each(topBarStates)('renders $name', (state) => {
    render(
      <TopBar
        toggle={
          <Button
            variant='icon'
            size='sm'
            icon='hide-panel'
            aria-label='Toggle Sidebar'
          />
        }
        projectName={state.projectName}
        branch={
          state.branch ? (
            <BranchSwitcher
              current={state.branch.current}
              branches={branches}
              disabled={state.branch.disabled}
              onSwitch={() => {}}
            />
          ) : undefined
        }
        search={state.search ? <Button size='sm'>Search</Button> : undefined}
        save={state.save ? <Button size='sm'>Save all</Button> : undefined}
      />
    );
    const bar = screen.getByRole('banner', { name: 'Top bar' });
    expect(
      within(bar).getByRole('button', { name: 'Toggle Sidebar' })
    ).toBeVisible();
    expect(
      within(bar).queryByText(state.projectName ?? '\u0000') !== null
    ).toBe(state.projectName !== undefined);
    expect(
      within(bar).queryByRole('button', { name: /^Branch:/ }) !== null
    ).toBe(state.branch !== undefined);
    expect(within(bar).queryByRole('button', { name: 'Search' }) !== null).toBe(
      state.search === true
    );
    expect(
      within(bar).queryByRole('button', { name: 'Save all' }) !== null
    ).toBe(state.save === true);
  });
});

describe('Branch switcher states', () => {
  it.each(branchSwitcherStates)(
    'renders $name',
    async ({ props, shows, openForm }) => {
      const { createState, ...idle } = props;
      const { rerender } = render(
        <BranchSwitcher {...(openForm ? idle : props)} />
      );
      if (openForm) {
        await userEvent.click(
          screen.getByRole('button', { name: 'New branch' })
        );
        rerender(<BranchSwitcher {...props} />);
      }
      const button = screen.getByRole('button', {
        name: new RegExp(`^Branch: ${props.current}`),
        hidden: true,
      });
      expect(button.hasAttribute('disabled')).toBe(props.disabled === true);
      for (const words of shows) {
        expect(screen.getAllByText(words).length).toBeGreaterThan(0);
      }
      const framed = props.defaultOpen === true;
      const maximised = props.defaultMaximised === true;
      expect(screen.queryByRole('dialog') !== null).toBe(framed && !maximised);
      expect(
        document.querySelector('[data-slot="branch-maximised"]') !== null
      ).toBe(framed && maximised);
    }
  );
});

describe('Save to branch dialog states', () => {
  it.each(saveToBranchDialogStates)(
    'renders $name',
    async ({ name, props, title, action, error }) => {
      render(<SaveToBranchDialog {...props} />);
      const dialog = screen.getByRole('dialog', { name: title });
      const main = within(dialog).getByRole('button', { name: action });
      expect(main.hasAttribute('disabled')).toBe(name === 'no action');
      const field = within(dialog).getByRole('textbox', {
        name: /New branch name/,
      });
      await waitFor(() => expect(field).toHaveFocus());
      expect(field.getAttribute('aria-invalid') === 'true').toBe(
        error !== undefined
      );
      if (error)
        expect(within(dialog).getByRole('alert')).toHaveTextContent(error);
      if (name === 'saving') {
        expect(
          within(dialog).getByRole('button', { name: 'Cancel' })
        ).toBeDisabled();
      }
    }
  );

  it('ignores Enter and Escape while saving and when nothing can save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <SaveToBranchDialog
        {...saveToBranchDialogStates[0].props}
        saving
        onSave={onSave}
        onOpenChange={onOpenChange}
      />
    );
    await user.keyboard('{Enter}{Escape}');
    expect(onSave).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    rerender(
      <SaveToBranchDialog
        {...saveToBranchDialogStates[0].props}
        canSave={false}
        onSave={onSave}
        onOpenChange={onOpenChange}
      />
    );
    await user.keyboard('{Enter}');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits the typed name on Enter and closes on Cancel', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <SaveToBranchDialog
        {...saveToBranchDialogStates[0].props}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
    await user.keyboard('-x{Enter}');
    expect(onSave).toHaveBeenCalledWith('docs/hello-edits-x');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe('Save progress states', () => {
  it.each(saveProgressStates)('renders $name', ({ props }) => {
    render(<SaveProgress {...props} />);
    expect(
      screen.getByRole('region', { name: 'Save progress' })
    ).toHaveAttribute('data-placement', props.placement);
  });
});

describe('Status bar states', () => {
  it.each(statusBarStates)('renders $name', ({ props, words }) => {
    render(<StatusBar {...props}>{words}</StatusBar>);
    const bar = screen.getByRole('contentinfo', { name: 'Status bar' });
    expect(within(bar).getByText(words)).toBeVisible();
    expect(within(bar).queryByRole('button')).toBeNull();
    expect(within(bar).queryByText('Local files') !== null).toBe(
      props.local === true
    );
  });
});

describe('Save progress card', () => {
  const steps = [
    { label: 'Create branch docs/home-edits', state: 'done' },
    { label: 'Save your edits', state: 'running' },
    { label: 'Open a pull request', state: 'pending' },
  ] as const;

  it('is a named region with the steps, nothing live inside and no focus taken', () => {
    render(
      <SaveProgressCard
        steps={[...steps]}
        elapsed='0:42'
        title='Saving to a new branch'
        subtitle='Usually takes a minute or two'
      />
    );
    const card = screen.getByRole('region', { name: 'Save progress' });
    expect(within(card).getAllByRole('listitem')).toHaveLength(3);
    expect(within(card).queryByRole('status')).toBeNull();
    expect(within(card).queryByRole('alert')).toBeNull();
    expect(card.contains(document.activeElement)).toBe(false);
  });

  it('collapses to one bar with the step number, from the button and from Escape, and expands again', async () => {
    const user = userEvent.setup();
    render(<SaveProgressCard steps={[...steps]} elapsed='0:06' />);
    await user.click(
      screen.getByRole('button', { name: 'Collapse save progress' })
    );
    const card = screen.getByRole('region', { name: 'Save progress' });
    expect(card).toHaveTextContent('Save your edits · Step 2 of 3');
    await user.click(
      screen.getByRole('button', { name: 'Expand save progress' })
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    screen.getByRole('button', { name: 'Collapse save progress' }).focus();
    await user.keyboard('{Escape}');
    expect(card).toHaveTextContent('Step 2 of 3');
  });

  it('names the failed step and retries from it', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SaveProgressCard
        steps={[
          steps[0],
          { label: 'Save your edits', state: 'failed' },
          steps[2],
        ]}
        failure={{ text: 'Your edits didn’t reach the new branch.', onRetry }}
      />
    );
    expect(screen.getByText('Couldn’t finish saving')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retry save' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the pull request, and Save again when edits came after the save', async () => {
    const user = userEvent.setup();
    const onSaveAgain = vi.fn();
    render(
      <SaveProgressCard
        steps={[]}
        done={{
          title: 'Saved to a new branch',
          subtitle: 'You’re now on docs/home-edits',
          pullRequest: {
            label: 'Pull request #482',
            status: 'In review',
            href: 'https://example.com/pull/482',
          },
          newerEdits: { onSaveAgain },
        }}
      />
    );
    const link = screen.getByRole('link', { name: /Pull request #482/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('Edited since this save')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save again' }));
    expect(onSaveAgain).toHaveBeenCalledOnce();
  });
});

describe('Branch switcher, the full design', () => {
  const entries = [
    { name: 'docs/v4-launch', pullRequest: 482, unsaved: 2 },
    { name: 'docs/pricing-update', pullRequest: 479 },
    { name: 'docs/changelog-2-24', ready: false },
    { name: 'main', protected: true },
  ];

  const open = async (
    props: Partial<React.ComponentProps<typeof BranchSwitcher>> = {}
  ) => {
    const user = userEvent.setup();
    render(
      <BranchSwitcher
        current='docs/v4-launch'
        branches={entries}
        onSwitch={() => {}}
        {...props}
      />
    );
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    return {
      user,
      dialog: await screen.findByRole('dialog', { name: 'Branches' }),
    };
  };

  it('shows the pull request number and unsaved count, and a getting-ready row nobody can pick', async () => {
    const onSwitch = vi.fn();
    const { user, dialog } = await open({ onSwitch });
    const rows = within(dialog).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('docs/changelog-2-24');
    expect(rows[1]).toHaveTextContent('docs/v4-launch#4822, 2 unsaved');
    const ready = within(dialog).getByRole('button', {
      name: /docs\/changelog-2-24/,
    });
    expect(ready).toHaveTextContent('Getting ready');
    await user.click(ready);
    expect(onSwitch).not.toHaveBeenCalled();
  });

  describe.each([
    ['pop-up', false],
    ['maximised switcher', true],
  ])('unready and creating rows in the %s', (_surface, defaultMaximised) => {
    const rowsFor = (
      branches: React.ComponentProps<typeof BranchSwitcher>['branches']
    ) => {
      render(
        <BranchSwitcher
          current='docs/v4-launch'
          branches={branches}
          onSwitch={() => {}}
          defaultOpen
          defaultMaximised={defaultMaximised}
        />
      );
      return screen
        .getAllByRole('button')
        .filter((row) => row.hasAttribute('data-branch-row'));
    };

    it('shows an unready row disabled with no spinner and Reload to switch, and a creating row with the spinner and Getting ready', () => {
      const rows = rowsFor([
        { name: 'docs/v4-launch' },
        { name: 'cms/unready', ready: false, unready: true },
        { name: 'cms/making', ready: false },
      ]);
      const unready = rows.find((row) =>
        row.textContent?.includes('cms/unready')
      );
      const making = rows.find((row) =>
        row.textContent?.includes('cms/making')
      );
      expect(unready).toHaveAttribute('aria-disabled', 'true');
      expect(unready).toHaveTextContent('Reload to switch');
      expect(unready).not.toHaveTextContent('Getting ready');
      expect(unready?.querySelector('[class*="animate-spin"]')).toBeNull();
      expect(making).toHaveTextContent('Getting ready');
      expect(making?.querySelector('[class*="animate-spin"]')).not.toBeNull();
    });

    it('lists a protected branch once while it is creating, and once when unready', () => {
      const count = (name: string, extra: object) => {
        const rows = rowsFor([
          { name: 'docs/v4-launch' },
          { name, protected: true, ready: false, ...extra },
        ]);
        const found = rows.filter((row) =>
          row.textContent?.includes(name)
        ).length;
        cleanup();
        return found;
      };
      expect(count('release', {})).toBe(1);
      expect(count('release', { unready: true })).toBe(1);
    });
  });

  it('finds a branch by its pull request number', async () => {
    const { user, dialog } = await open();
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'Search branches' }),
      '479'
    );
    expect(
      within(dialog)
        .getAllByRole('listitem')
        .map((row) => row.textContent)
    ).toEqual(['docs/pricing-update#479']);
  });

  it('moves between rows with the arrow keys, Home and End, starting from the search box', async () => {
    const { user, dialog } = await open();
    within(dialog).getByRole('searchbox', { name: 'Search branches' }).focus();
    await user.keyboard('{ArrowDown}');
    const rows = within(dialog).getAllByRole('button', { name: /docs\/|main/ });
    expect(rows[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(rows.at(-1)).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(rows.at(-2)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(rows[0]).toHaveFocus();
  });

  const openForm = async (props: Parameters<typeof open>[0] = {}) => {
    const opened = await open(props);
    await opened.user.click(
      within(opened.dialog).getByRole('button', { name: 'New branch' })
    );
    return {
      ...opened,
      box: within(opened.dialog).getByRole('searchbox', {
        name: 'New branch name',
      }),
    };
  };

  it('creates a branch, and refuses a name that is taken', async () => {
    const onCreate = vi.fn();
    const { user, dialog, box } = await openForm({ onCreate });
    await user.type(box, 'main');
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'A branch called main already exists. Pick another name.'
    );
    expect(
      within(dialog).getByRole('button', { name: 'Create branch' })
    ).toBeDisabled();
    await user.clear(box);
    await user.type(box, 'docs/astro-guide');
    await user.click(
      within(dialog).getByRole('button', { name: 'Create branch' })
    );
    expect(onCreate).toHaveBeenCalledWith('docs/astro-guide', 'docs/v4-launch');
  });

  it.each([
    [
      'has spaces',
      'my branch',
      'Branch names can’t have spaces. Use dashes instead, such as docs/new-page.',
    ],
    [
      'ends in a slash',
      'docs/',
      'Use letters, numbers, dashes, dots and slashes only, and don’t end with a slash or a dot.',
    ],
    [
      'has a character that is not allowed',
      'a?b',
      'Use letters, numbers, dashes, dots and slashes only, and don’t end with a slash or a dot.',
    ],
  ])(
    'refuses a name that %s, and keeps what was typed',
    async (_why, name, message) => {
      const { user, dialog, box } = await openForm({ onCreate: vi.fn() });
      await user.type(box, name);
      expect(within(dialog).getByRole('alert')).toHaveTextContent(message);
      expect(box).toHaveValue(name);
    }
  );

  it('asks for a name once the typed one is cleared', async () => {
    const { user, dialog, box } = await openForm({ onCreate: vi.fn() });
    expect(within(dialog).queryByRole('alert')).toBeNull();
    await user.type(box, 'x');
    await user.clear(box);
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Enter a branch name.'
    );
  });

  it('shows the New branch form without a create operation, but cannot create', async () => {
    const { dialog } = await openForm();
    expect(
      within(dialog).getByRole('button', { name: 'Create branch' })
    ).toBeDisabled();
  });

  it('shows loading in place, and a failed load with Retry', async () => {
    const first = await open({ status: 'loading' });
    expect(
      within(first.dialog).getByRole('group', { name: 'Loading branches' })
    ).toBeVisible();
    expect(within(first.dialog).getByText('Loading branches')).toBeVisible();
  });

  it('retries a failed load', async () => {
    const onRetry = vi.fn();
    const { user, dialog } = await open({ status: 'failed', onRetry });
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      "Couldn't load branches. Check your connection, then retry. You're still on docs/v4-launch and can keep editing."
    );
    await user.click(within(dialog).getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('Branch switcher controls', () => {
  const entries = [
    { name: 'feature/news' },
    { name: 'fix/typo' },
    { name: 'main', protected: true },
  ];

  it('opens and closes only through open and onOpenChange when controlled, and stays open after onCreate', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onCreate = vi.fn();
    const { rerender } = render(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        onCreate={onCreate}
        baseBranch='main'
        open={false}
        onOpenChange={onOpenChange}
      />
    );
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        onCreate={onCreate}
        baseBranch='main'
        open
        onOpenChange={onOpenChange}
      />
    );
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      within(dialog).getByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'cms/x'
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Create branch' })
    );
    expect(onCreate).toHaveBeenCalledWith('cms/x', 'feature/news');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('moves between rows with the keys in the maximised view', async () => {
    const user = userEvent.setup();
    render(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        defaultOpen
        defaultMaximised
      />
    );
    const search = screen.getByRole('searchbox', { name: 'Search branches' });
    await waitFor(() => expect(search).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    const rows = screen
      .getAllByRole('button', { name: /feature|fix|main/ })
      .filter((row) => row.hasAttribute('data-branch-row'));
    expect(rows[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(rows.at(-1)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(rows[0]).toHaveFocus();
  });

  it('shows No branches match with Clear search, which empties and focuses the box', async () => {
    const user = userEvent.setup();
    render(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        defaultOpen
      />
    );
    const search = screen.getByRole('searchbox', { name: 'Search branches' });
    await user.type(search, 'zzz');
    expect(screen.getByText('No branches match “zzz”.')).toBeVisible();
    const empty = screen.getByText('No branches match “zzz”.').parentElement;
    if (!empty) throw new Error('no empty state');
    await user.click(
      within(empty).getByRole('button', { name: 'Clear search' })
    );
    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
  });

  it('puts the Getting ready row first, and focuses the name field when New branch opens', async () => {
    const user = userEvent.setup();
    render(
      <BranchSwitcher
        current='feature/news'
        branches={[
          { name: 'feature/news' },
          { name: 'fix/typo' },
          { name: 'cms/new', ready: false },
          { name: 'main', protected: true },
        ]}
        onSwitch={() => {}}
        onCreate={() => {}}
        baseBranch='main'
        defaultOpen
      />
    );
    const rows = screen
      .getAllByRole('button')
      .filter((row) => row.hasAttribute('data-branch-row'));
    expect(rows.map((row) => row.textContent)).toEqual([
      'cms/newGetting ready',
      'feature/news',
      'fix/typo',
      'main',
    ]);
    await user.click(screen.getByRole('button', { name: 'New branch' }));
    expect(
      screen.getByRole('searchbox', { name: 'New branch name' })
    ).toHaveFocus();
    expect(
      screen.getByText('Use letters, numbers, dashes, dots and slashes.')
    ).toBeVisible();
  });

  it('disables New branch while the list loads or failed, even without a create', () => {
    const { rerender } = render(
      <BranchSwitcher
        current='main'
        branches={entries}
        onSwitch={() => {}}
        status='loading'
        defaultOpen
      />
    );
    expect(screen.getByRole('button', { name: 'New branch' })).toBeDisabled();
    rerender(
      <BranchSwitcher
        current='main'
        branches={entries}
        onSwitch={() => {}}
        status='failed'
        defaultOpen
      />
    );
    expect(screen.getByRole('button', { name: 'New branch' })).toBeDisabled();
  });

  it('closes when focus leaves the pop-up for the page', async () => {
    const user = userEvent.setup();
    render(
      <>
        <BranchSwitcher
          current='feature/news'
          branches={entries}
          onSwitch={() => {}}
          defaultOpen
        />
        <button type='button'>page</button>
      </>
    );
    expect(
      screen.getByRole('dialog', { name: 'Branches' })
    ).toBeInTheDocument();
    screen.getByRole('searchbox', { name: 'Search branches' }).focus();
    screen.getByRole('button', { name: 'page' }).focus();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    expect(
      await screen.findByRole('dialog', { name: 'Branches' })
    ).toBeVisible();
  });

  it.each(['Close branches', 'Escape'])(
    'opens again as the pop-up after the maximised view is closed with %s',
    async (how) => {
      const user = userEvent.setup();
      render(
        <BranchSwitcher
          current='feature/news'
          branches={entries}
          onSwitch={() => {}}
          defaultOpen
          defaultMaximised
        />
      );
      expect(
        document.querySelector('[data-slot="branch-maximised"]')
      ).not.toBeNull();
      if (how === 'Escape') await user.keyboard('{Escape}');
      else
        await user.click(
          screen.getByRole('button', { name: 'Close branches' })
        );
      await waitFor(() =>
        expect(
          document.querySelector('[data-slot="branch-maximised"]')
        ).toBeNull()
      );
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      expect(
        await screen.findByRole('dialog', { name: 'Branches' })
      ).toBeVisible();
    }
  );

  it('names the clear button of the name field apart from the search box', async () => {
    const user = userEvent.setup();
    render(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        onCreate={() => {}}
        baseBranch='main'
        defaultOpen
      />
    );
    await user.type(
      screen.getByRole('searchbox', { name: 'Search branches' }),
      'x'
    );
    await user.click(screen.getByRole('button', { name: 'New branch' }));
    await user.type(
      screen.getByRole('searchbox', { name: 'New branch name' }),
      'cms/a'
    );
    expect(screen.getByRole('button', { name: 'Clear name' })).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: 'Clear search' })
    ).toHaveLength(1);
  });

  it('drops the failure and Retry once the name is edited, and scrolls the alert into view', async () => {
    const user = userEvent.setup();
    const scrolled = vi.fn();
    Element.prototype.scrollIntoView = scrolled;
    const props = {
      current: 'feature/news',
      branches: entries,
      onSwitch: () => {},
      onCreate: () => {},
      baseBranch: 'main',
      defaultOpen: true,
    } as const;
    const { rerender } = render(<BranchSwitcher {...props} />);
    await user.click(screen.getByRole('button', { name: 'New branch' }));
    const box = screen.getByRole('searchbox', { name: 'New branch name' });
    await user.type(box, 'aaa');
    await user.click(screen.getByRole('button', { name: 'Create branch' }));
    scrolled.mockClear();
    rerender(<BranchSwitcher {...props} createState='failed' />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
    await waitFor(() =>
      expect(
        scrolled.mock.contexts.some(
          (el) =>
            el instanceof Element &&
            el.contains(screen.getByRole('button', { name: 'Retry' }))
        )
      ).toBe(true)
    );
    await user.type(box, 'b');
    expect(screen.queryByText(/Couldn't create/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Create branch' })).toBeVisible();
  });

  it('puts focus back in the search box after Back to branches and in the name field after Clear name', async () => {
    const user = userEvent.setup();
    const onFormChange = vi.fn();
    render(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        onCreate={() => {}}
        baseBranch='main'
        onFormChange={onFormChange}
        defaultOpen
      />
    );
    await user.click(screen.getByRole('button', { name: 'New branch' }));
    expect(onFormChange).toHaveBeenLastCalledWith(true, false);
    const name = screen.getByRole('searchbox', { name: 'New branch name' });
    await user.type(name, 'cms/a');
    await user.click(screen.getByRole('button', { name: 'Clear name' }));
    expect(name).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Back to branches' }));
    expect(onFormChange).toHaveBeenLastCalledWith(false, false);
    const search = screen.getByRole('searchbox', { name: 'Search branches' });
    expect(search).toHaveFocus();
    await user.type(search, 'x');
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(search).toHaveFocus();
  });

  describe.each([
    ['pop-up', false],
    ['maximised switcher', true],
  ])('the New branch form in the %s', (_surface, defaultMaximised) => {
    const renderForm = (
      props: Partial<React.ComponentProps<typeof BranchSwitcher>> = {}
    ) => {
      const onCreate = vi.fn();
      render(
        <BranchSwitcher
          current='feature/news'
          branches={entries}
          onSwitch={() => {}}
          onCreate={onCreate}
          baseBranch='main'
          defaultOpen
          defaultMaximised={defaultMaximised}
          {...props}
        />
      );
      return onCreate;
    };

    it('keeps Create branch off while the name is empty, and starts nothing on Enter', async () => {
      const user = userEvent.setup();
      const onCreate = renderForm();
      await user.click(screen.getByRole('button', { name: 'New branch' }));
      const create = screen.getByRole('button', { name: 'Create branch' });
      const name = screen.getByRole('searchbox', { name: 'New branch name' });
      expect(create).toBeDisabled();
      await user.type(name, '{Enter}');
      expect(onCreate).not.toHaveBeenCalled();
      await user.type(name, 'cms/a');
      expect(create).toBeEnabled();
      await user.clear(name);
      expect(create).toBeDisabled();
      expect(screen.getByText('Enter a branch name.')).toBeVisible();
    });

    it('stays editable and not busy while a create the form did not start runs', async () => {
      const user = userEvent.setup();
      const onCreate = renderForm({ creatingBranch: 'cms/a' });
      expect(screen.getByText('Creating cms/a…')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'New branch' }));
      const name = screen.getByRole('searchbox', { name: 'New branch name' });
      await user.type(name, 'cms/b');
      expect(name).not.toHaveAttribute('readonly');
      expect(name).toHaveValue('cms/b');
      expect(screen.getByText('Creating cms/a…')).toBeVisible();
      expect(screen.getByText('Wait for cms/a to finish first')).toBeVisible();
      const create = screen.getByRole('button', { name: 'Create branch' });
      expect(create).toBeDisabled();
      await user.type(name, '{Enter}');
      expect(onCreate).not.toHaveBeenCalled();
    });
  });

  it('keeps focus on the Create button while it creates, and puts it in the search box after the list Retry', async () => {
    const user = userEvent.setup();
    const props = {
      current: 'feature/news',
      branches: entries,
      onSwitch: () => {},
      onCreate: () => {},
      baseBranch: 'main',
      defaultOpen: true,
    } as const;
    const { rerender } = render(<BranchSwitcher {...props} />);
    await user.click(screen.getByRole('button', { name: 'New branch' }));
    await user.type(
      screen.getByRole('searchbox', { name: 'New branch name' }),
      'cms/a'
    );
    await user.click(screen.getByRole('button', { name: 'Create branch' }));
    rerender(<BranchSwitcher {...props} createState='creating' />);
    expect(screen.getByRole('button', { name: 'Creating' })).toHaveFocus();
    rerender(<BranchSwitcher {...props} createState='failed' />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();

    const onRetry = vi.fn();
    rerender(
      <BranchSwitcher
        {...props}
        createState='idle'
        status='failed'
        onRetry={onRetry}
      />
    );
    await user.click(
      screen.getAllByRole('button', { name: 'Retry' }).at(-1) as HTMLElement
    );
    expect(onRetry).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('searchbox', { name: 'Search branches' })
    ).toHaveFocus();
  });

  it('clears the New branch form when a create started from the note finishes', async () => {
    const user = userEvent.setup();
    const props = {
      current: 'feature/news',
      branches: entries,
      onSwitch: () => {},
      onCreate: () => {},
      baseBranch: 'main',
      defaultOpen: true,
    } as const;
    const { rerender } = render(<BranchSwitcher {...props} />);
    await user.click(screen.getByRole('button', { name: 'New branch' }));
    await user.type(
      screen.getByRole('searchbox', { name: 'New branch name' }),
      'cms/a'
    );
    await user.click(screen.getByRole('button', { name: 'Create branch' }));
    rerender(<BranchSwitcher {...props} createState='creating' />);
    rerender(<BranchSwitcher {...props} createState='failed' />);
    rerender(<BranchSwitcher {...props} createState='creating' />);
    rerender(<BranchSwitcher {...props} createState='idle' />);
    await user.click(screen.getByRole('button', { name: 'New branch' }));
    expect(
      screen.getByRole('searchbox', { name: 'New branch name' })
    ).toHaveValue('');
  });

  it('closes the maximised view on Escape even when focus is on the page body', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        defaultOpen
        defaultMaximised
        onOpenChange={onOpenChange}
      />
    );
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.body).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('moves focus to the search box after the note Retry only when the retry started', async () => {
    const user = userEvent.setup();
    const refused = vi.fn(() => false);
    const { rerender } = render(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        note={{ kind: 'failed', name: 'cms/x' }}
        onNoteAction={refused}
        defaultOpen
      />
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refused).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('searchbox', { name: 'Search branches' })
    ).not.toHaveFocus();
    const started = vi.fn(() => true);
    rerender(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        note={{ kind: 'failed', name: 'cms/x' }}
        onNoteAction={started}
        defaultOpen
      />
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(
      screen.getByRole('searchbox', { name: 'Search branches' })
    ).toHaveFocus();
  });

  it('shows one note with its action and Dismiss, and Dismiss focuses the search box', async () => {
    const user = userEvent.setup();
    const onNoteDismiss = vi.fn();
    render(
      <BranchSwitcher
        current='feature/news'
        branches={entries}
        onSwitch={() => {}}
        note={{
          kind: 'ready',
          name: 'cms/x',
          reason: 'Save or discard your changes first',
        }}
        onNoteDismiss={onNoteDismiss}
        defaultOpen
      />
    );
    expect(screen.getByText('cms/x is ready')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Switch to cms/x' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Save or discard your changes first')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onNoteDismiss).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('searchbox', { name: 'Search branches' })
    ).toHaveFocus();
  });

  it('opens the New branch form while a ready note is held', async () => {
    const user = userEvent.setup();
    // Like the app's Top bar, the parent re-renders when the form opens and builds a new note object.
    function Parent() {
      const [, setShown] = useState(false);
      return (
        <BranchSwitcher
          current='feature/news'
          branches={entries}
          onSwitch={() => {}}
          onCreate={() => {}}
          baseBranch='main'
          onFormChange={setShown}
          note={{ kind: 'ready', name: 'cms/x' }}
          defaultOpen
        />
      );
    }
    render(<Parent />);
    await user.click(screen.getByRole('button', { name: 'New branch' }));
    expect(
      screen.getByRole('searchbox', { name: 'New branch name' })
    ).toBeInTheDocument();
  });
});
