import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTier } from '@tinacms/ui/hooks/use-tier';

const listeners = new Set<() => void>();
let width = 1440;

const stubWidth = () =>
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = Number(/min-width: (\d+)px/.exec(query)?.[1] ?? 0);
    return {
      get matches() {
        return width >= min;
      },
      addEventListener: (_: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) =>
        listeners.delete(listener),
    };
  });

const Probe = () => <p>{useTier()}</p>;

afterEach(() => {
  vi.unstubAllGlobals();
  listeners.clear();
});

describe('useTier', () => {
  it.each([
    [390, 'phone'],
    [767, 'phone'],
    [768, 'tablet'],
    [1279, 'tablet'],
    [1280, 'desktop'],
  ])('reads a %ipx window as %s', (at, tier) => {
    width = at;
    stubWidth();
    render(<Probe />);
    expect(screen.getByText(tier)).toBeVisible();
  });

  it('follows the window when it crosses a step', () => {
    width = 1440;
    stubWidth();
    render(<Probe />);
    width = 800;
    act(() => {
      for (const listener of listeners) listener();
    });
    expect(screen.getByText('tablet')).toBeVisible();
  });
});
