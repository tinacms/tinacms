import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BranchCreator } from './branch-switcher';
import { CreateBranch } from './branch-switcher-legacy';

const createButton = () =>
  screen.getByRole('button', { name: /create branch/i }) as HTMLButtonElement;

// The toolkit Button renders `disabled` as styling, not the DOM attribute, so the
// button stays focusable. `click()` stands in for that keyboard activation path.
const isStyledDisabled = () =>
  createButton().className.includes('cursor-not-allowed');

describe('BranchCreator (editorial workflow)', () => {
  const renderCreator = () => {
    const handleCreateBranch = vi.fn();
    const { container } = render(
      <BranchCreator
        setViewState={vi.fn()}
        handleCreateBranch={handleCreateBranch}
        currentBranch='main'
      />
    );
    // the first textbox is the disabled "Current Branch Name" field
    const input = screen.getAllByRole('textbox')[1];
    return { handleCreateBranch, input, form: container.querySelector('form') };
  };

  it('disables create when the name normalises to empty', async () => {
    const { input } = renderCreator();
    await userEvent.type(input, '///');
    expect(isStyledDisabled()).toBe(true);
  });

  it('does not create a branch when activated with a name that normalises to empty', async () => {
    const { handleCreateBranch, input } = renderCreator();
    await userEvent.type(input, '///');
    createButton().click();
    expect(handleCreateBranch).not.toHaveBeenCalled();
  });

  it('does not let form submission reload the page', () => {
    const { form } = renderCreator();
    const submitted = fireEvent.submit(form);
    // fireEvent returns false when a handler called preventDefault
    expect(submitted).toBe(false);
  });

  it('submits the normalised name under the tina/ prefix', async () => {
    const { handleCreateBranch, input } = renderCreator();
    await userEvent.type(input, '//My Branch//');
    expect(isStyledDisabled()).toBe(false);
    await userEvent.click(createButton());
    expect(handleCreateBranch).toHaveBeenCalledWith('tina/my-branch');
  });
});

describe('CreateBranch (legacy switcher)', () => {
  const renderCreator = (newBranchName: string) => {
    const onCreateBranch = vi.fn();
    render(
      <CreateBranch
        currentBranch='main'
        newBranchName={newBranchName}
        onCreateBranch={onCreateBranch}
        setNewBranchName={vi.fn()}
      />
    );
    return { onCreateBranch };
  };

  it('disables create when the name normalises to empty', () => {
    renderCreator('///');
    expect(isStyledDisabled()).toBe(true);
  });

  it('does not create a branch when activated with a name that normalises to empty', () => {
    const { onCreateBranch } = renderCreator('///');
    createButton().click();
    expect(onCreateBranch).not.toHaveBeenCalled();
  });

  it('submits the normalised name', async () => {
    const { onCreateBranch } = renderCreator('//My Branch//');
    expect(isStyledDisabled()).toBe(false);
    await userEvent.click(createButton());
    expect(onCreateBranch).toHaveBeenCalledWith('my-branch');
  });
});
