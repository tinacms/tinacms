import type { Context, Md, Plate } from '../types'

export const handleCode = (
  content: Md.Code,
  context: Context
): Plate.CodeBlockElement | Plate.MermaidElement => {
  if (content.lang === 'mermaid') {
    return mermaid(content)
  }
  return code(content)
}

const mermaid = (content: Md.Code): Plate.MermaidElement => {
  return {
    type: 'mermaid',
    value: content.value,
    children: [{ type: 'text', text: '' }],
  }
}

const code = (content: Md.Code): Plate.CodeBlockElement => {
  const extra: Record<string, string> = {}
  if (content.lang) extra['lang'] = content.lang
  return {
    type: 'code_block',
    ...extra,
    value: content.value,
    children: [{ type: 'text', text: '' }],
  }
}
