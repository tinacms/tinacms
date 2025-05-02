import { factoryTag } from './factory-tag'
import type { Construct, Tokenizer } from 'micromark-util-types'
import type { Acorn, AcornOptions } from 'micromark-factory-mdx-expression'

export const jsxText: (
  acorn: Acorn | undefined,
  acornOptions: AcornOptions | undefined,
  addResult: boolean | undefined,
  pattern: any
) => Construct = function (acorn, acornOptions, addResult, pattern) {
  const tokenizeJsxText: Tokenizer = function (effects, ok, nok) {
    // eslint-disable-next-line
    const self = this
    return factoryTag.call(
      self,
      effects,
      ok,
      nok,
      acorn,
      acornOptions,
      addResult,
      true,
      'mdxJsxTextTag',
      'mdxJsxTextTagMarker',
      'mdxJsxTextTagClosingMarker',
      'mdxJsxTextTagSelfClosingMarker',
      'mdxJsxTextTagName',
      'mdxJsxTextTagNamePrimary',
      'mdxJsxTextTagNameMemberMarker',
      'mdxJsxTextTagNameMember',
      'mdxJsxTextTagNamePrefixMarker',
      'mdxJsxTextTagNameLocal',
      'mdxJsxTextTagExpressionAttribute',
      'mdxJsxTextTagExpressionAttributeMarker',
      'mdxJsxTextTagExpressionAttributeValue',
      'mdxJsxTextTagAttribute',
      'mdxJsxTextTagAttributeName',
      'mdxJsxTextTagAttributeNamePrimary',
      'mdxJsxTextTagAttributeNamePrefixMarker',
      'mdxJsxTextTagAttributeNameLocal',
      'mdxJsxTextTagAttributeInitializerMarker',
      'mdxJsxTextTagAttributeValueLiteral',
      'mdxJsxTextTagAttributeValueLiteralMarker',
      'mdxJsxTextTagAttributeValueLiteralValue',
      'mdxJsxTextTagAttributeValueExpression',
      'mdxJsxTextTagAttributeValueExpressionMarker',
      'mdxJsxTextTagAttributeValueExpressionValue',
      pattern
    )
  }
  return { tokenize: tokenizeJsxText }
}
