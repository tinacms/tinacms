import React from 'react'
import { createPluginFactory } from '@udecode/plate-headless'
import { onKeyDownSoftBreak } from './on-key-down-soft-break'
import { SoftBreakPlugin } from './types'

export const KEY_SOFT_BREAK = 'break'

/**
 * This code is mostly copied from the plate soft-break plugin
 * [here](https://github.com/udecode/plate/blob/3c0de39a66308a9b718cf9f35623502702ae2af4/packages/editor/break/src/soft-break/index.ts)
 */
export const createSoftBreakPlugin = createPluginFactory<SoftBreakPlugin>({
  key: KEY_SOFT_BREAK,
  isElement: true,
  isInline: true,
  isVoid: true,
  component: (props) => {
    return (
      <>
        <br className={props.className} {...props.attributes} />
        {props.children}
      </>
    )
  },
  handlers: {
    onKeyDown: onKeyDownSoftBreak,
  },
  options: {
    rules: [{ hotkey: 'shift+enter' }],
  },
})
