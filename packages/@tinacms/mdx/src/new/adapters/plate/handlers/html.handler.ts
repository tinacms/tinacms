import type { Md, Plate } from '../types'

export const handleHtml = (content: Md.HTML): Plate.HTMLElement => {
  return {
    type: 'html',
    value: content.value,
    children: [{ type: 'text', text: '' }],
  }
}
