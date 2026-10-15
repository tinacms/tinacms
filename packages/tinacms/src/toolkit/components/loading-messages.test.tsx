import { act, render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOADING_MESSAGES, LoadingMessage } from './loading-messages';

const MESSAGES = ['first', 'second', 'third'];

const tick = () =>
  act(() => {
    vi.advanceTimersByTime(2000);
  });

describe('LoadingMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('never repeats the message it is replacing', () => {
    const { container } = render(<LoadingMessage messages={MESSAGES} />);
    const text = () => container.querySelector('p')?.textContent as string;

    let previous = text();
    for (let i = 0; i < 20; i++) {
      tick();
      expect(MESSAGES).toContain(text());
      expect(text()).not.toBe(previous);
      previous = text();
    }
  });

  it('shows a random message once mounted', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const { container, unmount } = render(<LoadingMessage />);
      seen.add(container.querySelector('p')?.textContent as string);
      unmount();
    }
    expect(seen.size).toBeGreaterThan(1);
    for (const message of seen) {
      expect(LOADING_MESSAGES).toContain(message);
    }
  });

  it('fades out before the text changes', () => {
    const { container } = render(<LoadingMessage messages={MESSAGES} />);
    const opacity = () => container.querySelector('p')?.style.opacity;

    expect(opacity()).toBe('1');

    act(() => {
      vi.advanceTimersByTime(1800);
    });
    expect(opacity()).toBe('0');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(opacity()).toBe('1');
  });
});
