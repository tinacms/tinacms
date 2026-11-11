import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { TileGrid } from '@tinacms/ui/components/tile';

function Flaky() {
  const [state, setState] = useState<'failed' | 'loading' | 'ready'>('failed');
  return (
    <>
      <HomePanelTray
        title='Recent documents'
        loading={state === 'loading' ? 2 : false}
        problem={
          state === 'failed' ? "Couldn't load recent documents." : undefined
        }
        onRetry={() => setState('loading')}
      >
        <p>About Tina</p>
      </HomePanelTray>
      <button type='button' onClick={() => setState('ready')}>
        finish
      </button>
    </>
  );
}

describe('HomePanelTray', () => {
  it('is a region named by its title, with its count and content', () => {
    render(
      <HomePanelTray title='Collections' count='7'>
        <p>tiles</p>
      </HomePanelTray>
    );
    const region = screen.getByRole('region', { name: /^Collections/ });
    expect(within(region).getByText('7')).toBeVisible();
    expect(within(region).getByText('tiles')).toBeVisible();
    expect(region.querySelector('[aria-busy]')).toBeNull();
  });

  it('holds placeholder rows, is busy and says Loading once while it loads', async () => {
    render(
      <HomePanelTray title='Branch' loading={2}>
        <p>main</p>
      </HomePanelTray>
    );
    const region = screen.getByRole('region', { name: 'Branch' });
    expect(screen.queryByText('main')).toBeNull();
    expect(
      region.querySelector('[data-slot=home-panel-sheet]')
    ).toHaveAttribute('aria-busy', 'true');
    expect(region.querySelectorAll('[data-slot=skeleton]')).toHaveLength(6);
    expect(await screen.findAllByText('Loading Branch')).toHaveLength(1);
  });

  it('shows the problem sentence with no Retry when trying again cannot help', () => {
    render(
      <HomePanelTray
        title='Recent documents'
        problem='Not available on this setup'
      >
        <p>rows</p>
      </HomePanelTray>
    );
    expect(screen.getByText('Not available on this setup')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(screen.queryByText('rows')).toBeNull();
  });

  it('moves focus to the panel and says its new words once after a Retry that works', async () => {
    const user = userEvent.setup();
    render(<Flaky />);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    const region = screen.getByRole('region', { name: 'Recent documents' });
    expect(region).not.toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'finish' }));
    await waitFor(() => expect(region).toHaveFocus());
    const announcement = region.querySelector('[data-slot=announcement]');
    await waitFor(() => expect(announcement).toHaveTextContent('About Tina'));
    expect(within(region).getAllByText('About Tina')).toHaveLength(2);
  });

  it('calls onRetry for each press', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <HomePanelTray
        title='Branch'
        problem="Couldn't load this branch."
        onRetry={onRetry}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('TileGrid', () => {
  it('lists its tiles, with a disabled action out of the Tab order and a placeholder count', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(
      <TileGrid
        label='Collections'
        tiles={[
          {
            key: 'post',
            title: 'Posts',
            meta: '2 documents',
            actionLabel: 'New',
            actionAria: 'New Posts document',
            actionDisabled: true,
            onOpen,
          },
          { key: 'page', title: 'Pages', metaLoading: true, onOpen },
        ]}
      />
    );
    const list = screen.getByRole('list', { name: 'Collections' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(
      within(list).getByRole('button', { name: 'New Posts document' })
    ).toBeDisabled();
    expect(list.querySelectorAll('[data-slot=skeleton]')).toHaveLength(1);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Posts' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Pages' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('draws placeholder tiles and says Loading while the tiles load', async () => {
    render(<TileGrid label='Globals' loading={4} tiles={[]} />);
    const list = screen.getByRole('list', { name: 'Globals' });
    expect(list).toHaveAttribute('aria-busy', 'true');
    expect(list.children).toHaveLength(4);
    expect(await screen.findByText('Loading Globals')).toBeInTheDocument();
  });
});
