import { BaseExample } from './templates';

type TINADOCS_THEME = {
  title: string;
  value: string;
  description: string;
};

export const THEMES: TINADOCS_THEME[] = [
  {
    title: 'Default',
    description: 'The default monochromatic theme for your documentation site',
    value: 'default',
  },
  {
    title: 'Tina',
    description: 'The warm color scheme of TinaCMS for your documentation',
    value: 'tina',
  },
  {
    title: 'Blossom',
    value: 'blossom',
    description: 'A Blossom theme for your project',
  },
  {
    title: 'Lake',
    value: 'lake',
    description: 'A Lake theme for your project',
  },
  {
    title: 'Pine',
    value: 'pine',
    description: 'A Pine theme for your project',
  },
  {
    title: 'Indigo',
    value: 'indigo',
    description: 'An Indigo theme for your project',
  },
];
