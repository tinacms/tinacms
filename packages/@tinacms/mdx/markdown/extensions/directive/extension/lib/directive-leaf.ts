import type { Construct, Tokenizer, State } from 'micromark-util-types'
import { ok as assert } from 'uvu/assert'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { types } from 'micromark-util-symbol/types'
import { factoryAttributes } from './factory-attributes'
import { factoryLabel } from './factory-label'
import { factoryName } from './factory-name'

/** @type {Tokenizer} */
const tokenizeDirectiveLeaf: Tokenizer = function (effects, ok, nok) {
  const self = this
  const logSelf = () => {
    self.events.forEach((e) => {
      console.log(`${e[0]} - ${e[1].type}`)
    })
  }

  const start: State = function (code) {
    assert(code === codes.colon, 'expected `:`')
    effects.enter('directiveLeaf')
    effects.enter('directiveLeafSequence')
    effects.consume(code)
    return inStart
  }

  const inStart: State = function (code) {
    if (code === codes.colon) {
      effects.consume(code)
      effects.exit('directiveLeafSequence')
      return factoryName.call(
        self,
        effects,
        afterName,
        nok,
        'directiveLeafName'
      )
    }

    return nok(code)
  }

  const afterName: State = function (code) {
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
    return factorySpace(effects, end, types.whitespace)(code)
  }

  const end: State = function (code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      effects.exit('directiveLeaf')
      // logSelf();
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
