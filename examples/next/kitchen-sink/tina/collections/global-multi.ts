import type { Collection } from 'tinacms';

// ui.global with multiple documents — clicking it falls through to the list
// (so the extras can be removed) instead of redirecting to a single form.
const GlobalMulti: Collection = {
  label: 'Global — multiple documents',
  name: 'globalMulti',
  path: 'content/global-multi',
  format: 'json',
  ui: {
    global: true,
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      label: 'Note',
      name: 'note',
    },
  ],
};

export default GlobalMulti;
