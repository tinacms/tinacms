// The three ways to save from the editorial-workflow modal.
export type SaveChoice = 'draft' | 'review' | 'publish';

// Persisted "last used" save choice. Global (one editor, one preference).
export const SAVE_CHOICE_KEY = 'tina.editorialWorkflow.saveChoice';

// Stable display order for the options.
export const SAVE_CHOICE_ORDER: SaveChoice[] = ['draft', 'review', 'publish'];

/**
 * Resolves the split button layout from the remembered choice.
 *
 * - `main` is the remembered choice (defaults to `draft`), used as the primary
 *   button. If the remembered choice is `publish` but publishing is disabled
 *   (protected branch), it falls back to `draft` so the primary action is
 *   always something the editor can actually do.
 * - `menu` is every other option, in stable order. `publish` stays in the menu
 *   even when disabled so it can render greyed out with an explanatory tooltip.
 */
export const resolveSaveOptions = (
  lastChoice: SaveChoice,
  disablePublish: boolean
): { main: SaveChoice; menu: SaveChoice[] } => {
  const main =
    lastChoice === 'publish' && disablePublish ? 'draft' : lastChoice;
  const menu = SAVE_CHOICE_ORDER.filter((choice) => choice !== main);
  return { main, menu };
};
