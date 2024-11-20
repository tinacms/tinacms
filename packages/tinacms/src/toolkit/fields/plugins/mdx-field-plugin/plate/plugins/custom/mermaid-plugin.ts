import { createPluginFactory } from '@udecode/plate-common'

export const ELEMENT_MERMAID = 'mermaid'

export const createMermaidPlugin = createPluginFactory({
  isElement: true,
  isVoid: true,
  isInline: false,
  key: ELEMENT_MERMAID,
})
