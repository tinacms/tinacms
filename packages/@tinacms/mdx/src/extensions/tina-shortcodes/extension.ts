import type { Extension } from 'micromark-util-types'
import { codes } from 'micromark-util-symbol/codes'
import { directiveLeaf, findCode } from './shortcode-leaf'

export type Pattern = { start: string; end: string; name?: string }
export const tinaDirective: (patterns: Pattern[]) => Extension = function (
  patterns
) {
  let rules = {}
  patterns.forEach((pattern) => {
    const firstKey = pattern.start[0]
    const code = findCode(firstKey)
    const directive = directiveLeaf(pattern)
    if (rules[code]) {
      rules[code].push(directive)
    } else {
      rules[code] = [directive]
    }
  })
  return {
    // text: { [codes.colon]: directiveText },
    // flow: { [codes.leftCurlyBrace]: [directive] },
    flow: rules,
  }
}
