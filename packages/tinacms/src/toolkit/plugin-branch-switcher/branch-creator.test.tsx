import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BranchCreator } from './branch-switcher';
import { CreateBranch } from './branch-switcher-legacy';

const createButton = () =>
  screen.getByRole('button', { name: /create branch/i }) as HTMLButtonElement;

// The toolkit Button renders `disabled` as styling rather than the DOM attribute
const isDisabled = () =>
  createButton().className.includes('cursor-not-allowed');

describe('BranchCreator (editorial workflow)', () => {
  const renderCreator = () => {
    const handleCreateBranch = vi.fn();
    render(
      <BranchCreator
        setViewState={vi.fn()}
        handleCreateBranch={handleCreateBranch}
        currentBranch='main'
      />
    );
    // the first textbox is the disabled "Current Branch Name" field
    const input = screen.getAllByRole('textbox')[1];
    return { handleCreateBranch, input };
  };

  it('disables create when the name normalises to empty', async () => {
    const { input } = renderCreator();
    await userEvent.type(input, '///');
    expect(isDisabled()).toBe(true);
  });

  it('submits the normalised name under the tina/ prefix', async () => {
    const { handleCreateBranch, input } = renderCreator();
    await userEvent.type(input, '//My Branch//');
    expect(isDisabled()).toBe(false);
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
    expect(isDisabled()).toBe(true);
  });

  it('submits the normalised name', async () => {
    const { onCreateBranch } = renderCreator('//My Branch//');
    expect(isDisabled()).toBe(false);
    await userEvent.click(createButton());
    expect(onCreateBranch).toHaveBeenCalledWith('my-branch');
  });
});
