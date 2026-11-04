import type { ImageFieldViewProps } from './image-field.view';

const swatch = (path: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><title>${path}</title><rect width='100%' height='100%' fill='lightgray'/></svg>`
  )}`;

const base = {
  label: 'Hero',
  labelId: 'hero-label',
  path: null,
  resolveUrl: swatch,
  onChoose: () => {},
  onReplace: () => {},
  onRemove: () => {},
  onDropFile: () => {},
} satisfies ImageFieldViewProps;

const filled = { ...base, path: 'posts/about.png' };

export const imageFieldStates = [
  { name: 'empty', props: base },
  { name: 'filled', props: filled },
  {
    name: 'long file name',
    props: {
      ...filled,
      path: 'posts/a-very-long-file-name-for-the-hero-image-of-the-annual-report-2026-final-v3.png',
    },
  },
  { name: 'required', props: { ...base, required: true, onRemove: undefined } },
  {
    name: 'required and filled',
    props: { ...filled, required: true, onRemove: undefined },
  },
  { name: 'invalid', props: { ...base, errors: ['Hero is required'] } },
  {
    name: 'invalid and filled',
    props: { ...filled, errors: ['Hero must be a media path'] },
  },
  {
    name: 'missing image',
    props: { ...filled, path: 'posts/deleted.png', missing: true },
  },
  { name: 'not a media path', props: { ...base, notAPath: true } },
  {
    name: 'uploads on hold',
    props: {
      ...base,
      holdReason: 'Uploads are paused while the document saves.',
    },
  },
  { name: 'busy', props: { ...base, busy: true } },
  { name: 'busy and filled', props: { ...filled, busy: true } },
  { name: 'no uploads', props: { ...base, onDropFile: undefined } },
  { name: 'disabled', props: { ...filled, disabled: true } },
  { name: 'disabled and empty', props: { ...base, disabled: true } },
  { name: 'read-only', props: { ...filled, readOnly: true } },
  { name: 'read-only and empty', props: { ...base, readOnly: true } },
  { name: 'cover wide empty', props: { ...base, look: 'wide' } },
  { name: 'cover wide', props: { ...filled, look: 'wide' } },
  { name: 'cover tall empty', props: { ...base, look: 'tall' } },
  { name: 'cover tall', props: { ...filled, look: 'tall' } },
] satisfies { name: string; props: ImageFieldViewProps }[];

export type ImageFieldStateName = (typeof imageFieldStates)[number]['name'];

export const imageFieldState = (
  name: ImageFieldStateName
): ImageFieldViewProps => {
  const state = imageFieldStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No image field state named ${name}`);
  return state.props;
};
