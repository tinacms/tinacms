/**
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Effects} Effects
 * @typedef {import('micromark-util-types').State} State
 */

import type { TokenizeContext, Effects, State } from 'micromark-util-types'
import { asciiAlpha, asciiAlphanumeric } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { findCode, printCode } from '../../../tina-shortcodes/shortcode-leaf'

/**
 * @this {TokenizeContext}
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {string} type
 */
export function factoryName(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
  type: string,
  patternName: string
) {
  const self = this
  let nameIndex = 0

  const start: State = function (code) {
    const character = patternName[nameIndex]
    if (asciiAlpha(code) && findCode(character) === code) {
      nameIndex++
      effects.enter(type)
      effects.consume(code)
      return name
    }

    return nok(code)
  }

  const name: State = function (code) {
    const character = patternName[nameIndex]
    if (
      code === codes.dash ||
      code === codes.underscore ||
      asciiAlphanumeric(code)
    ) {
      if (findCode(character) === code) {
        effects.consume(code)
        nameIndex++
        return name
      }
      return nok(code)
    }

    effects.exit(type)
    return self.previous === codes.dash || self.previous === codes.underscore
      ? nok(code)
      : ok(code)
  }

  return start
}
