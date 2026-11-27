import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';

afterEach(() => vi.unstubAllGlobals());

const stubCoarse = (coarse: boolean) =>
  vi.stubGlobal('matchMedia', () => ({
    matches: coarse,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

const view = () =>
  render(
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger aria-label='Help'>?</TooltipTrigger>
        <TooltipContent>Explains it</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

describe('Tooltip on touch', () => {
  it('opens on hover with a mouse', async () => {
    stubCoarse(false);
    view();
    await userEvent.hover(screen.getByRole('button', { name: 'Help' }));
    expect(await screen.findByText('Explains it')).toBeVisible();
  });

  it('stays closed on a touch screen and keeps the name', async () => {
    stubCoarse(true);
    view();
    await userEvent.hover(screen.getByRole('button', { name: 'Help' }));
    expect(screen.queryByText('Explains it')).toBeNull();
  });
});
