import { Md, Plate } from '../types'

export const html_inline = (content: Md.HTML): Plate.HTMLInlineElement => {
  return {
    type: 'html_inline',
    value: content.value,
    children: [{ type: 'text', text: '' }],
  }
}
