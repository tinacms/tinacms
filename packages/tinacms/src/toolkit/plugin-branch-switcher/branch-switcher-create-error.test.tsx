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

import { BranchSwitcherLegacy } from './branch-switcher-legacy';

describe('BranchSwitcherLegacy when createBranch rejects', () => {
  it('shows the error and returns to the branch list', async () => {
    render(
      <BranchSwitcherLegacy
        listBranches={vi
          .fn()
          .mockResolvedValue([
            { name: 'main', indexStatus: { status: 'complete' } },
          ])}
        createBranch={vi
          .fn()
          .mockRejectedValue(new Error('Invalid branch name'))}
        chooseBranch={vi.fn()}
      />
    );

    await userEvent.type(
      await screen.findByPlaceholderText('Branch Name'),
      'bad-name'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /create branch/i })
    );

    await waitFor(() =>
      expect(mockCms.alerts.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid branch name')
      )
    );
    expect(mockCms.alerts.success).not.toHaveBeenCalled();
    expect(
      await screen.findByRole('button', { name: /create branch/i })
    ).toBeTruthy();
  });
});
