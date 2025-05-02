import { flatten } from 'es-toolkit'
import { sanitizeUrl } from '../../../utils/sanitize-url'
import type { Context, Md, Plate } from '../types'
import { phrasingMarkHandler } from './phrasing-mark.handler'

export const linkHandler = (
  content: Md.Link,
  context: Context
): Plate.LinkElement => {
  return {
    type: 'a',
    url: sanitizeUrl(content.url),
    title: content.title,
    children: flatten(
      content.children.map((child) => phrasingMarkHandler(child, context))
    ),
  }
}
