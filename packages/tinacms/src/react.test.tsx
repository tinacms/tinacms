import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TinaAdminOriginProvider } from './internal-admin-origin';
import { hashFromQuery, useEditState, useTina } from './react';

const query = 'query Post { post(relativePath: "hello.md") { title } }';
const variables = { relativePath: 'hello.md' };

// Both ends of the overlay wire derive the same id from query + variables.
const id = hashFromQuery(JSON.stringify({ query, variables }));

// Stable reference: useTina re-derives its processed data whenever `data`
// changes identity, so an inline literal here would re-fire its effect on
// every render.
const initialData = { title: 'initial' };

function Probe() {
  const { data } = useTina<{ title: string }>({
    query,
    variables,
    data: initialData,
  });
  return <span data-testid='title'>{data?.title}</span>;
}

function dispatchUpdate(origin: string, title: string, source?: Window) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin,
        source: source ?? null,
        data: { type: 'updateData', id, data: { title } },
      })
    );
  });
}

describe('useTina overlay message handling', () => {
  beforeEach(() => {
    // The hook posts to the parent on mount; in the test runner the parent
    // is the same window, so stub postMessage to a no-op.
    vi.spyOn(window, 'postMessage').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ignores message events from untrusted origins', () => {
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('title').textContent).toBe('initial');

    dispatchUpdate(
      'https://untrusted.example',
      'untrusted-update',
      window.parent
    );

    expect(getByTestId('title').textContent).toBe('initial');
  });

  it('updates rendered data from a trusted same-origin admin message', () => {
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('title').textContent).toBe('initial');

    dispatchUpdate(window.location.origin, 'updated', window.parent);

    expect(getByTestId('title').textContent).toBe('updated');
  });

  it('honours an admin origin supplied through TinaAdminOriginProvider', () => {
    const adminOrigin = 'https://admin.example';
    const { getByTestId } = render(
      <TinaAdminOriginProvider origin={adminOrigin}>
        <Probe />
      </TinaAdminOriginProvider>
    );
    expect(getByTestId('title').textContent).toBe('initial');

    // Same-origin no longer counts as admin once an explicit origin is set.
    dispatchUpdate(window.location.origin, 'same-origin', window.parent);
    expect(getByTestId('title').textContent).toBe('initial');

    dispatchUpdate(adminOrigin, 'from-admin', window.parent);
    expect(getByTestId('title').textContent).toBe('from-admin');
  });
});

function EditProbe() {
  const { edit } = useEditState();
  return <span data-testid='edit'>{edit ? 'editing' : 'idle'}</span>;
}

function dispatchEditMode(origin: string, source?: Window) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin,
        source: source ?? null,
        data: { type: 'tina:editMode' },
      })
    );
  });
}

describe('useEditState edit-mode message handling', () => {
  beforeEach(() => {
    // The hook posts `isEditMode` to the parent on mount; in the test runner
    // the parent is the same window, so stub postMessage to a no-op.
    vi.spyOn(window, 'postMessage').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ignores a forged tina:editMode message from an untrusted origin', () => {
    const { getByTestId } = render(<EditProbe />);
    expect(getByTestId('edit').textContent).toBe('idle');

    dispatchEditMode('https://evil.attacker.com', window.parent);

    expect(getByTestId('edit').textContent).toBe('idle');
  });

  it('ignores a tina:editMode message from an unexpected source window', () => {
    const { getByTestId } = render(<EditProbe />);
    expect(getByTestId('edit').textContent).toBe('idle');

    // Right origin, wrong source window (not window.parent).
    dispatchEditMode(window.location.origin, {} as Window);

    expect(getByTestId('edit').textContent).toBe('idle');
  });

  it('enables edit mode from a trusted same-origin admin message', () => {
    const { getByTestId } = render(<EditProbe />);
    expect(getByTestId('edit').textContent).toBe('idle');

    dispatchEditMode(window.location.origin, window.parent);

    expect(getByTestId('edit').textContent).toBe('editing');
  });

  it('honours an admin origin supplied through TinaAdminOriginProvider', () => {
    const adminOrigin = 'https://admin.example';
    const { getByTestId } = render(
      <TinaAdminOriginProvider origin={adminOrigin}>
        <EditProbe />
      </TinaAdminOriginProvider>
    );
    expect(getByTestId('edit').textContent).toBe('idle');

    // Same-origin no longer counts as admin once an explicit origin is set.
    dispatchEditMode(window.location.origin, window.parent);
    expect(getByTestId('edit').textContent).toBe('idle');

    dispatchEditMode(adminOrigin, window.parent);
    expect(getByTestId('edit').textContent).toBe('editing');
  });

  it('ignores unrelated message types from a trusted origin', () => {
    const { getByTestId } = render(<EditProbe />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: window.parent,
          data: { type: 'something-else' },
        })
      );
    });

    expect(getByTestId('edit').textContent).toBe('idle');
  });

  it('removes its message listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<EditProbe />);

    unmount();

    const removedMessageListener = removeSpy.mock.calls.some(
      ([type]) => type === 'message'
    );
    expect(removedMessageListener).toBe(true);
  });
});
