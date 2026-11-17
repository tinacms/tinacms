import { act, screen, within } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';

/** The tree in the Navigator pane. The Home screen beside it has its own Collections list. */
export const findCollectionTree = async () =>
  within(
    await screen.findByRole('complementary', { name: 'Navigator' })
  ).findByRole('list', { name: 'Collections' });

/** Opens a collection in the minimised tree, with its documents under it. */
export const openCollectionTree = async (collection: string) => {
  act(() => {
    window.location.hash = `#/collections/${collection}`;
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await findCollectionTree();
};

/** Back from a document lands on the maximised table. Restore returns to the tree. */
export const returnToTree = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await user.click(screen.getByRole('button', { name: 'Return to navigator' }));
  await user.click(await screen.findByRole('button', { name: 'Restore' }));
};
