import type { Md, Plate } from '../types';

export const textHandler = (content: Md.Text): Plate.TextElement => {
  return {
    type: 'text',
    text: content.value,
  };
};

