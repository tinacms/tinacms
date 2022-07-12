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
})

export const createHTMLInlinePlugin = createPluginFactory({
  key: 'html_inline',
  isElement: true,
  isVoid: true,
  isInline: true,
})
