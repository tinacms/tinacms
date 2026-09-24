import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCaptureEvent = vi.fn();
vi.mock('../../lib/posthog/posthogProvider', () => ({
  captureEvent: (...args: any[]) => mockCaptureEvent(...args),
}));

vi.mock('@utils/cn', () => ({
  cn: (...args: any[]) => args.join(' '),
}));

vi.mock('../../lib/posthog/posthog', async () => {
  return {
    BranchSwitcherOpenedEvent: 'branch-switcher-opened',
  };
});

vi.mock('./branch-data', () => ({
  useBranchData: () => ({
    currentBranch: 'main',
    setCurrentBranch: vi.fn(),
  }),
}));

vi.mock('@toolkit/react-tinacms', () => ({
  useCMS: () => ({
    flags: { get: (key: string) => key === 'branch-switcher' },
    api: { tina: { usingProtectedBranch: () => false } },
  }),
}));

vi.mock('./branch-modal', () => ({
  BranchModal: ({ close }: { close: () => void }) => (
    <div data-testid='branch-modal' />
  ),
}));

let mockIsExecuting = false;
vi.mock('../form-builder/editorial-workflow-provider', () => ({
  SAVE_IN_PROGRESS_MESSAGE: 'Unavailable while saving',
  useEditorialWorkflowState: () => ({ isExecuting: mockIsExecuting }),
}));

import { BranchButton } from './branch-button';

function renderBranchButton() {
  const user = userEvent.setup();
  return {
    user,
    ...render(<BranchButton />),
  };
}

describe('BranchButton telemetry', () => {
  beforeEach(() => {
    mockCaptureEvent.mockClear();
    mockIsExecuting = false;
  });

  it('fires BranchSwitcherOpenedEvent when clicked', async () => {
    const { user, getByTitle } = renderBranchButton();
    const button = getByTitle('main');
    await user.click(button);

    expect(mockCaptureEvent).toHaveBeenCalledWith('branch-switcher-opened', {});
  });

  it('is disabled while a save to a new branch runs', async () => {
    mockIsExecuting = true;
    const { user, getByTitle, queryByTestId } = renderBranchButton();

    const button = getByTitle('main') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(getByTitle('Unavailable while saving')).toBeTruthy();

    await user.click(button);
    expect(queryByTestId('branch-modal')).toBeNull();
  });
});
