import { act, screen } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';

/**
 * Opens the side view of a collection: its documents in the tree, the preview
 * beside it. Choosing a collection row in the tree now opens the full table.
 */
export const openCollectionTree = async (collection: string) => {
  await screen.findByRole('list', { name: 'Collections' });
  act(() => {
    window.location.hash = `#/collections/${collection}?side`;
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await screen.findByRole('list', { name: 'Collections' });
};

/** Back from a document lands on the table. Restore returns to the tree. */
export const returnToTree = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await user.click(screen.getByRole('button', { name: 'Return to navigator' }));
  await user.click(await screen.findByRole('button', { name: 'Restore' }));
};
