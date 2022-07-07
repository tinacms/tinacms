import React from 'react'
import { createPluginFactory } from '@udecode/plate-headless'

export const createCodeBlockPlugin = createPluginFactory({
  key: 'code_block',
  isElement: true,
  isVoid: true,
  isInline: false,
})

export const createHTMLBlockPlugin = createPluginFactory({
  key: 'html',
  isElement: true,
  isVoid: true,
  isInline: false,
  component: () => {
    return <div>Here is some code</div>
  },
})
