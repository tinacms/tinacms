import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Base-branch guard check that never resolves, so we can assert what the UI
// shows while the pre-flight network request is still in flight.
const checkBaseBranchExists = vi.fn(() => new Promise<boolean>(() => {}));
vi.mock('./editorial-workflow-utils', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  checkBaseBranchExists: (...args: any[]) => checkBaseBranchExists(...args),
}));

const executeWorkflow = vi.fn(
  () => new Promise<{ success: boolean; error?: string }>(() => {})
);
vi.mock('./use-editorial-workflow', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useEditorialWorkflow: () => ({
    isExecuting: false,
    errorMessage: '',
    currentStep: 0,
    elapsedTime: 0,
    executeWorkflow,
    reset: vi.fn(),
  }),
}));

vi.mock('../react-core', () => ({
  useCMS: () => ({
    api: { tina: { branch: 'main', usingProtectedBranch: () => false } },
  }),
}));

vi.mock('@toolkit/styles', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  DropdownButton: ({ children, onMainAction, disabled }: any) => (
    <button type='button' disabled={disabled} onClick={onMainAction}>
      {children}
    </button>
  ),
}));

vi.mock('@toolkit/react-modals', async (importOriginal) => {
  const passthrough = ({ children }: any) => <div>{children}</div>;
  return {
    ...(await importOriginal<any>()),
    Modal: passthrough,
    PopupModal: passthrough,
    ModalHeader: passthrough,
    ModalBody: passthrough,
    ModalActions: passthrough,
  };
});

import { CreateBranchModal } from './create-branch-modal';

function renderModal() {
  const user = userEvent.setup();
  return {
    user,
    ...render(
      <CreateBranchModal
        close={vi.fn()}
        safeSubmit={vi.fn()}
        path='content/posts/hello.md'
        values={{}}
        crudType='update'
      />
    ),
  };
}

describe('CreateBranchModal', () => {
  beforeEach(() => {
    checkBaseBranchExists.mockClear();
    executeWorkflow.mockClear();
  });

  it('spins the submit button while the branch-guard check runs, without jumping to the progress modal', async () => {
    const { user, container } = renderModal();

    expect(screen.getByText(/First, let's create a copy/i)).toBeTruthy();

    await user.click(screen.getByText(/Save draft/i));

    // Immediate feedback: the button swaps its label for the loading dots
    // while the pre-flight check is still in flight.
    expect(container.querySelector('[style*="loading-dots"]')).toBeTruthy();
    expect(screen.queryByText(/Save draft/i)).toBeNull();
    expect(checkBaseBranchExists).toHaveBeenCalledTimes(1);

    // But we have NOT prematurely shown the "Creating branch" progress modal,
    // nor started the workflow — so a validation failure here would simply drop
    // back to the prompt with an error.
    expect(screen.getByText(/First, let's create a copy/i)).toBeTruthy();
    expect(screen.queryByText(/Estimated time/i)).toBeNull();
    expect(executeWorkflow).not.toHaveBeenCalled();
  });
});
