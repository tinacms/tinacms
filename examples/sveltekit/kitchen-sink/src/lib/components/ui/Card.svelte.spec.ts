import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Card from './Card.svelte';

// Blocks pass data-tina-field to Card; if it isn't forwarded, click-to-focus silently breaks.
it('forwards extra attributes such as data-tina-field to its element', () => {
  const screen = render(Card, {
    class: 'feature-card',
    'data-tina-field': 'abc---page.blocks.0.items.0',
  });
  const card = screen.container.querySelector('.card');

  expect(card?.getAttribute('data-tina-field')).toBe(
    'abc---page.blocks.0.items.0'
  );
  expect(card?.classList.contains('feature-card')).toBe(true);
});
