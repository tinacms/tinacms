import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTouch } from '@tinacms/ui/hooks/use-touch';

const Probe = () => <p>{useTouch() ? 'touch' : 'mouse'}</p>;

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-touch');
});

const stubCoarse = (coarse: boolean) =>
  vi.stubGlobal('matchMedia', () => ({
    matches: coarse,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

describe('useTouch', () => {
  it('is true for a coarse primary pointer', () => {
    stubCoarse(true);
    render(<Probe />);
    expect(screen.getByText('touch')).toBeVisible();
  });

  it('is false for a mouse', () => {
    stubCoarse(false);
    render(<Probe />);
    expect(screen.getByText('mouse')).toBeVisible();
  });

  it('follows data-touch on <html>', async () => {
    stubCoarse(false);
    render(<Probe />);
    document.documentElement.setAttribute('data-touch', '');
    await waitFor(() => expect(screen.getByText('touch')).toBeVisible());
  });
});
