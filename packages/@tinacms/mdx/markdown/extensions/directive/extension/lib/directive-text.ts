/**
 * @typedef {import('micromark-util-types').Construct} Construct
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').Previous} Previous
 * @typedef {import('micromark-util-types').State} State
 */

import type {
  Construct,
  Tokenizer,
  Previous,
  State,
} from 'micromark-util-types'
import { ok as assert } from 'uvu/assert'
import { codes } from 'micromark-util-symbol/codes'
import { types } from 'micromark-util-symbol/types'
import { factoryAttributes } from './factory-attributes'
import { factoryLabel } from './factory-label'
import { factoryName } from './factory-name'

const previous: Previous = function (code) {
  // If there is a previous code, there will always be a tail.
  return (
    code !== codes.colon ||
    this.events[this.events.length - 1][1].type === types.characterEscape
  )
}

const tokenizeDirectiveText: Tokenizer = function (effects, ok, nok) {
  const self = this

  const start: State = function (code) {
    assert(code === codes.colon, 'expected `:`')
    assert(previous.call(self, self.previous), 'expected correct previous')
    effects.enter('directiveText')
    effects.enter('directiveTextMarker')
    effects.consume(code)
    effects.exit('directiveTextMarker')
    return factoryName.call(self, effects, afterName, nok, 'directiveTextName')
  }

  const afterName: State = function (code) {
    return code === codes.colon
      ? nok(code)
      : code === codes.leftSquareBracket
      ? effects.attempt(label, afterLabel, afterLabel)(code)
      : afterLabel(code)
  }

  const afterLabel: State = function (code) {
    return code === codes.leftCurlyBrace
      ? effects.attempt(attributes, afterAttributes, afterAttributes)(code)
      : afterAttributes(code)
  }

  const afterAttributes: State = function (code) {
    effects.exit('directiveText')
    return ok(code)
  }

  return start
}

const tokenizeLabel: Tokenizer = function (effects, ok, nok) {
  // Always a `[`
  return factoryLabel(
    effects,
    ok,
    nok,
    'directiveTextLabel',
    'directiveTextLabelMarker',
    'directiveTextLabelString'
  )
}

const tokenizeAttributes: Tokenizer = function (effects, ok, nok) {
  // Always a `{`
  return factoryAttributes(
    effects,
    ok,
    nok,
    'directiveTextAttributes',
    'directiveTextAttributesMarker',
    'directiveTextAttribute',
    'directiveTextAttributeId',
    'directiveTextAttributeClass',
    'directiveTextAttributeName',
    'directiveTextAttributeInitializerMarker',
    'directiveTextAttributeValueLiteral',
    'directiveTextAttributeValue',
    'directiveTextAttributeValueMarker',
    'directiveTextAttributeValueData'
  )
}

export const directiveText = {
  tokenize: tokenizeDirectiveText,
  previous,
}

const label = { tokenize: tokenizeLabel, partial: true }
const attributes = { tokenize: tokenizeAttributes, partial: true }
