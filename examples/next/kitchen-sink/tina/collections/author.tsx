import type { Collection } from 'tinacms';
import { dateFieldSchemas } from '../schemas/shared-fields';

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
      // @ts-expect-error -- uploadDir is a valid TinaCMS image field option but not yet in the type definitions
      uploadDir: () => 'authors',
    },
    {
      type: 'string',
      label: 'Description',
      name: 'description',
    },
    ...dateFieldSchemas,
    {
      type: 'string',
      label: 'Hobbies',
      name: 'hobbies',
      list: true,
    },
  ],
};

export default Author;
