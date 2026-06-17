import type { Collection } from 'tinacms';

const Announcement: Collection = {
  label: 'Announcement Bar',
  name: 'announcement',
  path: 'content/announcement',
  format: 'json',
  ui: {
    global: true,
  },
  fields: [
    {
      type: 'boolean',
      label: 'Enabled',
      name: 'enabled',
    },
    {
      type: 'string',
      label: 'Message',
      name: 'message',
    },
    {
      type: 'string',
      label: 'Link Label',
      name: 'linkLabel',
    },
    {
      type: 'string',
      label: 'Link URL',
      name: 'linkHref',
    },
  ],
};

export default Announcement;
