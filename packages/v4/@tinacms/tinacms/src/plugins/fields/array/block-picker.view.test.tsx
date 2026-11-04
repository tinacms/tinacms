import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BlockAddView,
  type BlockOption,
  InlineBlockPicker,
} from './block-picker.view';

const options: BlockOption[] = ['Hero', 'Quote', 'Call to action'].map(
  (label) => ({ name: label.toLowerCase(), label })
);

afterEach(() => vi.restoreAllMocks());

describe('Block picker panel placement and size', () => {
  it('opens above the button when there is no room below it', async () => {
    vi.stubGlobal('innerHeight', 800);
    render(<BlockAddView options={options} look='list' onPick={() => {}} />);
    const trigger = screen.getByRole('button', { name: 'Add a block' });
    trigger.style.setProperty('--picker-max-height', '320px');
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 700,
      bottom: 740,
    } as DOMRect);
    await userEvent.click(trigger);
    const panel = await screen.findByRole('dialog', { name: 'Choose a block' });
    expect(panel).toHaveAttribute('data-side', 'top');
    vi.unstubAllGlobals();
  });

  it('opens below the button when there is room', async () => {
    vi.stubGlobal('innerHeight', 800);
    render(<BlockAddView options={options} look='list' onPick={() => {}} />);
    const trigger = screen.getByRole('button', { name: 'Add a block' });
    trigger.style.setProperty('--picker-max-height', '320px');
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
    } as DOMRect);
    await userEvent.click(trigger);
    const panel = await screen.findByRole('dialog', { name: 'Choose a block' });
    expect(panel).toHaveAttribute('data-side', 'bottom');
    vi.unstubAllGlobals();
  });

  it('moves the open panel above the button when the viewport shrinks', async () => {
    vi.stubGlobal('innerHeight', 800);
    render(<BlockAddView options={options} look='list' onPick={() => {}} />);
    const trigger = screen.getByRole('button', { name: 'Add a block' });
    trigger.style.setProperty('--picker-max-height', '320px');
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      bottom: 340,
    } as DOMRect);
    await userEvent.click(trigger);
    const panel = await screen.findByRole('dialog', { name: 'Choose a block' });
    expect(panel).toHaveAttribute('data-side', 'bottom');
    vi.stubGlobal('innerHeight', 450);
    fireEvent(window, new Event('resize'));
    await waitFor(() => expect(panel).toHaveAttribute('data-side', 'top'));
    vi.unstubAllGlobals();
  });

  it('keeps the floating panel at its opened height while a search narrows the list, and the inline list does not', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
    render(<BlockAddView options={options} look='list' onPick={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add a block' }));
    const panel = await screen.findByRole('dialog', { name: 'Choose a block' });
    const results = () =>
      panel.querySelector<HTMLElement>('[data-slot=block-picker-results]');
    expect(results()?.style.minHeight).toBe('');
    await userEvent.type(
      within(panel).getByRole('searchbox', { name: 'Search blocks' }),
      'q'
    );
    expect(results()?.style.minHeight).not.toBe('');
  });

  it('lets the inline list shrink while a search narrows it', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
    render(
      <InlineBlockPicker
        options={options}
        look='list'
        onPick={() => {}}
        onCancel={() => {}}
      />
    );
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search blocks' }),
      'q'
    );
    const results = document.querySelector<HTMLElement>(
      '[data-slot=block-picker-results]'
    );
    expect(results?.style.minHeight).toBe('');
  });
});
