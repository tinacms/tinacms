import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/** Opens a Blocks field's picker and returns its panel. Pass the list to pick one of several. */
export async function openBlockPicker(
  list?: HTMLElement
): Promise<HTMLElement> {
  const scope = list ? within(list) : screen;
  await userEvent.click(
    await scope.findByRole('button', { name: 'Add a block' })
  );
  return screen.findByRole('dialog', { name: 'Choose a block' });
}
