import type { Construct, Extension } from 'micromark-util-types'
import { directiveLeaf, findCode } from './shortcode-leaf'
import type { Pattern } from '../../stringify'

export const tinaDirective: (patterns: Pattern[]) => Extension = function (
  patterns
) {
  const rules: Record<number, Construct[]> = {}
  patterns.forEach((pattern) => {
    const firstKey = pattern.start[0]
    if (firstKey) {
      if (pattern.type === 'leaf') {
        const code = findCode(firstKey)
        if (code) {
          const directive = directiveLeaf(pattern)
          if (rules[code]) {
            rules[code] = [...(rules[code] || []), directive]
          } else {
            rules[code] = [directive]
          }
        }
      }
    }
  })
  return {
    // text: { [codes.colon]: directiveText },
    // flow: { [codes.leftCurlyBrace]: [directive] },
    flow: rules,
  }
}
