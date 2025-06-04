import React from 'react';
import { onKeyDownSoftBreak } from './on-key-down-soft-break';
import type { SoftBreakPlugin } from './types';
import { createTPlatePlugin } from '@udecode/plate/react';

export const KEY_SOFT_BREAK = 'break';

/**
 * This code is mostly copied from the plate soft-break plugin
 * [here](https://github.com/udecode/plate/blob/3c0de39a66308a9b718cf9f35623502702ae2af4/packages/editor/break/src/soft-break/index.ts)
 */
// TODO [2025-05-28]: Potentially unused. Searched usage but found none.
// Consider removing after verifying with the team
export const createSoftBreakPlugin = createTPlatePlugin({
  key: KEY_SOFT_BREAK,
  options: {
    isElement: true,
    isVoid: true,
    isInline: false,
    rules: [{ hotkey: 'shift+enter' }],
  },
  //   component: (props) => {
  //     return (
  //       <>
  //         <br className={props.className} {...props.attributes} />
  //         {props.children}
  //       </>
  //     );
  //   },
  //   handlers: {
  //     onKeyDown: onKeyDownSoftBreak,
  //   },
});
