import React from 'react'
import { createPluginFactory } from '@udecode/plate-core'

export const createCodeBlockPlugin = createPluginFactory({
  key: 'code_block',
  isElement: true,
  isVoid: true,
  isInline: false,
  component: (props) => {
    console.log('code_block', props)
    return <div>Here is some code</div>
  },
  // handlers: {
  //   onKeyDown: onKeyDownToggleElement,
  // },
  // options: {
  //   hotkey: ['mod+opt+0', 'mod+shift+0'],
  // },
})

export const createHTMLBlockPlugin = createPluginFactory({
  key: 'html',
  isElement: true,
  isVoid: true,
  isInline: false,
  component: (props) => {
    console.log('html', props)
    return <div>Here is some code</div>
  },
  // handlers: {
  //   onKeyDown: onKeyDownToggleElement,
  // },
  // options: {
  //   hotkey: ['mod+opt+0', 'mod+shift+0'],
  // },
})
