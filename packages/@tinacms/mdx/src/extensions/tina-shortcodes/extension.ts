import type { Construct, Extension } from 'micromark-util-types'
import { directiveLeaf, findCode } from './shortcode-leaf'

export type Pattern = { start: string; end: string; name?: string }
export const tinaDirective: (patterns: Pattern[]) => Extension = function (
  patterns
) {
  const rules: Record<number, Construct[]> = {}
  patterns.forEach((pattern) => {
    const firstKey = pattern.start[0]
    if (firstKey) {
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
  })
  return {
    // text: { [codes.colon]: directiveText },
    // flow: { [codes.leftCurlyBrace]: [directive] },
    flow: rules,
  }
}
