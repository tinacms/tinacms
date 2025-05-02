import { ContextManager } from '../../../utils/mdx-context-manager'
import type { Context, Md, Plate } from '../types'

export const imageHandler = (
  content: Md.Image,
  context: Context
): Plate.ImageElement => {
  const imageCallback = ContextManager.getInstance().getImageCallback()
  return {
    type: 'img',
    // We should think about making this src as `url` is not correct with <img />
    url: imageCallback(content.url),
    alt: content.alt || undefined, // alt cannot be `null`
    caption: content.title,
    children: [{ type: 'text', text: '' }],
  }
}
