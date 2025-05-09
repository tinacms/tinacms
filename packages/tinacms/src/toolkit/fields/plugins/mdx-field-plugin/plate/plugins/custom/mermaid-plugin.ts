import { createPlatePlugin } from '@udecode/plate/react';

export const ELEMENT_MERMAID = 'mermaid';

export const createMermaidPlugin = createPlatePlugin({
  node: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
  key: ELEMENT_MERMAID,
});
