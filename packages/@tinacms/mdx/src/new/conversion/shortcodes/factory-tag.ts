import { ok as assert } from 'uvu/assert'
import {
  start as idStart,
  cont as idCont,
} from 'estree-util-is-identifier-name'
import { factoryMdxExpression } from 'micromark-factory-mdx-expression'
import { factorySpace } from 'micromark-factory-space'
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
  unicodeWhitespace,
} from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes.js'
import { constants } from 'micromark-util-symbol/constants.js'
import { types } from 'micromark-util-symbol/types.js'
import { VFileMessage } from 'vfile-message'
import { findCode } from './util'
import type {
  Tokenizer,
  TokenizeContext,
  Effects,
  Code,
  Point,
  State,
} from 'micromark-util-types'
import type { Acorn, AcornOptions } from 'micromark-factory-mdx-expression'
import { Pattern } from './syntax'

export function factoryTag(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
  acorn: Acorn | undefined,
  acornOptions: AcornOptions | undefined,
  addResult: boolean | undefined,
  allowLazy: boolean | undefined,
  tagType: string,
  tagMarkerType: string,
  tagClosingMarkerType: string,
  tagSelfClosingMarker: string,
  tagNameType: string,
  tagNamePrimaryType: string,
  tagNameMemberMarkerType: string,
  tagNameMemberType: string,
  tagNamePrefixMarkerType: string,
  tagNameLocalType: string,
  tagExpressionAttributeType: string,
  tagExpressionAttributeMarkerType: string,
  tagExpressionAttributeValueType: string,
  tagAttributeType: string,
  tagAttributeNameType: string,
  tagAttributeNamePrimaryType: string,
  tagAttributeNamePrefixMarkerType: string,
  tagAttributeNameLocalType: string,
  tagAttributeInitializerMarkerType: string,
  tagAttributeValueLiteralType: string,
  tagAttributeValueLiteralMarkerType: string,
  tagAttributeValueLiteralValueType: string,
  tagAttributeValueExpressionType: string,
  tagAttributeValueExpressionMarkerType: string,
  tagAttributeValueExpressionValueType: string,
  pattern: Pattern
) {
  // eslint-disable-next-line
  const self = this
  let returnState: State
  let marker: NonNullable<Code> | undefined
  let startPoint: Point | undefined
  // Start at because the first character is consumed right away
  let tagOpenerIndex = 1
  let tagCloserIndex = 1
  let nameIndex = 1

  const start: State = function (code) {
    startPoint = self.now()
    effects.enter(tagType)
    effects.enter(tagMarkerType)
    effects.consume(code)
    if (pattern.start.length === 1) {
      effects.exit(tagMarkerType)
      return afterStart
    }
    return tagOpenerSequence
  }

  const tagOpenerSequence: State = function (code) {
    const character = findCode(pattern.start[tagOpenerIndex])
    if (code === character) {
      effects.consume(code)
      if (pattern.start.length - 1 === tagOpenerIndex) {
        effects.exit(tagMarkerType)
        return afterStart
      }
      tagOpenerIndex++
      return tagOpenerSequence
    }
    return nok
  }

  const afterStart: State = function (code) {
    /**
     * Orinal MDX factory-tag disallows this because `<` is ambiguous, but shortcodes
     * may or may not be using that character so allow space after start
     */
    // Deviate from JSX, which allows arbitrary whitespace.
    // See: <https://github.com/micromark/micromark-extension-mdx-jsx/issues/7>.
    // if (markdownLineEnding(code) || markdownSpace(code)) {
    //   return nok(code)
    // }

    // Any other ES whitespace does not get this treatment.
    returnState = beforeName
    return optionalEsWhitespace(code)
  }

  // Right after `<`, before an optional name.
  const beforeName: State = function (code) {
    // Closing tag.
    if (code === codes.slash) {
      effects.enter(tagClosingMarkerType)
      effects.consume(code)
      effects.exit(tagClosingMarkerType)
      returnState = beforeClosingTagName
      return optionalEsWhitespace
    }

    // Fragment opening tag.
    if (code === codes.greaterThan) {
      return tagEnd(code)
    }

    // Start of a name.
    if (
      code !== codes.eof &&
      idStart(code) &&
      findCode(pattern.name[0]) === code
    ) {
      effects.enter(tagNameType)
      effects.enter(tagNamePrimaryType)
      effects.consume(code)
      return primaryName
    }

    return nok(code)

    // crash(
    //   code,
    //   'before name',
    //   'a character that can start a name, such as a letter, `$`, or `_`' +
    //     (code === codes.exclamationMark
    //       ? ' (note: to create a comment in MDX, use `{/* text */}`)'
    //       : '')
    // )
  }

  // At the start of a closing tag, right after `</`.
  const beforeClosingTagName: State = function (code) {
    // Fragment closing tag.
    if (code === codes.greaterThan) {
      return tagEnd(code)
    }

    // Start of a closing tag name.
    if (code !== codes.eof && idStart(code)) {
      effects.enter(tagNameType)
      effects.enter(tagNamePrimaryType)
      effects.consume(code)
      return primaryName
    }

    return nok(code)
    // crash(
    //   code,
    //   'before name',
    //   'a character that can start a name, such as a letter, `$`, or `_`' +
    //     (code === codes.asterisk || code === codes.slash
    //       ? ' (note: JS comments in JSX tags are not supported in MDX)'
    //       : '')
    // )
  }

  // Inside the primary name.
  const primaryName: State = function (code) {
    // Continuation of name: remain.
    const nextCharacterInName = pattern.name[nameIndex]
    const nextCodeInName = nextCharacterInName
      ? findCode(nextCharacterInName)
      : null
    // if (code === codes.dash || (code !== codes.eof && idCont(code))) {
    if (nextCodeInName === code) {
      effects.consume(code)
      nameIndex++
      return primaryName
    }
    // Reset nameIndex
    nameIndex = 0

    // End of name.
    if (
      code === codes.dot ||
      code === codes.slash ||
      code === codes.colon ||
      code === codes.greaterThan ||
      code === findCode(pattern.end[0]) ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagNamePrimaryType)
      returnState = afterPrimaryName
      return optionalEsWhitespace(code)
    }

    return nok(code)
    // crash(
    //   code,
    //   'in name',
    //   'a name character such as letters, digits, `$`, or `_`; whitespace before attributes; or the end of the tag' +
    //     (code === codes.atSign
    //       ? ' (note: to create a link in MDX, use `[text](url)`)'
    //       : '')
    // )
  }

  // After a name.
  const afterPrimaryName: State = function (code) {
    // Start of a member name.
    // eg. <Popover.PopoverButton>
    if (code === codes.dot) {
      effects.enter(tagNameMemberMarkerType)
      effects.consume(code)
      effects.exit(tagNameMemberMarkerType)
      returnState = beforeMemberName
      return optionalEsWhitespace
    }

    // Start of a local name.
    // eg. <xml:text>
    if (code === codes.colon) {
      effects.enter(tagNamePrefixMarkerType)
      effects.consume(code)
      effects.exit(tagNamePrefixMarkerType)
      returnState = beforeLocalName
      return optionalEsWhitespace
    }

    // TODO Start of unkeyed value
    // eg. <div "hello" /> or <div 'hello' /> or <div hello />

    // End pattern
    // This is triggerd for closing tags too
    if (code === findCode(pattern.end[0])) {
      const tagCloserSequence: State = function (code) {
        const character = findCode(pattern.end[tagCloserIndex])
        if (code === character) {
          if (pattern.end.length - 1 === tagCloserIndex) {
            effects.exit(tagNameType)
            return beforeAttribute(code)
          }
          tagCloserIndex++
          effects.consume(code)
          return tagCloserSequence
        }
        tagCloserIndex = 0
        return nok
      }
      if (pattern.end.length === 1) {
        effects.exit(tagNameType)
        return beforeAttribute(code)
      } else {
        effects.consume(code)
        return tagCloserSequence
      }
    }

    // End of name.
    if (
      code === codes.slash ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      (code !== codes.eof && idStart(code))
    ) {
      effects.exit(tagNameType)
      return beforeAttribute(code)
    }

    // shortcut for unkeyed value
    if (code === codes.quotationMark) {
      effects.exit(tagNameType)
      effects.enter(tagAttributeType)
      effects.enter(tagAttributeNameType)
      effects.enter(tagAttributeNamePrimaryType)
      effects.exit(tagAttributeNamePrimaryType)
      effects.exit(tagAttributeNameType)
      effects.enter(tagAttributeInitializerMarkerType)
      effects.exit(tagAttributeInitializerMarkerType)
      return beforeAttributeValue(code)
    }

    return nok(code)

    crash(
      code,
      'after name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; whitespace before attributes; or the end of the tag'
    )
  }

  // We’ve seen a `.` and are expecting a member name.
  const beforeMemberName: State = function (code) {
    // Start of a member name.
    if (code !== codes.eof && idStart(code)) {
      effects.enter(tagNameMemberType)
      effects.consume(code)
      return memberName
    }
    return nok(code)

    crash(
      code,
      'before member name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; whitespace before attributes; or the end of the tag'
    )
  }

  // Inside the member name.
  const memberName: State = function (code) {
    // Continuation of member name: stay in state
    if (code === codes.dash || (code !== codes.eof && idCont(code))) {
      effects.consume(code)
      return memberName
    }

    // End of member name (note that namespaces and members can’t be combined).
    if (
      code === codes.dot ||
      code === codes.slash ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagNameMemberType)
      returnState = afterMemberName
      return optionalEsWhitespace(code)
    }

    // TODO: not sure when this happens
    crash(
      code,
      'in member name',
      'a name character such as letters, digits, `$`, or `_`; whitespace before attributes; or the end of the tag' +
        (code === codes.atSign
          ? ' (note: to create a link in MDX, use `[text](url)`)'
          : '')
    )
  }

  // After a member name: this is the same as `afterPrimaryName` but we don’t
  // expect colons.
  const afterMemberName: State = function (code) {
    // Start another member name.
    if (code === codes.dot) {
      effects.enter(tagNameMemberMarkerType)
      effects.consume(code)
      effects.exit(tagNameMemberMarkerType)
      returnState = beforeMemberName
      return optionalEsWhitespace
    }

    // End of name.
    if (
      code === codes.slash ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      (code !== codes.eof && idStart(code))
    ) {
      effects.exit(tagNameType)
      return beforeAttribute(code)
    }

    return nok(code)

    // crash(
    //   code,
    //   'after member name',
    //   'a character that can start an attribute name, such as a letter, `$`, or `_`; whitespace before attributes; or the end of the tag'
    // )
  }

  // We’ve seen a `:`, and are expecting a local name.
  const beforeLocalName: State = function (code) {
    // Start of a local name.
    if (code !== codes.eof && idStart(code)) {
      effects.enter(tagNameLocalType)
      effects.consume(code)
      return localName
    }

    crash(
      code,
      'before local name',
      'a character that can start a name, such as a letter, `$`, or `_`' +
        (code === codes.plusSign ||
        (code !== null &&
          code > codes.dot &&
          code < codes.colon) /* `/` - `9` */
          ? ' (note: to create a link in MDX, use `[text](url)`)'
          : '')
    )
  }

  // Inside the local name.
  const localName: State = function (code) {
    // Continuation of local name: stay in state
    if (code === codes.dash || (code !== codes.eof && idCont(code))) {
      effects.consume(code)
      return localName
    }

    // End of local name (note that we don’t expect another colon, or a member).
    if (
      code === codes.slash ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagNameLocalType)
      returnState = afterLocalName
      return optionalEsWhitespace(code)
    }

    crash(
      code,
      'in local name',
      'a name character such as letters, digits, `$`, or `_`; whitespace before attributes; or the end of the tag'
    )
  }

  // After a local name: this is the same as `afterPrimaryName` but we don’t
  // expect colons or periods.
  const afterLocalName: State = function (code) {
    // End of name.
    if (
      code === codes.slash ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      (code !== codes.eof && idStart(code))
    ) {
      effects.exit(tagNameType)
      return beforeAttribute(code)
    }
    if (code === findCode(pattern.end)) {
      effects.exit(tagNameType)
      return beforeAttribute(code)
    }

    // TODO: not sure how to trigger this one

    crash(
      code,
      'after local name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; whitespace before attributes; or the end of the tag'
    )
  }

  const beforeAttribute: State = function (code) {
    if (code === findCode(pattern.end[0])) {
      const tagCloserSequence: State = function (code) {
        const character = findCode(pattern.end[tagCloserIndex])
        if (code === character) {
          if (pattern.end.length - 1 === tagCloserIndex) {
            return beforeAttribute(code)
          }
          tagCloserIndex++
          effects.consume(code)
          return tagCloserSequence
        }
        tagCloserIndex = 0
        return nok
      }
      if (pattern.end.length === 1) {
        if (pattern.leaf) {
          effects.enter(tagSelfClosingMarker)
          effects.exit(tagSelfClosingMarker)
          returnState = selfClosing
          return optionalEsWhitespace
        } else {
          return tagEnd(code)
        }
      } else {
        effects.consume(code)
        return tagCloserSequence
      }
    }
    // TODO: test this against `pattern.end`
    if (code === findCode(pattern.end[pattern.end.length - 1])) {
      if (pattern.leaf) {
        effects.enter(tagSelfClosingMarker)
        effects.exit(tagSelfClosingMarker)
        returnState = selfClosing
        return optionalEsWhitespace
      } else {
        return tagEnd(code)
      }
    }

    // End of tag.
    if (code === codes.greaterThan) {
      return tagEnd(code)
    }

    // Attribute expression.
    if (code === codes.leftCurlyBrace) {
      assert(startPoint, 'expected `startPoint` to be defined')
      return factoryMdxExpression.call(
        self,
        effects,
        afterAttributeExpression,
        tagExpressionAttributeType,
        tagExpressionAttributeMarkerType,
        tagExpressionAttributeValueType,
        acorn,
        acornOptions,
        addResult,
        true,
        false,
        allowLazy,
        startPoint.column
      )(code)
    }

    // Start of an attribute name.
    if (code !== codes.eof && idStart(code)) {
      effects.enter(tagAttributeType)
      effects.enter(tagAttributeNameType)
      effects.enter(tagAttributeNamePrimaryType)
      effects.consume(code)
      return attributePrimaryName
    }

    return nok
    // crash(
    //   code,
    //   'before attribute name',
    //   'a character that can start an attribute name, such as a letter, `$`, or `_`; whitespace before attributes; or the end of the tag'
    // )
  }

  // At the start of an attribute expression.
  const afterAttributeExpression: State = function (code) {
    returnState = beforeAttribute
    return optionalEsWhitespace(code)
  }

  // In the attribute name.
  const attributePrimaryName: State = function (code) {
    // Continuation of the attribute name.
    if (code === codes.dash || (code !== codes.eof && idCont(code))) {
      effects.consume(code)
      return attributePrimaryName
    }

    // End of attribute name or tag.
    if (
      code === codes.slash ||
      code === codes.colon ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagAttributeNamePrimaryType)
      returnState = afterAttributePrimaryName
      return optionalEsWhitespace(code)
    }

    return nok(code)
    // crash(
    //   code,
    //   'in attribute name',
    //   'an attribute name character such as letters, digits, `$`, or `_`; `=` to initialize a value; whitespace before attributes; or the end of the tag'
    // )
  }

  // After an attribute name, probably finding an equals.
  const afterAttributePrimaryName: State = function (code) {
    // Start of a local name.
    if (code === codes.colon) {
      effects.enter(tagAttributeNamePrefixMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeNamePrefixMarkerType)
      returnState = beforeAttributeLocalName
      return optionalEsWhitespace
    }

    // Start of an attribute value.
    if (code === codes.equalsTo) {
      effects.exit(tagAttributeNameType)
      effects.enter(tagAttributeInitializerMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeInitializerMarkerType)
      returnState = beforeAttributeValue
      return optionalEsWhitespace
    }

    // End of tag / new attribute.
    if (
      code === codes.slash ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code) ||
      (code !== codes.eof && idStart(code))
    ) {
      effects.exit(tagAttributeNameType)
      effects.exit(tagAttributeType)
      returnState = beforeAttribute
      return optionalEsWhitespace(code)
    }

    return nok(code)
    // crash(
    //   code,
    //   'after attribute name',
    //   'a character that can start an attribute name, such as a letter, `$`, or `_`; `=` to initialize a value; or the end of the tag'
    // )
  }

  // We’ve seen a `:`, and are expecting a local name.
  const beforeAttributeLocalName: State = function (code) {
    // Start of a local name.
    if (code !== codes.eof && idStart(code)) {
      effects.enter(tagAttributeNameLocalType)
      effects.consume(code)
      return attributeLocalName
    }

    // TODO not sure how to trigger this

    crash(
      code,
      'before local attribute name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; `=` to initialize a value; or the end of the tag'
    )
  }

  // In the local attribute name.
  const attributeLocalName: State = function (code) {
    // Continuation of the local attribute name.
    if (code === codes.dash || (code !== codes.eof && idCont(code))) {
      effects.consume(code)
      return attributeLocalName
    }

    // End of tag / attribute name.
    if (
      code === codes.slash ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagAttributeNameLocalType)
      effects.exit(tagAttributeNameType)
      returnState = afterAttributeLocalName
      return optionalEsWhitespace(code)
    }

    // TODO not sure how to trigger this

    crash(
      code,
      'in local attribute name',
      'an attribute name character such as letters, digits, `$`, or `_`; `=` to initialize a value; whitespace before attributes; or the end of the tag'
    )
  }

  // After a local attribute name, expecting an equals.
  const afterAttributeLocalName: State = function (code) {
    // Start of an attribute value.
    if (code === codes.equalsTo) {
      effects.enter(tagAttributeInitializerMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeInitializerMarkerType)
      returnState = beforeAttributeValue
      return optionalEsWhitespace
    }

    // End of tag / new attribute.
    if (
      code === codes.slash ||
      code === codes.greaterThan ||
      code === codes.leftCurlyBrace ||
      (code !== codes.eof && idStart(code))
    ) {
      effects.exit(tagAttributeType)
      return beforeAttribute(code)
    }

    // TODO not sure how to trigger this
    crash(
      code,
      'after local attribute name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; `=` to initialize a value; or the end of the tag'
    )
  }

  // After an attribute value initializer, expecting quotes and such.
  const beforeAttributeValue: State = function (code) {
    // Start of double- or single quoted value.
    if (code === codes.quotationMark || code === codes.apostrophe) {
      effects.enter(tagAttributeValueLiteralType)
      effects.enter(tagAttributeValueLiteralMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeValueLiteralMarkerType)
      marker = code
      return attributeValueQuotedStart
    }

    // Start of an assignment expression.
    if (code === codes.leftCurlyBrace) {
      assert(startPoint, 'expected `startPoint` to be defined')
      return factoryMdxExpression.call(
        self,
        effects,
        afterAttributeValueExpression,
        tagAttributeValueExpressionType,
        tagAttributeValueExpressionMarkerType,
        tagAttributeValueExpressionValueType,
        acorn,
        acornOptions,
        addResult,
        false,
        false,
        allowLazy,
        startPoint.column
      )(code)
    }

    return nok(code)
    // crash(
    //   code,
    //   'before attribute value',
    //   'a character that can start an attribute value, such as `"`, `\'`, or `{`' +
    //     (code === codes.lessThan
    //       ? ' (note: to use an element or fragment as a prop value in MDX, use `{<element />}`)'
    //       : '')
    // )
  }

  const afterAttributeValueExpression: State = function (code) {
    effects.exit(tagAttributeType)
    returnState = beforeAttribute
    return optionalEsWhitespace(code)
  }

  // At the start of a quoted attribute value.
  const attributeValueQuotedStart: State = function (code) {
    assert(marker !== undefined, 'expected `marker` to be defined')

    if (code === codes.eof) {
      return nok(code)
      // crash(
      //   code,
      //   'in attribute value',
      //   'a corresponding closing quote `' + String.fromCodePoint(marker) + '`'
      // )
    }

    if (code === marker) {
      effects.enter(tagAttributeValueLiteralMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeValueLiteralMarkerType)
      effects.exit(tagAttributeValueLiteralType)
      effects.exit(tagAttributeType)
      marker = undefined
      returnState = beforeAttribute
      return optionalEsWhitespace
    }

    if (markdownLineEnding(code)) {
      returnState = attributeValueQuotedStart
      return optionalEsWhitespace(code)
    }

    effects.enter(tagAttributeValueLiteralValueType)
    return attributeValueQuoted(code)
  }

  // In a quoted attribute value.
  const attributeValueQuoted: State = function (code) {
    if (code === codes.eof || code === marker || markdownLineEnding(code)) {
      effects.exit(tagAttributeValueLiteralValueType)
      return attributeValueQuotedStart(code)
    }

    // Continuation.
    effects.consume(code)
    return attributeValueQuoted
  }

  // Right after the slash on a tag, e.g., `<asd /`.
  const selfClosing: State = function (code) {
    // End of tag.
    if (code === findCode(pattern.end[pattern.end.length - 1])) {
      return tagEnd(code)
    }

    // Not sure how to trigger this
    crash(
      code,
      'after self-closing slash',
      '`>` to end the tag' +
        (code === codes.asterisk || code === codes.slash
          ? ' (note: JS comments in JSX tags are not supported in MDX)'
          : '')
    )
  }

  // At a `>`.
  const tagEnd: State = function (code) {
    // assert(code === codes.greaterThan, 'expected `>`')
    effects.enter(tagMarkerType)
    effects.consume(code)
    effects.exit(tagMarkerType)
    effects.exit(tagType)
    return ok
  }

  // Optionally start whitespace.
  const optionalEsWhitespace: State = function (code) {
    if (markdownLineEnding(code)) {
      if (allowLazy) {
        effects.enter(types.lineEnding)
        effects.consume(code)
        effects.exit(types.lineEnding)
        return factorySpace(
          effects,
          optionalEsWhitespace,
          types.linePrefix,
          constants.tabSize
        )
      }

      return effects.attempt(
        lazyLineEnd,
        factorySpace(
          effects,
          optionalEsWhitespace,
          types.linePrefix,
          constants.tabSize
        ),
        crashEol
      )(code)
    }

    if (markdownSpace(code) || unicodeWhitespace(code)) {
      effects.enter('esWhitespace')
      return optionalEsWhitespaceContinue(code)
    }

    return returnState(code)
  }

  // Continue optional whitespace.
  const optionalEsWhitespaceContinue: State = function (code) {
    if (
      markdownLineEnding(code) ||
      !(markdownSpace(code) || unicodeWhitespace(code))
    ) {
      effects.exit('esWhitespace')
      return optionalEsWhitespace(code)
    }

    effects.consume(code)
    return optionalEsWhitespaceContinue
  }

  /** @type {State} */
  function crashEol() {
    throw new VFileMessage(
      'Unexpected lazy line in container, expected line to be prefixed with `>` when in a block quote, whitespace when in a list, etc',
      self.now(),
      'micromark-extension-mdx-jsx:unexpected-eof'
    )
  }

  // Crash at a nonconforming character.
  function crash(code: Code, at: string, expect: string) {
    throw new VFileMessage(
      'Unexpected ' +
        (code === codes.eof
          ? 'end of file'
          : 'character `' +
            (code === codes.graveAccent
              ? '` ` `'
              : String.fromCodePoint(code)) +
            '` (' +
            serializeCharCode(code) +
            ')') +
        ' ' +
        at +
        ', expected ' +
        expect,
      self.now(),
      'micromark-extension-mdx-jsx:unexpected-' +
        (code === codes.eof ? 'eof' : 'character')
    )
  }

  return start
}

const tokenizeLazyLineEnd: Tokenizer = function (effects, ok, nok) {
  // eslint-disable-next-line
  const self = this

  const start: State = function (code) {
    assert(markdownLineEnding(code), 'expected eol')
    effects.enter(types.lineEnding)
    effects.consume(code)
    effects.exit(types.lineEnding)
    return lineStart
  }

  const lineStart: State = function (code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code)
  }

  return start
}

/**
 * @param {NonNullable<Code>} code
 * @returns {string}
 */
const serializeCharCode = function (code: NonNullable<Code>): string {
  return (
    'U+' +
    code
      .toString(constants.numericBaseHexadecimal)
      .toUpperCase()
      .padStart(4, '0')
  )
}

const lazyLineEnd = { tokenize: tokenizeLazyLineEnd, partial: true }
