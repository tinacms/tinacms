import { readFileSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PreviewFrame } from '@tinacms/ui/components/preview-frame';
import { PreviewToolbar } from '@tinacms/ui/components/preview-toolbar';

describe('PreviewToolbar tiers', () => {
  it('desktop: device sizes show as pressed buttons, with Preview actions and Expand', () => {
    render(
      <PreviewToolbar
        address='localhost:3000/'
        width='desktop'
        device='tablet'
      />
    );
    const devices = screen.getByRole('group', { name: 'Device size' });
    expect(
      within(devices).getByRole('button', { name: /^Tablet/ })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(devices).getByRole('button', { name: /^Fit/ })
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('button', { name: 'Preview actions' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Expand preview' })
    ).toBeInTheDocument();
  });

  it('desktop at Fit shows the drawn width, and at Tablet the scale', () => {
    const { rerender } = render(
      <PreviewToolbar address='a' width='desktop' fitWidth={1040} />
    );
    expect(screen.getByText('1040px')).toBeInTheDocument();
    rerender(
      <PreviewToolbar
        address='a'
        width='desktop'
        device='tablet'
        fitScale={85}
      />
    );
    expect(
      screen.getByRole('button', { name: '768px, scale 85%' })
    ).toHaveTextContent('768px · 85%');
  });

  it('tablet: the device sizes move into Preview actions above Reload', async () => {
    const onDeviceChange = vi.fn();
    render(
      <PreviewToolbar
        address='a'
        width='tablet'
        device='phone'
        onDeviceChange={onDeviceChange}
      />
    );
    expect(screen.queryByRole('group', { name: 'Device size' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Expand preview' })
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Preview actions' })
    );
    const rows = screen
      .getAllByRole('menuitemcheckbox')
      .map((row) => row.textContent);
    expect(rows[0]).toMatch(/^Fit/);
    expect(
      screen.getByRole('menuitemcheckbox', { name: /^Phone/ })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitem', { name: 'Reload' })
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('menuitemcheckbox', { name: /^Tablet/ })
    );
    expect(onDeviceChange).toHaveBeenCalledWith('tablet');
  });

  it('phone: the address and Preview actions only', () => {
    render(<PreviewToolbar address='a' width='phone' />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(
      screen.getByRole('textbox', { name: 'Page address' })
    ).toBeInTheDocument();
  });

  it('Enter sends the typed text, and an error is tied to the box', async () => {
    const onNavigate = vi.fn();
    render(
      <PreviewToolbar
        address='localhost:3000/'
        width='desktop'
        onNavigate={onNavigate}
        addressError='Type an address on localhost:3000'
      />
    );
    const box = screen.getByRole('textbox', { name: 'Page address' });
    expect(box).toHaveAccessibleDescription(
      'Type an address on localhost:3000'
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.clear(box);
    await userEvent.type(box, '/posts{Enter}');
    expect(onNavigate).toHaveBeenCalledWith('/posts');
  });

  it('keeps what the editor is typing when a new address arrives, until blur', async () => {
    const { rerender } = render(
      <PreviewToolbar address='one' width='desktop' />
    );
    const box = screen.getByRole('textbox', { name: 'Page address' });
    await userEvent.type(box, 'x');
    rerender(<PreviewToolbar address='two' width='desktop' />);
    expect(box).toHaveValue('onex');
    await userEvent.tab();
    expect(box).toHaveValue('two');
    rerender(<PreviewToolbar address='three' width='desktop' />);
    expect(box).toHaveValue('three');
  });
});

describe('PreviewFrame conditions', () => {
  it('loading hides the page, shows the words once as a status', async () => {
    render(
      <PreviewFrame condition='loading'>
        <iframe title='Page' />
      </PreviewFrame>
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Loading the page'
    );
    expect(document.querySelector('[data-slot=preview-page]')).toHaveClass(
      'invisible'
    );
  });

  it('reloading keeps the page showing under a scrim', async () => {
    render(
      <PreviewFrame condition='reloading'>
        <iframe title='Page' />
      </PreviewFrame>
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Reloading the page'
    );
    expect(document.querySelector('[data-slot=preview-page]')).not.toHaveClass(
      'invisible'
    );
  });

  it('failed shows the note with a Reload', async () => {
    const onReload = vi.fn();
    render(<PreviewFrame condition='failed' onReload={onReload} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'The page didn’t load'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(onReload).toHaveBeenCalledOnce();
  });

  it('no-preview shows the note with How previews are set up', async () => {
    const onHowTo = vi.fn();
    render(<PreviewFrame condition='no-preview' onHowTo={onHowTo} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'How previews are set up' })
    );
    expect(onHowTo).toHaveBeenCalledOnce();
  });

  it('keeps one page element across devices', () => {
    const { rerender } = render(
      <PreviewFrame device='fit'>
        <iframe title='Page' />
      </PreviewFrame>
    );
    const node = screen.getByTitle('Page');
    rerender(
      <PreviewFrame device='tablet' condition='loading'>
        <iframe title='Page' />
      </PreviewFrame>
    );
    expect(screen.getByTitle('Page')).toBe(node);
  });

  it.each(['tablet', 'phone'] as const)(
    '%s: the page edge colour differs from the ground',
    (device) => {
      render(
        <PreviewFrame device={device}>
          <iframe title='Page' />
        </PreviewFrame>
      );
      const page = screen
        .getByTitle('Page')
        .closest('[data-slot="preview-page"]');
      expect(page).toHaveClass('ring-pv-edge');

      const tokens = readFileSync('src/styles/tokens.css', 'utf8');
      const channels = (name: string) => {
        const hex = tokens.match(new RegExp(`${name}: (#[0-9a-f]{6})`))?.[1];
        if (!hex) throw new Error(`${name} is not a hex colour`);
        return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
      };
      const ground = [0xe2, 0xe8, 0xf0];
      expect(tokens).toContain('--pv-ground: var(--slate-200)');
      const edge = channels('--pv-edge');
      const distance = Math.max(...edge.map((c, i) => Math.abs(c - ground[i])));
      expect(distance).toBeGreaterThanOrEqual(60);
    }
  );
});
