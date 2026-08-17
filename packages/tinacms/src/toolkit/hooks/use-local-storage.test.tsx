import { act, render } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useLocalStorage } from './use-local-storage';

// Renders a probe component and records the value from every render, so we can
// assert what the very first render saw (i.e. whether storage is read
// synchronously or only after a post-mount effect).
const renderProbe = (key: string, initialValue: unknown) => {
  const renders: unknown[] = [];
  let setValue: (value: unknown) => void = () => {};
  const Probe = () => {
    const [value, set] = useLocalStorage(key, initialValue);
    setValue = set;
    renders.push(value);
    return null;
  };
  render(<Probe />);
  return { renders, setValue: (v: unknown) => setValue(v) };
};

describe('useLocalStorage', () => {
  beforeEach(() => window.localStorage.clear());

  it('returns the initial value on first render when nothing is stored', () => {
    const { renders } = renderProbe('k', 'fallback');
    expect(renders[0]).toBe('fallback');
  });

  it('reads the stored value synchronously on first render (no flicker)', () => {
    window.localStorage.setItem('k', JSON.stringify(false));

    const { renders } = renderProbe('k', true);

    // The first render must already reflect storage, not the initial value.
    expect(renders[0]).toBe(false);
  });

  it('persists updates as JSON via the setter', () => {
    const { setValue } = renderProbe('k', true);

    act(() => setValue(false));

    expect(window.localStorage.getItem('k')).toBe('false');
  });
});
