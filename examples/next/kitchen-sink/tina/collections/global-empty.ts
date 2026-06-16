import type { Collection } from 'tinacms';

// ui.global with no document yet — clicking it falls through to the (empty)
// list with a create action instead of redirecting.
const GlobalEmpty: Collection = {
  label: 'Global — no document',
  name: 'globalEmpty',
  path: 'content/global-empty',
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

export default GlobalEmpty;
