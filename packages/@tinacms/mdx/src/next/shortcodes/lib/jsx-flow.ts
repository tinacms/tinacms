import { factorySpace } from 'micromark-factory-space'
import { markdownLineEndingOrSpace } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes.js'
import { types } from 'micromark-util-symbol/types.js'
import { factoryTag } from './factory-tag'
import type { Construct, Tokenizer, State } from 'micromark-util-types'
import type { Acorn, AcornOptions } from 'micromark-factory-mdx-expression'
import { findCode } from './util'

export const jsxFlow: (
  acorn: Acorn | undefined,
  acornOptions: AcornOptions | undefined,
  addResult: boolean | undefined,
  pattern: any
) => Construct = function (acorn, acornOptions, addResult, pattern) {
  const tokenizeJsxFlow: Tokenizer = function (effects, ok, nok) {
    // eslint-disable-next-line
    const self = this

    const start: State = function (code) {
      return factoryTag.call(
        self,
        effects,
        factorySpace(effects, after, types.whitespace),
        nok,
        acorn,
        acornOptions,
        addResult,
        false,
        'mdxJsxFlowTag',
        'mdxJsxFlowTagMarker',
        'mdxJsxFlowTagClosingMarker',
        'mdxJsxFlowTagSelfClosingMarker',
        'mdxJsxFlowTagName',
        'mdxJsxFlowTagNamePrimary',
        'mdxJsxFlowTagNameMemberMarker',
        'mdxJsxFlowTagNameMember',
        'mdxJsxFlowTagNamePrefixMarker',
        'mdxJsxFlowTagNameLocal',
        'mdxJsxFlowTagExpressionAttribute',
        'mdxJsxFlowTagExpressionAttributeMarker',
        'mdxJsxFlowTagExpressionAttributeValue',
        'mdxJsxFlowTagAttribute',
        'mdxJsxFlowTagAttributeName',
        'mdxJsxFlowTagAttributeNamePrimary',
        'mdxJsxFlowTagAttributeNamePrefixMarker',
        'mdxJsxFlowTagAttributeNameLocal',
        'mdxJsxFlowTagAttributeInitializerMarker',
        'mdxJsxFlowTagAttributeValueLiteral',
        'mdxJsxFlowTagAttributeValueLiteralMarker',
        'mdxJsxFlowTagAttributeValueLiteralValue',
        'mdxJsxFlowTagAttributeValueExpression',
        'mdxJsxFlowTagAttributeValueExpressionMarker',
        'mdxJsxFlowTagAttributeValueExpressionValue',
        pattern
      )(code)
    }

    const after: State = function (code) {
      const character = findCode(pattern.start[0])
      if (code === character) {
        return start(code)
      }
      if (code === codes.eof) {
        return ok(code)
      }
      if (markdownLineEndingOrSpace(code)) {
        return ok(code)
      }
      return nok(code)
    }

    return start
  }
  return {
    tokenize: tokenizeJsxFlow,
    concrete: true,
  }
}
