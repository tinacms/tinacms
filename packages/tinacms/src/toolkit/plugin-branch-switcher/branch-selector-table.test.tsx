import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Branch } from './types';

// Mock useCMS — must be declared before importing the component
const mockCms = {
  api: {
    tina: {
      branch: 'main',
      schema: { config: { config: { ui: { previewUrl: undefined } } } },
      usingProtectedBranch: vi.fn(() => true),
      createPullRequest: vi.fn(),
    },
  },
  alerts: {
    success: vi.fn(),
    error: vi.fn(),
  },
};

vi.mock('@toolkit/react-core', () => ({
  useCMS: () => mockCms,
}));

// Mock captureEvent so we can assert on telemetry calls
const mockCaptureEvent = vi.fn();
vi.mock('../../lib/posthog/posthogProvider', () => ({
  captureEvent: (...args: any[]) => mockCaptureEvent(...args),
}));

// Re-export the real event name constants so the component can import them
vi.mock('../../lib/posthog/posthog', async () => {
  return {
    BranchSwitcherSearchEvent: 'branch-switcher-search',
    BranchSwitcherDropDownEvent: 'branch-switcher-dropdown',
    BranchSwitcherPRClickedEvent: 'branch-switcher-pr-clicked',
  };
});

import BranchSelectorTable from './branch-selector-table';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = Date.now();

function makeBranch(overrides: Partial<Branch> & { name: string }): Branch {
  return {
    indexStatus: { status: 'complete', timestamp: now - 3600_000 },
    ...overrides,
  };
}

/** Query an element and throw a descriptive error if not found. */
function assertFound<T extends Element>(
  el: T | null | undefined,
  description: string
): T {
  if (!el) throw new Error(`Expected to find ${description}`);
  return el;
}

// Use tina/ prefix so branches pass the default "content" filter, or mark
// them protected. The getFilteredBranchList function (used internally) only
// shows branches starting with "tina/" when the filter is set to "content"
// (the default), plus any protected branches.
const defaultBranches: Branch[] = [
  makeBranch({ name: 'main', protected: true }),
  makeBranch({ name: 'tina/feature-one' }),
  makeBranch({ name: 'tina/feature-two' }),
  makeBranch({
    name: 'tina/indexing',
    indexStatus: { status: 'inprogress', timestamp: now - 1000 },
  }),
];

const defaultProps = {
  branchList: defaultBranches,
  currentBranch: 'main',
  onChange: vi.fn(),
  refreshBranchList: vi.fn(),
  createBranch: vi.fn(),
};

function renderTable(overrides: Partial<typeof defaultProps> = {}) {
  const user = userEvent.setup();
  return {
    user,
    ...render(<BranchSelectorTable {...defaultProps} {...overrides} />),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.restoreAllMocks();
  // Re-apply default mock implementations after restoreAllMocks clears them
  mockCaptureEvent.mockImplementation(() => {});
  mockCms.api.tina.usingProtectedBranch.mockReturnValue(true);
  mockCms.api.tina.createPullRequest.mockReset();
  mockCms.api.tina.branch = 'main';
});

describe('BranchSelectorTable', () => {
  // ---- Rendering ----------------------------------------------------------

  describe('rendering', () => {
    it('renders table column headers', () => {
      const { getByText } = renderTable();
      // getByText throws if not found — no assertion needed beyond the call
      getByText('Branch Name');
      getByText('Last Updated');
      getByText('Pull Request');
    });

    it('renders all branch names', () => {
      const { getByText } = renderTable();
      getByText('main');
      getByText('tina/feature-one');
      getByText('tina/feature-two');
      getByText('tina/indexing');
    });

    it('shows "Currently editing" badge for the current branch', () => {
      const { getByText } = renderTable();
      getByText('Currently editing');
    });

    it('shows indexing status for in-progress branches', () => {
      const { container } = renderTable();
      // IndexStatus renders icon + text inside a styled <span>.
      // No accessible role/label exists — CSS query is intentional here.
      const badge = assertFound(
        container.querySelector('.text-blue-500.border-blue-500'),
        'in-progress indexing badge'
      );
      expect(badge.textContent).toContain('Indexing');
    });

    it.each([
      ['failed', 'Indexing failed'],
      ['timeout', 'Indexing timed out'],
    ] as const)('shows "%s" error badge', (status, expectedText) => {
      const branches = [
        makeBranch({ name: 'main', protected: true }),
        makeBranch({
          name: 'tina/bad',
          indexStatus: { status, timestamp: now },
        }),
      ];
      const { container } = renderTable({ branchList: branches });
      const badge = assertFound(
        container.querySelector('.text-red-500.border-red-500'),
        `${status} indexing badge`
      );
      expect(badge.textContent).toContain(expectedText);
    });

    it('renders lock icon for protected and git icon for non-protected branches', () => {
      const branches = [
        makeBranch({ name: 'main', protected: true }),
        makeBranch({ name: 'tina/unprotected', protected: false }),
      ];
      const { getByText } = renderTable({ branchList: branches });

      // No accessible role/label on the icons — CSS query is intentional.
      const protectedRow = assertFound(
        getByText('main').closest('tr'),
        'protected row'
      );
      const unprotectedRow = assertFound(
        getByText('tina/unprotected').closest('tr'),
        'unprotected row'
      );

      expect(protectedRow.querySelector('svg.text-blue-500')).not.toBeNull();
      expect(protectedRow.querySelector('svg.text-gray-600')).toBeNull();
      expect(unprotectedRow.querySelector('svg.text-gray-600')).not.toBeNull();
      expect(unprotectedRow.querySelector('svg.text-blue-500')).toBeNull();
    });
  });

  // ---- Row selection ------------------------------------------------------

  describe('row selection', () => {
    // The Button component applies CSS classes (pointer-events-none) instead
    // of the HTML disabled attribute, so we check className.
    const getOpenButton = (getByRole: Function) =>
      getByRole('button', {
        name: 'Open branch in editor',
      }) as HTMLButtonElement;
    const isDisabled = (btn: HTMLButtonElement) =>
      btn.className.includes('pointer-events-none');

    it('selecting a branch enables the "Open branch in editor" button', async () => {
      const { user, getByText, getByRole } = renderTable();
      const button = getOpenButton(getByRole);
      expect(isDisabled(button)).toBe(true);

      await user.click(
        assertFound(getByText('tina/feature-one').closest('tr'), 'row')
      );
      expect(isDisabled(button)).toBe(false);
    });

    it('clicking a selected row deselects it (toggles)', async () => {
      const { user, getByText, getByRole } = renderTable();
      const row = assertFound(
        getByText('tina/feature-one').closest('tr'),
        'row'
      );
      const button = getOpenButton(getByRole);

      await user.click(row);
      expect(isDisabled(button)).toBe(false);

      await user.click(row);
      expect(isDisabled(button)).toBe(true);
    });

    it('clicking "Open branch in editor" calls onChange with the selected branch', async () => {
      const onChange = vi.fn();
      const { user, getByText, getByRole } = renderTable({ onChange });

      await user.click(
        assertFound(getByText('tina/feature-two').closest('tr'), 'row')
      );
      await user.click(getOpenButton(getByRole));
      expect(onChange).toHaveBeenCalledWith('tina/feature-two');
    });

    it('non-complete (in-progress) branches are not selectable', async () => {
      const { user, getByText, getByRole } = renderTable();
      await user.click(
        assertFound(getByText('tina/indexing').closest('tr'), 'row')
      );
      expect(isDisabled(getOpenButton(getByRole))).toBe(true);
    });
  });

  // ---- Search + telemetry -------------------------------------------------

  describe('search input', () => {
    it('filters the branch list when the user types', async () => {
      const { user, getByPlaceholderText, queryByText } = renderTable();
      const input = getByPlaceholderText('Branch name or PR #');

      await user.clear(input);
      await user.type(input, 'feature-one');

      expect(queryByText('tina/feature-one')).not.toBeNull();
      // Non-matching branches filtered out (current branch always visible)
      expect(queryByText('tina/feature-two')).toBeNull();
    });

    it('fires captureEvent exactly once on the first search keystroke', async () => {
      const { user, getByPlaceholderText } = renderTable();
      const input = getByPlaceholderText('Branch name or PR #');

      await user.type(input, 'f');
      expect(mockCaptureEvent).toHaveBeenCalledTimes(1);
      expect(mockCaptureEvent).toHaveBeenCalledWith(
        'branch-switcher-search',
        {}
      );

      await user.type(input, 'ea');
      expect(mockCaptureEvent).toHaveBeenCalledTimes(1);
    });

    it('does not fire captureEvent when clearing search to empty', async () => {
      const { user, getByPlaceholderText } = renderTable();
      const input = getByPlaceholderText('Branch name or PR #');

      await user.type(input, 'x');
      mockCaptureEvent.mockClear();
      await user.clear(input);
      expect(mockCaptureEvent).not.toHaveBeenCalled();
    });

    it('clears search text when clear button is clicked', async () => {
      const { user, getByPlaceholderText, container } = renderTable();
      const input = getByPlaceholderText(
        'Branch name or PR #'
      ) as HTMLInputElement;

      await user.type(input, 'hello');
      // The clear button has no accessible label — CSS query is intentional.
      const clearButton = assertFound(
        container.querySelector('button.absolute'),
        'clear button'
      );
      await user.click(clearButton);
      expect(input.value).toBe('');
    });
  });

  // ---- Branch type dropdown + telemetry -----------------------------------

  describe('branch type dropdown', () => {
    it('fires captureEvent when the dropdown value changes', async () => {
      const { user, getByLabelText } = renderTable();
      const select = getByLabelText('Branch Type') as HTMLSelectElement;

      await user.selectOptions(select, 'all');

      expect(mockCaptureEvent).toHaveBeenCalledWith(
        'branch-switcher-dropdown',
        { option: 'all' }
      );
    });

    it('shows non-tina branches when filter is changed to "all"', async () => {
      const branches = [
        makeBranch({ name: 'main', protected: true }),
        makeBranch({ name: 'tina/content-branch' }),
        makeBranch({ name: 'feature/code-branch' }),
      ];
      const { user, getByLabelText, queryByText } = renderTable({
        branchList: branches,
      });

      expect(queryByText('feature/code-branch')).toBeNull();

      await user.selectOptions(getByLabelText('Branch Type'), 'all');

      expect(queryByText('feature/code-branch')).not.toBeNull();
    });
  });

  // ---- PullRequestCell ----------------------------------------------------

  describe('PullRequestCell', () => {
    const prUrl = 'https://github.com/org/repo/pull/42';

    describe('existing PR link', () => {
      const branchesWithPR = [
        makeBranch({ name: 'main', protected: true }),
        makeBranch({ name: 'tina/pr-branch', githubPullRequestUrl: prUrl }),
      ];

      it('renders a PR link', () => {
        const { getByTitle } = renderTable({ branchList: branchesWithPR });
        getByTitle('Open Git Pull Request');
      });

      it('fires captureEvent and opens URL when clicked', async () => {
        vi.spyOn(window, 'open').mockImplementation(() => null);
        const { user, getByTitle } = renderTable({
          branchList: branchesWithPR,
        });

        await user.click(getByTitle('Open Git Pull Request'));

        expect(mockCaptureEvent).toHaveBeenCalledWith(
          'branch-switcher-pr-clicked',
          { type: 'Open Git Pull Request' }
        );
        expect(window.open).toHaveBeenCalledWith(prUrl, '_blank');
      });
    });

    describe('Create PR button visibility', () => {
      it('shows for non-protected branches when on a protected branch', () => {
        const branches = [
          makeBranch({ name: 'main', protected: true }),
          makeBranch({ name: 'tina/no-pr', protected: false }),
        ];
        const { getByTitle } = renderTable({ branchList: branches });
        getByTitle('Create Pull Request');
      });

      it('hidden for protected branches', () => {
        const branches = [
          makeBranch({ name: 'main', protected: true }),
          makeBranch({ name: 'production', protected: true }),
        ];
        const { queryByTitle } = renderTable({ branchList: branches });
        expect(queryByTitle('Create Pull Request')).toBeNull();
      });

      it('hidden when not on a protected branch', () => {
        mockCms.api.tina.usingProtectedBranch.mockReturnValue(false);
        const branches = [
          makeBranch({ name: 'tina/current' }),
          makeBranch({ name: 'tina/other', protected: false }),
        ];
        const { queryByTitle } = renderTable({
          branchList: branches,
          currentBranch: 'tina/current',
        });
        expect(queryByTitle('Create Pull Request')).toBeNull();
      });
    });

    describe('Create PR action', () => {
      const createPRBranches = [
        makeBranch({ name: 'main', protected: true }),
        makeBranch({ name: 'tina/needs-pr', protected: false }),
      ];

      it('fires captureEvent, calls API, refreshes list, and shows success alert', async () => {
        mockCms.api.tina.createPullRequest.mockResolvedValue({
          url: 'https://github.com/org/repo/pull/99',
        });
        const refreshBranchList = vi.fn();
        const { user, getByTitle } = renderTable({
          branchList: createPRBranches,
          refreshBranchList,
        });

        await user.click(getByTitle('Create Pull Request'));

        expect(mockCaptureEvent).toHaveBeenCalledWith(
          'branch-switcher-pr-clicked',
          { type: 'Create PR' }
        );
        expect(mockCms.api.tina.createPullRequest).toHaveBeenCalledWith({
          baseBranch: 'main',
          branch: 'tina/needs-pr',
          title: 'needs pr (PR from TinaCMS)',
        });
        expect(refreshBranchList).toHaveBeenCalled();
        expect(mockCms.alerts.success).toHaveBeenCalledWith(
          expect.stringContaining('Pull request created successfully')
        );
      });

      it('shows error alert when createPullRequest fails', async () => {
        mockCms.api.tina.createPullRequest.mockRejectedValue(
          new Error('API error')
        );
        const { user, getByTitle } = renderTable({
          branchList: createPRBranches,
        });

        await user.click(getByTitle('Create Pull Request'));

        expect(mockCms.alerts.error).toHaveBeenCalledWith('API error');
      });

      it('shows "Creating PR..." spinner while request is in flight', async () => {
        let resolvePromise: (val: any) => void;
        mockCms.api.tina.createPullRequest.mockImplementation(
          () =>
            new Promise((resolve) => {
              resolvePromise = resolve;
            })
        );
        const { user, getByTitle, queryByText } = renderTable({
          branchList: createPRBranches,
        });

        // Start the PR creation without awaiting resolution
        const clickPromise = user.click(getByTitle('Create Pull Request'));

        await waitFor(() => {
          expect(queryByText('Creating PR...')).not.toBeNull();
        });

        await act(async () => {
          resolvePromise({ url: 'https://github.com/org/repo/pull/1' });
        });
        await clickPromise;

        await waitFor(() => {
          expect(queryByText('Creating PR...')).toBeNull();
        });
      });
    });
  });
});
