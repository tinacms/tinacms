import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@tinacms/ui/components/button';
import { BranchSwitcher } from '@tinacms/ui/components/branch-switcher';
import { branchSwitcherStates } from './branch-switcher.states';
import { SaveProgress } from '@tinacms/ui/components/save-progress';
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
