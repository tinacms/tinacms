import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useKeyboardOpen } from '@tinacms/ui/hooks/use-keyboard-open';
import { guardConsole } from '../test/console-guard';

guardConsole();

const Probe = () => (
  <>
    <input aria-label='name' />
    <button type='button'>press</button>
    <p>{useKeyboardOpen() ? 'open' : 'closed'}</p>
  </>
);

const fakeViewport = (height: number) => {
  const target = new EventTarget();
  vi.stubGlobal('visualViewport', Object.assign(target, { height }));
  return (next: number) => {
    Object.assign(target, { height: next });
    target.dispatchEvent(new Event('resize'));
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useKeyboardOpen', () => {
  it('is open only while an editable has focus and the viewport has shrunk', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const resize = fakeViewport(window.innerHeight);
    render(<Probe />);
    act(() => screen.getByLabelText('name').focus());
    expect(screen.getByText('closed')).toBeVisible();
    act(() => resize(window.innerHeight - 300));
    expect(screen.getByText('open')).toBeVisible();
    act(() => resize(window.innerHeight));
    expect(screen.getByText('closed')).toBeVisible();
  });

  it('stays closed when a button has focus', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    fakeViewport(window.innerHeight - 300);
    render(<Probe />);
    act(() => screen.getByRole('button').focus());
    expect(screen.getByText('closed')).toBeVisible();
  });
});
