import type { Collection } from 'tinacms';
import { ColorPickerInput } from '../fields/color';

const Global: Collection = {
  label: 'Global',
  name: 'global',
  path: 'content/global',
  format: 'json',
  ui: {
    global: true,
  },
  fields: [
    {
      type: 'object',
      label: 'Header',
      name: 'header',
      fields: [
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
        {
          type: 'string',
          label: 'Color',
          name: 'color',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary', value: 'primary' },
          ],
        },
        {
          type: 'object',
          label: 'Nav Links',
          name: 'nav',
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.label };
            },
            defaultItem: {
              href: 'home',
              label: 'Home',
            },
          },
          fields: [
            {
              type: 'string',
              label: 'Link',
              name: 'href',
            },
            {
              type: 'string',
              label: 'Label',
              name: 'label',
            },
          ],
        },
      ],
    },
    {
      type: 'object',
      label: 'Footer',
      name: 'footer',
      fields: [
        {
          type: 'object',
          label: 'Social Links',
          name: 'social',
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.url || 'Social Link' };
            },
          },
          fields: [
            {
              type: 'string',
              label: 'Icon',
              name: 'icon',
            },
            {
              type: 'string',
              label: 'Url',
              name: 'url',
            },
          ],
        },
      ],
    },
    {
      type: 'object',
      label: 'Theme',
      name: 'theme',
      // @ts-ignore
      fields: [
        {
          type: 'string',
          label: 'Primary Color',
          name: 'color',
          ui: {
            component: ColorPickerInput,
          },
        },
        {
          type: 'string',
          name: 'font',
          label: 'Font Family',
          options: [
            { label: 'System Sans', value: 'sans' },
            { label: 'Nunito', value: 'nunito' },
            { label: 'Lato', value: 'lato' },
          ],
        },
        {
          type: 'string',
          name: 'darkMode',
          label: 'Dark Mode',
          options: [
            { label: 'System', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ],
        },
      ],
    },
  ],
};

export default Global;
