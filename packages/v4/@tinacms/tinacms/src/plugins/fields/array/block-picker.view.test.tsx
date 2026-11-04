import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  type BlockLook,
  BlockAddView,
  type BlockOption,
} from './block-picker.view';

const LONG = 'Template number one with a very long name';
const options: BlockOption[] = Array.from({ length: 9 }, (_, index) => ({
  name: `t${index}`,
  label: `${LONG} ${index + 1}`,
  preview: <span data-preview=''>preview</span>,
}));

async function openPanel(look: BlockLook) {
  render(<BlockAddView options={options} look={look} onPick={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: 'Add a block' }));
  return screen.findByRole('dialog', { name: 'Choose a block' });
}

describe('Block picker layout', () => {
  it.each(['list', 'grid'] as const)(
    'wraps a long template name instead of cutting it in the %s look',
    async (look) => {
      const panel = await openPanel(look);
      const label = within(panel).getByText(`${LONG} 1`);
      expect(label).not.toHaveClass('truncate');
      expect(label).toHaveClass('wrap-break-word');
    }
  );

  it('gives the panel a height limit and scrolls only the results, so the search box stays put', async () => {
    const panel = await openPanel('list');
    expect(panel.style.maxHeight).toContain('var(--available-height)');
    const search = within(panel).getByRole('searchbox', {
      name: 'Search blocks',
    });
    const results = within(panel)
      .getByRole('button', { name: `Add ${LONG} 1` })
      .closest('.overflow-y-auto');
    expect(results).toHaveClass('overflow-y-auto');
    expect(results?.contains(search)).toBe(false);
  });
});
