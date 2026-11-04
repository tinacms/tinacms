import type { ImageGalleryViewProps } from './image-gallery.view';
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

const galleryBase = {
  label: 'Gallery',
  labelId: 'gallery-label',
  items: [],
  resolveUrl: swatch,
  onAdd: () => {},
  onReplace: () => {},
  onRemove: () => {},
  onMove: () => {},
} satisfies ImageGalleryViewProps;

const galleryItems = [
  { key: 'a', value: 'posts/about.png' },
  { key: 'b', value: 'posts/team.jpg' },
  { key: 'c', value: 'posts/office.webp' },
  { key: 'd', value: 'posts/launch.png' },
];

export const imageGalleryStates = [
  { name: 'gallery empty', props: galleryBase },
  { name: 'gallery filled', props: { ...galleryBase, items: galleryItems } },
  {
    name: 'gallery long file name',
    props: {
      ...galleryBase,
      items: [
        {
          key: 'a',
          value:
            'posts/a-very-long-file-name-for-the-hero-image-of-the-annual-report-2026-final-v3.png',
        },
      ],
    },
  },
  {
    name: 'gallery required',
    props: { ...galleryBase, required: true },
  },
  {
    name: 'gallery invalid',
    props: {
      ...galleryBase,
      items: galleryItems,
      errors: ['Gallery must be a list of media paths'],
    },
  },
  {
    name: 'gallery missing image',
    props: {
      ...galleryBase,
      items: [
        { key: 'a', value: 'posts/about.png' },
        { key: 'b', value: 'posts/deleted.png', missing: true },
      ],
    },
  },
  {
    name: 'gallery unreadable items',
    props: {
      ...galleryBase,
      items: [
        { key: 'a', value: 'posts/about.png' },
        { key: 'b', value: 2024 },
        { key: 'c', value: null },
      ],
    },
  },
  {
    name: 'gallery same image twice',
    props: {
      ...galleryBase,
      items: [
        { key: 'a', value: 'posts/about.png' },
        { key: 'b', value: 'posts/about.png' },
      ],
    },
  },
  {
    name: 'gallery disabled',
    props: { ...galleryBase, items: galleryItems, disabled: true },
  },
  {
    name: 'gallery read-only',
    props: { ...galleryBase, items: galleryItems, readOnly: true },
  },
  {
    name: 'gallery read-only and empty',
    props: { ...galleryBase, readOnly: true },
  },
] satisfies { name: string; props: ImageGalleryViewProps }[];

export type ImageGalleryStateName = (typeof imageGalleryStates)[number]['name'];

export const imageGalleryState = (
  name: ImageGalleryStateName
): ImageGalleryViewProps => {
  const state = imageGalleryStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No image gallery state named ${name}`);
  return state.props;
};
