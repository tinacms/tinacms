import { createPlatePlugin } from '@udecode/plate/react';

/**
 * Leaf mark for coloured text. The mark's value is the CSS colour itself
 * (`{ text, textColor: '#DC2626' }`) — there is no separate boolean flag.
 */
export const TextColorPlugin = createPlatePlugin({
  key: 'textColor',
  node: { isLeaf: true },
});
