import type { Extension } from 'micromark-util-types'
import { codes } from 'micromark-util-symbol/codes'
import { directiveLeaf } from './shortcode-leaf'

export const tinaDirective: () => Extension = function () {
  return {
    // text: { [codes.colon]: directiveText },
    flow: { [codes.leftCurlyBrace]: [directiveLeaf] },
  }
}
