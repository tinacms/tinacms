import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

const mockCms = {
  api: { tina: { isLocalMode: false } },
  alerts: { success: vi.fn(), error: vi.fn() },
};

vi.mock('@toolkit/react-core', () => ({
  useCMS: () => mockCms,
}));

vi.mock('./branch-data', () => ({
  useBranchData: () => ({ currentBranch: 'main' }),
}));

// BranchSelectorTable pulls in posthog/telemetry wiring that isn't relevant
// here; stub it down to just the "create branch" entry point.
vi.mock('./branch-selector-table', () => ({
  default: (props: { createBranch: () => void }) => (
    <button onClick={props.createBranch}>New Branch</button>
  ),
}));

import { EditoralBranchSwitcher } from './branch-switcher';

async function openCreateBranchView() {
  render(
    <EditoralBranchSwitcher
      listBranches={vi
        .fn()
        .mockResolvedValue([
          { name: 'main', indexStatus: { status: 'complete' } },
        ])}
      createBranch={createBranchMock}
      chooseBranch={vi.fn()}
    />
  );

  await userEvent.click(await screen.findByText('New Branch'));
  await userEvent.type(
    await screen.findByLabelText('New Branch Name'),
    'bad-name'
  );
  await userEvent.click(
    screen.getByRole('button', { name: /create branch/i })
  );
}

let createBranchMock: ReturnType<typeof vi.fn>;

describe('EditoralBranchSwitcher when createBranch rejects', () => {
  it('shows the Error message when the rejection is an Error', async () => {
    createBranchMock = vi.fn().mockRejectedValue(new Error('Invalid branch name'));

    await openCreateBranchView();

    await waitFor(() =>
      expect(mockCms.alerts.error).toHaveBeenCalledWith('Invalid branch name')
    );
  });

  it('falls back to a generic message when the rejection is not an Error', async () => {
    mockCms.alerts.error.mockClear();
    createBranchMock = vi.fn().mockRejectedValue('network blip');

    await openCreateBranchView();

    await waitFor(() =>
      expect(mockCms.alerts.error).toHaveBeenCalledWith(
        'There was an error creating a new branch.'
      )
    );
  });
});
