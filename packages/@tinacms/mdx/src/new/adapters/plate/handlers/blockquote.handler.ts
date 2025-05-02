import type { Context, Md, Plate } from '../types'
import { unwrapBlockContent } from './unwrap-block-content.handler'

export const handleBlockquote = (
  content: Md.Blockquote,
  context: Context
): Plate.BlockquoteElement => {
  const children: Plate.InlineElement[] = []
  content.children.forEach((child) => {
    const inlineElements = unwrapBlockContent(child, context)
    inlineElements.forEach((inlineChild) => children.push(inlineChild))
  })

  return {
    type: 'blockquote',
    children,
  }
}
