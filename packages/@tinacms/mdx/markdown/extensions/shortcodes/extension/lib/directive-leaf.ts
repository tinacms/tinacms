import type { Construct, Tokenizer, State } from 'micromark-util-types'
import { ok as assert } from 'uvu/assert'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { types } from 'micromark-util-symbol/types'
import { factoryAttributes } from './factory-attributes'
import { factoryLabel } from './factory-label'
import { factoryName } from './factory-name'
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character'

/** @type {Tokenizer} */
const tokenizeDirectiveLeaf: Tokenizer = function (effects, ok, nok) {
  const self = this

  const start: State = function (code) {
    assert(code === codes.leftCurlyBrace, 'expected `{`')
    effects.enter('directiveLeaf')
    effects.enter('directiveLeafSequence')
    effects.consume(code)
    return inStart
  }

  const inStart: State = function (code) {
    if (code === codes.leftCurlyBrace) {
      effects.consume(code)
      return inStart2
    }

    return nok(code)
  }
  const inStart2: State = function (code) {
    if (code === codes.lessThan) {
      effects.consume(code)
      effects.exit('directiveLeafSequence')

      // return factoryName.call(
      //   self,
      //   effects,
      //   afterName,
      //   nok,
      //   "directiveLeafName"
      // );
      return factoryNameStart
    }

    return nok(code)
  }

  const factoryNameStart: State = function (code) {
    if (markdownSpace(code)) {
      // effects.consume(code);
      return factorySpace(effects, factoryNameStart, 'noop')
      // return factoryNameStart;
    }
    if (asciiAlpha(code)) {
      effects.enter('directiveLeafName')
      effects.consume(code)
      return factoryNameName
    }

    return nok(code)
  }
  const factoryNameName: State = function (code) {
    if (
      code === codes.dash ||
      code === codes.underscore ||
      asciiAlphanumeric(code)
    ) {
      effects.consume(code)
      return factoryNameName
    }

    effects.exit('directiveLeafName')
    return self.previous === codes.dash || self.previous === codes.underscore
      ? nok(code)
      : afterName(code)
  }

  // const afterName: State = function (code) {
  //   return code === codes.leftSquareBracket
  //     ? effects.attempt(label, afterLabel, afterLabel)(code)
  //     : afterLabel(code);
  // };

  const afterName: State = function (code) {
    if (markdownSpace(code)) {
      // effects.consume(code);
      return factorySpace(effects, afterName, 'noop')
    }
    return code === codes.leftSquareBracket
      ? effects.attempt(label, afterLabel, afterLabel)(code)
      : afterLabel(code)
  }

  const afterLabel: State = function (code) {
    return code === codes.leftCurlyBrace
      ? effects.attempt(attributes, afterAttributes, afterAttributes)(code)
      : afterAttributes(code)
  }

  const afterAttributes: State = function (code) {
    // Not sure what this does
    // return factorySpace(effects, end, types.whitespace)(code);
    return endLeaf(code)
  }

  const endLeaf: State = function (code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return endLeaf
    }
    if (code === codes.greaterThan) {
      effects.enter('noop')
      effects.consume(code)
      return endLeaf2
    }
    return nok(code)
  }

  const endLeaf2: State = function (code) {
    if (code === codes.rightCurlyBrace) {
      effects.consume(code)
      return endLeaf3
    }

    return nok(code)
  }

  const endLeaf3: State = function (code) {
    if (code === codes.rightCurlyBrace) {
      effects.consume(code)
      effects.exit('noop')
      return end
    }

    return nok(code)
  }

  const end: State = function (code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      effects.exit('directiveLeaf')
      return ok(code)
    }

    return nok(code)
  }

  return start
}

/** @type {Tokenizer} */
const tokenizeLabel: Tokenizer = function (effects, ok, nok) {
  // Always a `[`
  return factoryLabel(
    effects,
    ok,
    nok,
    'directiveLeafLabel',
    'directiveLeafLabelMarker',
    'directiveLeafLabelString',
    true
  )
}

/** @type {Tokenizer} */
const tokenizeAttributes: Tokenizer = function (effects, ok, nok) {
  // Always a `{`
  return factoryAttributes(
    effects,
    ok,
    nok,
    'directiveLeafAttributes',
    'directiveLeafAttributesMarker',
    'directiveLeafAttribute',
    'directiveLeafAttributeId',
    'directiveLeafAttributeClass',
    'directiveLeafAttributeName',
    'directiveLeafAttributeInitializerMarker',
    'directiveLeafAttributeValueLiteral',
    'directiveLeafAttributeValue',
    'directiveLeafAttributeValueMarker',
    'directiveLeafAttributeValueData',
    true
  )
}

const label = { tokenize: tokenizeLabel, partial: true }
const attributes = { tokenize: tokenizeAttributes, partial: true }

export const directiveLeaf: Construct = { tokenize: tokenizeDirectiveLeaf }
