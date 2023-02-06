/**
 * @typedef {import('micromark-util-types').Effects} Effects
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Code} Code
 */

import type { Effects, State, Code } from 'micromark-util-types'
import { ok as assert } from 'uvu/assert'
import { factorySpace } from 'micromark-factory-space'
import { factoryWhitespace } from 'micromark-factory-whitespace'
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { types } from 'micromark-util-symbol/types'

/**
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {string} attributesType
 * @param {string} attributesMarkerType
 * @param {string} attributeType
 * @param {string} attributeIdType
 * @param {string} attributeClassType
 * @param {string} attributeNameType
 * @param {string} attributeInitializerType
 * @param {string} attributeValueLiteralType
 * @param {string} attributeValueType
 * @param {string} attributeValueMarker
 * @param {string} attributeValueData
 * @param {boolean} [disallowEol=false]
 */
/* eslint-disable-next-line max-params */
export function factoryAttributes(
  effects: Effects,
  ok: State,
  nok: State,
  attributesType: string,
  attributesMarkerType: string,
  attributeType: string,
  attributeIdType: string,
  attributeClassType: string,
  attributeNameType: string,
  attributeInitializerType: string,
  attributeValueLiteralType: string,
  attributeValueType: string,
  attributeValueMarker: string,
  attributeValueData: string,
  disallowEol?: boolean
) {
  let type: string
  let marker: Code | undefined

  const start: State = function (code) {
    assert(code === codes.leftCurlyBrace, 'expected `{`')
    effects.enter(attributesType)
    effects.enter(attributesMarkerType)
    effects.consume(code)
    effects.exit(attributesMarkerType)
    return between
  }

  const between: State = function (code) {
    if (code === codes.numberSign) {
      type = attributeIdType
      return shortcutStart(code)
    }

    if (code === codes.dot) {
      type = attributeClassType
      return shortcutStart(code)
    }

    if (code === codes.colon || code === codes.underscore || asciiAlpha(code)) {
      effects.enter(attributeType)
      effects.enter(attributeNameType)
      effects.consume(code)
      return name
    }

    if (disallowEol && markdownSpace(code)) {
      return factorySpace(effects, between, types.whitespace)(code)
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return factoryWhitespace(effects, between)(code)
    }

    return end(code)
  }

  const shortcutStart: State = function (code) {
    effects.enter(attributeType)
    effects.enter(type)
    effects.enter(type + 'Marker')
    effects.consume(code)
    effects.exit(type + 'Marker')
    return shortcutStartAfter
  }

  const shortcutStartAfter: State = function (code) {
    if (
      code === codes.eof ||
      code === codes.quotationMark ||
      code === codes.numberSign ||
      code === codes.apostrophe ||
      code === codes.dot ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent ||
      code === codes.rightCurlyBrace ||
      markdownLineEndingOrSpace(code)
    ) {
      return nok(code)
    }

    effects.enter(type + 'Value')
    effects.consume(code)
    return shortcut
  }

  const shortcut: State = function (code) {
    if (
      code === codes.eof ||
      code === codes.quotationMark ||
      code === codes.apostrophe ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent
    ) {
      return nok(code)
    }

    if (
      code === codes.numberSign ||
      code === codes.dot ||
      code === codes.rightCurlyBrace ||
      markdownLineEndingOrSpace(code)
    ) {
      effects.exit(type + 'Value')
      effects.exit(type)
      effects.exit(attributeType)
      return between(code)
    }

    effects.consume(code)
    return shortcut
  }

  const name: State = function (code) {
    if (
      code === codes.dash ||
      code === codes.dot ||
      code === codes.colon ||
      code === codes.underscore ||
      asciiAlphanumeric(code)
    ) {
      effects.consume(code)
      return name
    }

    effects.exit(attributeNameType)

    if (disallowEol && markdownSpace(code)) {
      return factorySpace(effects, nameAfter, types.whitespace)(code)
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return factoryWhitespace(effects, nameAfter)(code)
    }

    return nameAfter(code)
  }

  const nameAfter: State = function (code) {
    if (code === codes.equalsTo) {
      effects.enter(attributeInitializerType)
      effects.consume(code)
      effects.exit(attributeInitializerType)
      return valueBefore
    }

    // Attribute w/o value.
    effects.exit(attributeType)
    return between(code)
  }

  const valueBefore: State = function (code) {
    if (
      code === codes.eof ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent ||
      code === codes.rightCurlyBrace ||
      (disallowEol && markdownLineEnding(code))
    ) {
      return nok(code)
    }

    if (code === codes.quotationMark || code === codes.apostrophe) {
      effects.enter(attributeValueLiteralType)
      effects.enter(attributeValueMarker)
      effects.consume(code)
      effects.exit(attributeValueMarker)
      marker = code
      return valueQuotedStart
    }

    if (disallowEol && markdownSpace(code)) {
      return factorySpace(effects, valueBefore, types.whitespace)(code)
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return factoryWhitespace(effects, valueBefore)(code)
    }

    effects.enter(attributeValueType)
    effects.enter(attributeValueData)
    effects.consume(code)
    marker = undefined
    return valueUnquoted
  }

  const valueUnquoted: State = function (code) {
    if (
      code === codes.eof ||
      code === codes.quotationMark ||
      code === codes.apostrophe ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent
    ) {
      return nok(code)
    }

    if (code === codes.rightCurlyBrace || markdownLineEndingOrSpace(code)) {
      effects.exit(attributeValueData)
      effects.exit(attributeValueType)
      effects.exit(attributeType)
      return between(code)
    }

    effects.consume(code)
    return valueUnquoted
  }

  const valueQuotedStart: State = function (code) {
    if (code === marker) {
      effects.enter(attributeValueMarker)
      effects.consume(code)
      effects.exit(attributeValueMarker)
      effects.exit(attributeValueLiteralType)
      effects.exit(attributeType)
      return valueQuotedAfter
    }

    effects.enter(attributeValueType)
    return valueQuotedBetween(code)
  }

  const valueQuotedBetween: State = function (code) {
    if (code === marker) {
      effects.exit(attributeValueType)
      return valueQuotedStart(code)
    }

    if (code === codes.eof) {
      return nok(code)
    }

    // Note: blank lines can’t exist in content.
    if (markdownLineEnding(code)) {
      return disallowEol
        ? nok(code)
        : factoryWhitespace(effects, valueQuotedBetween)(code)
    }

    effects.enter(attributeValueData)
    effects.consume(code)
    return valueQuoted
  }

  const valueQuoted: State = function (code) {
    if (code === marker || code === codes.eof || markdownLineEnding(code)) {
      effects.exit(attributeValueData)
      return valueQuotedBetween(code)
    }

    effects.consume(code)
    return valueQuoted
  }

  const valueQuotedAfter: State = function (code) {
    return code === codes.rightCurlyBrace || markdownLineEndingOrSpace(code)
      ? between(code)
      : end(code)
  }

  const end: State = function (code) {
    if (code === codes.rightCurlyBrace) {
      effects.enter(attributesMarkerType)
      effects.consume(code)
      effects.exit(attributesMarkerType)
      effects.exit(attributesType)
      return ok
    }

    return nok(code)
  }

  return start
}

// code === null
//   ? context.events.length === 0 ||
//     context.events[context.events.length - 1][0] === "exit"
//   : context.events[context.events.length - 1][0] === "enter",
//   "expected last token to be open";
