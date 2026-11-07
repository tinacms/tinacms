import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCms = {
  api: {
    tina: {
      isLocalMode: false,
      waitForIndexStatus: () => [new Promise(() => {}), vi.fn()],
    },
  },
  alerts: { success: vi.fn(), error: vi.fn() },
};

vi.mock('@toolkit/react-core', () => ({
  useCMS: () => mockCms,
}));

vi.mock('./branch-data', () => ({
  useBranchData: () => ({ currentBranch: 'main' }),
}));

vi.mock('./branch-selector-table', () => ({
  default: ({ createBranch }: { createBranch: () => void }) => (
    <button onClick={createBranch}>Open creator</button>
  ),
}));

import { EditoralBranchSwitcher } from './branch-switcher';
import { BranchSwitcherLegacy } from './branch-switcher-legacy';

const branches = [{ name: 'main', indexStatus: { status: 'complete' } }];

const renderLegacy = (createBranch: () => Promise<string>) => {
  render(
    <BranchSwitcherLegacy
      listBranches={vi.fn().mockResolvedValue(branches)}
      createBranch={createBranch}
      chooseBranch={vi.fn()}
    />
  );
};

const submitLegacy = async (name: string) => {
  await userEvent.type(await screen.findByPlaceholderText('Branch Name'), name);
  await userEvent.click(screen.getByRole('button', { name: /create branch/i }));
};

const renderEditorial = (createBranch: () => Promise<string>) =>
  render(
    <EditoralBranchSwitcher
      listBranches={vi.fn().mockResolvedValue(branches)}
      createBranch={createBranch}
      chooseBranch={vi.fn()}
    />
  );

const submitEditorial = async (name: string) => {
  await userEvent.click(await screen.findByText('Open creator'));
  await userEvent.type(screen.getAllByRole('textbox')[1], name);
  await userEvent.click(screen.getByRole('button', { name: /create branch/i }));
};

describe('creating a branch fails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BranchSwitcherLegacy', () => {
    it("shows the server's message and keeps the name for correcting", async () => {
      const createBranch = vi
        .fn()
        .mockRejectedValue(new Error('Invalid ref name'));
      renderLegacy(createBranch);

      await submitLegacy('bad..name');

      await waitFor(() =>
        expect(mockCms.alerts.error).toHaveBeenCalledWith('Invalid ref name')
      );
      const input =
        await screen.findByPlaceholderText<HTMLInputElement>('Branch Name');
      expect(input.value).toBe('bad..name');
      expect(mockCms.alerts.success).not.toHaveBeenCalled();
    });

    it('lets the editor retry after a failure', async () => {
      const createBranch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Invalid ref name'))
        .mockResolvedValueOnce('good-name');
      renderLegacy(createBranch);

      await submitLegacy('bad..name');
      await waitFor(() => expect(mockCms.alerts.error).toHaveBeenCalled());
      await userEvent.clear(await screen.findByPlaceholderText('Branch Name'));
      await submitLegacy('good-name');

      await screen.findByText('good-name');
      expect(mockCms.alerts.success).toHaveBeenCalledWith('Branch created.');
      const input =
        screen.getByPlaceholderText<HTMLInputElement>('Branch Name');
      expect(input.value).toBe('');
    });

    it('falls back to a generic message for a non-Error rejection', async () => {
      renderLegacy(vi.fn().mockRejectedValue('nope'));

      await submitLegacy('name');

      await waitFor(() =>
        expect(mockCms.alerts.error).toHaveBeenCalledWith(
          'There was an error creating a new branch.'
        )
      );
    });
  });

  describe('EditoralBranchSwitcher', () => {
    it("shows the server's message and keeps the name for correcting", async () => {
      const createBranch = vi
        .fn()
        .mockRejectedValue(new Error('Invalid ref name'));
      renderEditorial(createBranch);

      await submitEditorial('bad-name');

      await waitFor(() =>
        expect(mockCms.alerts.error).toHaveBeenCalledWith('Invalid ref name')
      );
      expect(
        (screen.getAllByRole('textbox')[1] as HTMLInputElement).value
      ).toBe('bad-name');
      expect(mockCms.alerts.success).not.toHaveBeenCalled();
    });

    it('returns to the branch list instead of a spinner on cancel', async () => {
      renderEditorial(vi.fn().mockRejectedValue(new Error('Invalid ref name')));

      await submitEditorial('bad-name');
      await waitFor(() => expect(mockCms.alerts.error).toHaveBeenCalled());
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

      await screen.findByText('Open creator');
    });

    it('falls back to a generic message for a non-Error rejection', async () => {
      renderEditorial(vi.fn().mockRejectedValue('nope'));

      await submitEditorial('name');

      await waitFor(() =>
        expect(mockCms.alerts.error).toHaveBeenCalledWith(
          'There was an error creating a new branch.'
        )
      );
    });
  });
});
