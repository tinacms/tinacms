import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../core/event';
import type { EditorialWorkflowCompleteEvent } from './editorial-workflow-utils';

const mockCms = { events: new EventBus() };

vi.mock('../react-core', () => ({
  useCMS: () => mockCms,
}));

import { ModalProvider } from '../react-modals';
import {
  PullRequestCreatedModal,
  PullRequestCreatedOverlay,
} from './pull-request-created-modal';

const completed = (
  overrides: Partial<EditorialWorkflowCompleteEvent> = {}
): EditorialWorkflowCompleteEvent => ({
  type: 'editorial-workflow:complete',
  branchName: 'tina/rules/example',
  pullRequestUrl: 'https://github.com/acme/site/pull/7',
  isDraft: true,
  collection: 'rules',
  relativePath: 'team/example.mdx',
  crudType: 'update',
  ...overrides,
});

const renderOverlay = () =>
  render(
    <ModalProvider>
      <PullRequestCreatedOverlay />
    </ModalProvider>
  );

const complete = (overrides: Partial<EditorialWorkflowCompleteEvent> = {}) =>
  act(() => {
    mockCms.events.dispatch(completed(overrides));
  });

describe('PullRequestCreatedModal', () => {
  const renderModal = (isDraft: boolean, pullRequestUrl?: string) =>
    render(
      <ModalProvider>
        <PullRequestCreatedModal
          branchName='tina/rules/example'
          pullRequestUrl={pullRequestUrl}
          isDraft={isDraft}
          onContinueEditing={vi.fn()}
          onDone={vi.fn()}
        />
      </ModalProvider>
    );

  it('says a draft pull request has not been sent for review', () => {
    renderModal(true);

    expect(screen.getByText('Draft pull request created')).toBeTruthy();
    expect(screen.getByText(/hasn't been sent for review/)).toBeTruthy();
    expect(screen.getByText('tina/rules/example')).toBeTruthy();
  });

  it('says a ready-for-review pull request is waiting for a reviewer', () => {
    renderModal(false);

    expect(screen.getByText('Pull request created')).toBeTruthy();
    expect(screen.getByText(/is ready for review/)).toBeTruthy();
  });

  it('links to the pull request in a new tab', () => {
    renderModal(true, 'https://github.com/acme/site/pull/7');

    const link = screen.getByRole('link', { name: /view pull request/i });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/acme/site/pull/7'
    );
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('omits the link when no pull request URL came back', () => {
    renderModal(true);

    expect(screen.queryByRole('link', { name: /view pull request/i })).toBe(
      null
    );
  });
});

describe('PullRequestCreatedOverlay', () => {
  beforeEach(() => {
    mockCms.events = new EventBus();
    window.location.hash = '#/~/rules/example';
  });

  it('registers as the listener the workflow looks for', () => {
    renderOverlay();

    expect(
      mockCms.events.hasExplicitListenerFor('editorial-workflow:complete')
    ).toBe(true);
  });

  it('renders nothing until a workflow completes', () => {
    renderOverlay();

    expect(screen.queryByText('Continue editing')).toBe(null);
  });

  it('keeps the editor on the page when they continue editing', async () => {
    renderOverlay();
    complete();

    await userEvent.click(screen.getByText('Continue editing'));

    expect(screen.queryByText('Continue editing')).toBe(null);
    expect(window.location.hash).toBe('#/~/rules/example');
  });

  it('opens the new document for editing after a create', async () => {
    renderOverlay();
    complete({ crudType: 'create' });

    await userEvent.click(screen.getByText('Continue editing'));

    expect(window.location.hash).toBe('#/collections/edit/rules/team/example');
  });

  it.each(['update', 'create'])(
    'leaves for the collection list on Done after an %s',
    async (crudType) => {
      renderOverlay();
      complete({ crudType });

      await userEvent.click(screen.getByText('Done'));

      expect(screen.queryByText('Done')).toBe(null);
      expect(window.location.hash).toBe('#/collections/rules/team');
    }
  );

  it('stops listening once unmounted', () => {
    const { unmount } = renderOverlay();
    unmount();

    expect(
      mockCms.events.hasExplicitListenerFor('editorial-workflow:complete')
    ).toBe(false);
  });
});
