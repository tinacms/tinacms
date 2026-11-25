import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@tinacms/ui/components/sidebar';
import { guardConsole } from '../test/console-guard';

guardConsole();

const stubWidth = (width: number) =>
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = Number(/min-width: (\d+)px/.exec(query)?.[1] ?? 0);
    return {
      matches: width >= min,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

afterEach(() => vi.unstubAllGlobals());

function PickHome() {
  const { setOpenMobile } = useSidebar();
  return (
    <a href='#/' aria-current='page' onClick={() => setOpenMobile(false)}>
      Home
    </a>
  );
}

const renderShell = () =>
  render(
    <SidebarProvider>
      <header>
        <SidebarTrigger />
      </header>
      <Sidebar aria-label='Content' role='navigation' collapsible='icon'>
        <SidebarContent>
          <a href='#/first'>First</a>
          <PickHome />
          <p data-testid='heading'>Heading</p>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>page</SidebarInset>
    </SidebarProvider>
  );

describe('the side nav below desktop', () => {
  it('is not in the page until the menu button opens it', async () => {
    stubWidth(1000);
    const user = userEvent.setup();
    renderShell();
    expect(screen.queryByRole('navigation', { name: 'Content' })).toBeNull();
    const button = screen.getByRole('button', { name: 'Open side nav' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(
      await screen.findByRole('navigation', { name: 'Content' })
    ).toBeVisible();
    const close = screen.getByRole('button', { name: 'Close side nav' });
    expect(close).toHaveAttribute('aria-expanded', 'true');
  });

  it('puts focus on the current entry and returns it to the menu button on Escape', async () => {
    stubWidth(600);
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole('button', { name: 'Open side nav' }));
    const home = await screen.findByRole('link', { name: 'Home' });
    await waitFor(() => expect(home).toHaveFocus());

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('navigation', { name: 'Content' })).toBeNull()
    );
    expect(screen.getByRole('button', { name: 'Open side nav' })).toHaveFocus();
  });

  it('closes on the menu button, on the scrim and on picking an entry, not on its own padding', async () => {
    stubWidth(1000);
    const user = userEvent.setup();
    renderShell();
    const gone = () =>
      waitFor(() =>
        expect(screen.queryByRole('navigation', { name: 'Content' })).toBeNull()
      );
    const open = () =>
      user.click(screen.getByRole('button', { name: 'Open side nav' }));

    await open();
    await screen.findByRole('navigation', { name: 'Content' });
    await user.click(screen.getByRole('button', { name: 'Close side nav' }));
    await gone();

    await open();
    await user.click(await screen.findByTestId('heading'));
    expect(screen.getByRole('navigation', { name: 'Content' })).toBeVisible();
    const scrim = document.querySelector<HTMLElement>(
      '[data-slot=sidebar-scrim]'
    );
    expect(scrim).not.toBeNull();
    await user.click(scrim as HTMLElement);
    await gone();

    await open();
    await user.click(await screen.findByRole('link', { name: 'Home' }));
    await gone();
  });

  it('ignores ⌘B', async () => {
    stubWidth(1000);
    const user = userEvent.setup();
    renderShell();
    await user.keyboard('{Meta>}b{/Meta}');
    expect(screen.queryByRole('navigation', { name: 'Content' })).toBeNull();
  });
});

describe('the side nav at desktop', () => {
  it('stays in the page under the name Toggle Sidebar and folds with ⌘B', async () => {
    stubWidth(1440);
    const user = userEvent.setup();
    renderShell();
    expect(
      screen.getByRole('navigation', { name: 'Content' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Toggle Sidebar' })
    ).not.toHaveAttribute('aria-expanded');
    await user.keyboard('{Meta>}b{/Meta}');
    expect(
      document.querySelector('[data-slot=sidebar]')?.getAttribute('data-state')
    ).toBe('collapsed');
  });
});
