export const CHOOSE_ONE_TITLE = 'Choose an image';
export const CHOOSE_MANY_TITLE = 'Choose images';

export const forLine = (label: string, parentLabel?: string): string =>
  parentLabel ? `For ${label} in ${parentLabel}` : `For ${label}`;

export const CLOSE_PICKER = 'Close picker';
export const MAXIMISE_PICKER = 'Maximise';
export const SEARCH_LABEL = 'Search this folder';
export const SEARCH_PLACEHOLDER = 'Search this folder...';
export const CLEAR_PICKS = 'Clear picks';
export const CANCEL = 'Cancel';
export const UPLOAD = 'Upload';
export const ALREADY_ADDED = 'Already added';
export const CHOOSING_NOTE = 'Choosing in the picker';

export const pickedWords = (count: number): string => `${count} picked`;

export const confirmWords = (
  mode: 'single' | 'multiple',
  count: number
): string => {
  if (mode === 'single') return 'Choose image';
  return count > 1 ? `Add ${count} images` : 'Add image';
};

export const folderNameOf = (folder: string): string =>
  folder === '' ? 'Media' : (folder.split('/').at(-1) ?? folder);

export const loadingWords = (folder: string): string =>
  `Loading ${folderNameOf(folder)}`;

export const emptyWords = (folder: string): string =>
  `No images in ${folderNameOf(folder)} yet.`;

export const noHitsWords = (folder: string, query: string): string =>
  `No images in ${folderNameOf(folder)} match “${query}”.`;

export const CLEAR_SEARCH = 'Clear search';
export const DROP_OR = 'Drop images here, or';
export const LOAD_FAILED =
  'Couldn’t load Media. Check your connection, then retry.';
export const RETRY = 'Retry';

export const resultWords = (count: number): string =>
  `${count} ${count === 1 ? 'image' : 'images'}`;

export const missingCardWords = (folder: string): string =>
  `No longer in Media; it was here, in ${folderNameOf(folder)}. If it was renamed, choose its new copy below.`;

export const pickedTileLabel = (
  name: string,
  state: { number: number | null; added: boolean; many: boolean }
): string => {
  if (state.added) return `${name}, ${ALREADY_ADDED}`;
  if (state.number === null) return name;
  return state.many
    ? `${name}, selected, number ${state.number}`
    : `${name}, selected`;
};
