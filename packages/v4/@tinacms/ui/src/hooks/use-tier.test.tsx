import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  DESKTOP_MIN_WIDTH,
  resetTierQueries,
  TABLET_MIN_WIDTH,
  useTier,
} from '@tinacms/ui/hooks/use-tier';
import { guardConsole } from '../test/console-guard';

guardConsole();

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

describe('useTier tokens', () => {
  it('keeps the fallback widths equal to tokens.css', () => {
    const css = readFileSync(
      join(process.cwd(), 'src/styles/tokens.css'),
      'utf8'
    );
    const rem = (name: string) =>
      Number(new RegExp(`--${name}: ([\\d.]+)rem`).exec(css)?.[1]) * 16;
    expect(rem('breakpoint-tablet')).toBe(TABLET_MIN_WIDTH);
    expect(rem('breakpoint-desktop')).toBe(DESKTOP_MIN_WIDTH);
  });

  it('reads the steps from the document tokens', () => {
    document.documentElement.style.setProperty('--breakpoint-desktop', '70rem');
    resetTierQueries();
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(min-width: 70rem)' || query.includes('48rem'),
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<Probe />);
    expect(screen.getByText('desktop')).toBeVisible();
    document.documentElement.style.removeProperty('--breakpoint-desktop');
    resetTierQueries();
  });
});
