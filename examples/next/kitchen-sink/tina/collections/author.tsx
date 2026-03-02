import type { Collection } from 'tinacms';

const Author: Collection = {
  label: 'Authors',
  name: 'author',
  path: 'content/authors',
  format: 'md',
  fields: [
    {
      type: 'string',
      label: 'Name',
      name: 'name',
      isTitle: true,
      required: true,
    },
    {
      type: 'image',
      label: 'Avatar',
      name: 'avatar',
      // @ts-ignore
      uploadDir: () => 'authors',
    },
    {
      type: 'string',
      label: 'Description',
      name: 'description',
    },
    {
      type: 'datetime',
      label: 'Publish Date',
      name: 'pubDate',
    },
    {
      type: 'datetime',
      label: 'Updated Date',
      name: 'updatedDate',
    },
    {
      type: 'string',
      label: 'Hobbies',
      name: 'hobbies',
      list: true,
    },
  ],
};

export default Author;
