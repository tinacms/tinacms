// The three ways to save from the editorial-workflow modal.
export type SaveChoice = 'draft' | 'review' | 'publish';

// Persisted "last used" save choice. Global (one editor, one preference).
export const SAVE_CHOICE_KEY = 'tina.editorialWorkflow.saveChoice';

// Stable display order for the options.
export const SAVE_CHOICE_ORDER: SaveChoice[] = ['draft', 'review', 'publish'];

export const resolveSaveOptions = (
  lastChoice: SaveChoice,
  disablePublish: boolean
): { main: SaveChoice; menu: SaveChoice[] } => {
  const main =
    lastChoice === 'publish' && disablePublish ? 'draft' : lastChoice;
  const menu = SAVE_CHOICE_ORDER.filter((choice) => choice !== main);
  return { main, menu };
};
