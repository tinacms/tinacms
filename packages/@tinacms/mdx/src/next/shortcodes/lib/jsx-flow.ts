import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes.js'
import { types } from 'micromark-util-symbol/types.js'
import { factoryTag } from './factory-tag'
import type { Construct, Tokenizer, State } from 'micromark-util-types'
import type { Acorn, AcornOptions } from 'micromark-factory-mdx-expression'

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
      return code === codes.lessThan
        ? start(code)
        : code === codes.eof || markdownLineEnding(code)
        ? ok(code)
        : nok(code)
    }

    return start
  }
  return { tokenize: tokenizeJsxFlow, concrete: true }
}
