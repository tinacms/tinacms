import { createPlatePlugin } from '@udecode/plate/react';

//TODO: Test this
export const createCodeBlockPlugin = createPlatePlugin({
  key: 'code_block',
  options: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
});

//TODO: Test this
export const createHTMLBlockPlugin = createPlatePlugin({
  key: 'html',
  options: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
});

//TODO: Test this
export const createHTMLInlinePlugin = createPlatePlugin({
  key: 'html_inline',
  options: {
    isElement: true,
    isVoid: true,
    isInline: true,
  },
});
