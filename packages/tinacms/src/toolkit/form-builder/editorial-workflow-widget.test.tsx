import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorialWorkflowWidget } from './editorial-workflow-widget';

describe('EditorialWorkflowWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-24T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const running = {
    phase: 'running' as const,
    branchName: 'tina/hello-updates',
    step: 2 as const,
    startedAt: Date.parse('2026-09-24T00:00:00Z'),
  };

  it('renders nothing when idle', () => {
    const { container } = render(
      <EditorialWorkflowWidget state={{ phase: 'idle' }} onDismiss={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows the current step and ticks the elapsed time', () => {
    render(<EditorialWorkflowWidget state={running} onDismiss={vi.fn()} />);

    expect(
      screen.getByText('tina/hello-updates · Step 2 of 3: Updating branch')
    ).toBeTruthy();
    expect(screen.getByText('0:00')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('0:05')).toBeTruthy();
  });

  it('expands to the full indicator and collapses back', () => {
    render(<EditorialWorkflowWidget state={running} onDismiss={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Expand'));
    expect(screen.getByText('Syncing content to branch')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Collapse'));
    expect(screen.queryByText('Syncing content to branch')).toBeNull();
  });

  it('prompts to save again when the form changed during the save', () => {
    render(
      <EditorialWorkflowWidget
        state={{
          phase: 'success',
          branchName: 'tina/hello-updates',
          pullRequestUrl: 'https://github.com/org/repo/pull/1',
          hasNewEdits: true,
        }}
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByText('pull request').getAttribute('href')).toBe(
      'https://github.com/org/repo/pull/1'
    );
    expect(screen.getByText(/Save again to add them/)).toBeTruthy();
  });

  it('shows the error and dismisses it', () => {
    const onDismiss = vi.fn();
    render(
      <EditorialWorkflowWidget
        state={{
          phase: 'error',
          error: { messageParts: [{ text: 'Indexing failed' }] },
        }}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('Indexing failed')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });
});
