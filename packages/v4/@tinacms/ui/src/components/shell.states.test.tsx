import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@tinacms/ui/components/button';
import { BranchSwitcher } from '@tinacms/ui/components/branch-switcher';
import { branchSwitcherStates } from './branch-switcher.states';
import {
  SaveProgress,
  SaveProgressCard,
} from '@tinacms/ui/components/save-progress';
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
  });
});

describe('Branch switcher states', () => {
  it.each(branchSwitcherStates)('renders $name', ({ props, shows }) => {
    render(<BranchSwitcher {...props} />);
    const button = screen.getByRole('button', {
      name: new RegExp(`^Branch: ${props.current}`),
      hidden: true,
    });
    expect(button.hasAttribute('disabled')).toBe(props.disabled === true);
    for (const words of shows) {
      expect(screen.getAllByText(words).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('dialog') !== null).toBe(
      props.defaultOpen === true
    );
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
    expect(rows[0]).toHaveTextContent('docs/v4-launch#4822, 2 unsaved');
    const ready = within(dialog).getByRole('button', {
      name: /docs\/changelog-2-24/,
    });
    expect(ready).toHaveTextContent('Getting ready');
    await user.click(ready);
    expect(onSwitch).not.toHaveBeenCalled();
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

  it('creates a branch, and refuses a name that is taken', async () => {
    const onCreate = vi.fn();
    const { user, dialog } = await open({ onCreate });
    await user.click(
      within(dialog).getByRole('button', { name: 'New branch' })
    );
    const box = within(dialog).getByRole('searchbox', {
      name: 'New branch name',
    });
    await user.type(box, 'main');
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'A branch called main already exists. Pick another.'
    );
    expect(
      within(dialog).getByRole('button', { name: 'Create branch' })
    ).toBeDisabled();
    await user.clear(box);
    await user.type(box, 'docs/astro-guide');
    await user.click(
      within(dialog).getByRole('button', { name: 'Create branch' })
    );
    expect(onCreate).toHaveBeenCalledWith('docs/astro-guide');
  });

  it('has no New branch button without onCreate', async () => {
    const { dialog } = await open();
    expect(
      within(dialog).queryByRole('button', { name: 'New branch' })
    ).toBeNull();
  });

  it('shows loading in place, and a failed load with Retry', async () => {
    const first = await open({ status: 'loading' });
    expect(
      within(first.dialog).getByRole('group', { name: 'Loading branches' })
    ).toBeVisible();
  });

  it('retries a failed load', async () => {
    const onRetry = vi.fn();
    const { user, dialog } = await open({ status: 'failed', onRetry });
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Couldn’t load the branches.'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
