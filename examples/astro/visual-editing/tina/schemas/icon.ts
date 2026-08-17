import { IconOptions } from '../../src/components/layout/icon.ts';

export const iconSchema = {
  type: 'object',
  label: 'Icon',
  name: 'icon',
  fields: [
    {
      type: 'string',
      label: 'Name',
      name: 'name',
      options: Object.keys(IconOptions).map((key) => ({
        label: key,
        value: key,
      })),
    },
    {
      type: 'string',
      label: 'Color',
      name: 'color',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Teal', value: 'teal' },
        { label: 'Green', value: 'green' },
        { label: 'Red', value: 'red' },
        { label: 'Pink', value: 'pink' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'White', value: 'white' },
      ],
    },
    {
      type: 'string',
      label: 'Style',
      name: 'style',
      options: [
        { label: 'Float', value: 'float' },
        { label: 'Circle', value: 'circle' },
      ],
    },
    {
      type: 'string',
      label: 'Size',
      name: 'size',
      options: [
        { label: 'XS', value: 'xs' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'XL', value: 'xl' },
      ],
    },
  ],
};
