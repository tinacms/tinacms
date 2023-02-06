/**
 * @typedef {import('micromark-util-types').Effects} Effects
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Token} Token
 */

import type { Effects, State, Token } from 'micromark-util-types'
import { ok as assert } from 'uvu/assert'
import { markdownLineEnding } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { constants } from 'micromark-util-symbol/constants'
import { types } from 'micromark-util-symbol/types'

// This is a fork of:
// <https://github.com/micromark/micromark/tree/main/packages/micromark-factory-label>
// to allow empty labels, balanced brackets (such as for nested directives),
// text instead of strings, and optionally disallows EOLs.

/**
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {string} type
 * @param {string} markerType
 * @param {string} stringType
 * @param {boolean} [disallowEol=false]
 */
// eslint-disable-next-line max-params
export function factoryLabel(
  effects: Effects,
  ok: State,
  nok: State,
  type: string,
  markerType: string,
  stringType: string,
  disallowEol?: boolean
) {
  let size = 0
  let balance = 0
  let previous: Token | undefined

  const start: State = function (code) {
    assert(code === codes.leftSquareBracket, 'expected `[`')
    effects.enter(type)
    effects.enter(markerType)
    effects.consume(code)
    effects.exit(markerType)
    return afterStart
  }

  const afterStart: State = function (code) {
    if (code === codes.rightSquareBracket) {
      effects.enter(markerType)
      effects.consume(code)
      effects.exit(markerType)
      effects.exit(type)
      return ok
    }

    effects.enter(stringType)
    return lineStart(code)
  }

  const lineStart: State = function (code) {
    if (code === codes.rightSquareBracket && !balance) {
      return atClosingBrace(code)
    }

    const token = effects.enter(types.chunkText, {
      contentType: constants.contentTypeText,
      previous,
    })
    if (previous) previous.next = token
    previous = token
    return data(code)
  }

  const data: State = function (code) {
    if (code === codes.eof || size > constants.linkReferenceSizeMax) {
      return nok(code)
    }

    if (
      code === codes.leftSquareBracket &&
      ++balance > constants.linkResourceDestinationBalanceMax
    ) {
      return nok(code)
    }

    if (code === codes.rightSquareBracket && !balance--) {
      effects.exit(types.chunkText)
      return atClosingBrace(code)
    }

    if (markdownLineEnding(code)) {
      if (disallowEol) {
        return nok(code)
      }

      effects.consume(code)
      effects.exit(types.chunkText)
      return lineStart
    }

    effects.consume(code)
    return code === codes.backslash ? dataEscape : data
  }

  const dataEscape: State = function (code) {
    if (
      code === codes.leftSquareBracket ||
      code === codes.backslash ||
      code === codes.rightSquareBracket
    ) {
      effects.consume(code)
      size++
      return data
    }

    return data(code)
  }

  const atClosingBrace: State = function (code) {
    effects.exit(stringType)
    effects.enter(markerType)
    effects.consume(code)
    effects.exit(markerType)
    effects.exit(type)
    return ok
  }

  return start
}
