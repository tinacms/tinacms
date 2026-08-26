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

import { CommittingAs } from './create-branch-modal';

describe('CommittingAs', () => {
  beforeEach(() => {
    mockUser = undefined;
  });

  it('renders the full name in user authoring mode', () => {
    mockUser = {
      gitAuthoring: { mode: 'user' },
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    };

    render(<CommittingAs />);

    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('Committing as')).toBeTruthy();
  });

  it('falls back to the email when there is no full name', () => {
    mockUser = { gitAuthoring: { mode: 'user' }, email: 'ada@example.com' };

    render(<CommittingAs />);

    expect(screen.getByText('ada@example.com')).toBeTruthy();
  });

  it('renders the bot in bot authoring mode', () => {
    mockUser = {
      gitAuthoring: { mode: 'bot' },
      fullName: 'Ada Lovelace',
    };

    render(<CommittingAs />);

    expect(screen.getByText('TinaCloud bot')).toBeTruthy();
    expect(screen.queryByText('Ada Lovelace')).toBeNull();
  });

  it('links Change to the git settings page', () => {
    mockUser = { gitAuthoring: { mode: 'bot' } };

    render(<CommittingAs />);

    expect(screen.getByText('Change').getAttribute('href')).toBe(
      'https://app.tina.io/account/git'
    );
  });

  // Older TinaCloud deployments and custom auth providers return no
  // gitAuthoring, so the row must disappear rather than guess.
  it.each([
    ['no gitAuthoring field', { id: 'user1' }],
    ['no user', undefined],
    ['a null user', null],
    ['a non-object user', true],
    ['an unknown mode', { gitAuthoring: { mode: 'something-else' } }],
  ])('renders nothing with %s', (_label, user) => {
    mockUser = user;

    const { container } = render(<CommittingAs />);

    expect(container.innerHTML).toBe('');
    expect(screen.queryByText('Committing as')).toBeNull();
  });
});
