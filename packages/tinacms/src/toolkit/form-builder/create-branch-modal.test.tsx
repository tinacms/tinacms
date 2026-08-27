import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockUser: any;

vi.mock('../react-core', () => ({
  useCMS: () => ({
    api: {
      tina: {
        user: mockUser,
        gitSettingsLink: 'https://app.tina.io/account/git',
      },
    },
  }),
}));

import { ModalProvider } from '../react-modals';
import { CreateBranchPromptModal } from './create-branch-modal';

const renderModal = () =>
  render(
    <ModalProvider>
      <CreateBranchPromptModal
        branchName='my-branch'
        close={vi.fn()}
        onBranchNameChange={vi.fn()}
        onCreateBranch={vi.fn()}
        onSaveToProtectedBranch={vi.fn()}
      />
    </ModalProvider>
  );

describe('CreateBranchPromptModal committing-author row', () => {
  beforeEach(() => {
    mockUser = undefined;
  });

  it('renders the full name and initials in user authoring mode', () => {
    mockUser = {
      gitAuthoring: { mode: 'user' },
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    };

    renderModal();

    expect(screen.getByText('Committing as')).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('AL')).toBeTruthy();
  });

  it('falls back to the email and uses only its local part for initials', () => {
    mockUser = { gitAuthoring: { mode: 'user' }, email: 'ada@example.com' };

    renderModal();

    expect(screen.getByText('ada@example.com')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('keeps both initials for a dotted email local part', () => {
    mockUser = {
      gitAuthoring: { mode: 'user' },
      email: 'josh.berman@ssw.com.au',
    };

    renderModal();

    expect(screen.getByText('JB')).toBeTruthy();
  });

  it('renders the bot in bot authoring mode', () => {
    mockUser = { gitAuthoring: { mode: 'bot' }, fullName: 'Ada Lovelace' };

    renderModal();

    expect(screen.getByText('TinaCloud bot')).toBeTruthy();
    expect(screen.queryByText('Ada Lovelace')).toBeNull();
  });

  it('links Change to the git settings page', () => {
    mockUser = { gitAuthoring: { mode: 'bot' } };

    renderModal();

    expect(screen.getByText('Change').getAttribute('href')).toBe(
      'https://app.tina.io/account/git'
    );
  });

  // Older TinaCloud deployments and custom auth providers return no
  // gitAuthoring, so the row must disappear rather than guess.
  it.each([
    ['no gitAuthoring field', { id: 'user1' }],
    ['a non-object user', true],
    ['an unknown mode', { gitAuthoring: { mode: 'something-else' } }],
  ])('renders no author row with %s', (_label, user) => {
    mockUser = user;

    renderModal();

    expect(screen.queryByText('Committing as')).toBeNull();
    expect(screen.queryByText('Change')).toBeNull();
    // The rest of the modal is unaffected.
    expect(screen.getByText('Branch Name')).toBeTruthy();
  });
});
