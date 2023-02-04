/**
 * @typedef {import('micromark-util-types').Construct} Construct
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Token} Token
 */

import type { Construct, Tokenizer, State, Token } from 'micromark-util-types'
import { ok as assert } from 'uvu/assert'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { constants } from 'micromark-util-symbol/constants'
import { types } from 'micromark-util-symbol/types'
import { factoryAttributes } from './factory-attributes'
import { factoryLabel } from './factory-label'
import { factoryName } from './factory-name'

const tokenizeDirectiveContainer: Tokenizer = function (effects, ok, nok) {
  const self = this
  const tail = self.events[self.events.length - 1]
  const initialSize =
    tail && tail[1].type === types.linePrefix
      ? tail[2].sliceSerialize(tail[1], true).length
      : 0
  let sizeOpen = 0
  let previous: Token

  const start: State = function (code) {
    assert(code === codes.colon, 'expected `:`')
    effects.enter('directiveContainer')
    effects.enter('directiveContainerFence')
    effects.enter('directiveContainerSequence')
    return sequenceOpen(code)
  }

  const sequenceOpen: State = function (code) {
    if (code === codes.colon) {
      effects.consume(code)
      sizeOpen++
      return sequenceOpen
    }

    if (sizeOpen < constants.codeFencedSequenceSizeMin) {
      return nok(code)
    }

    effects.exit('directiveContainerSequence')
    return factoryName.call(
      self,
      effects,
      afterName,
      nok,
      'directiveContainerName'
    )(code)
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
    return factorySpace(effects, openAfter, types.whitespace)(code)
  }

  const openAfter: State = function (code) {
    effects.exit('directiveContainerFence')

    if (code === codes.eof) {
      return afterOpening(code)
    }

    if (markdownLineEnding(code)) {
      if (self.interrupt) {
        return ok(code)
      }

      return effects.attempt(nonLazyLine, contentStart, afterOpening)(code)
    }

    return nok(code)
  }

  const afterOpening: State = function (code) {
    effects.exit('directiveContainer')
    return ok(code)
  }

  const contentStart: State = function (code) {
    if (code === codes.eof) {
      effects.exit('directiveContainer')
      return ok(code)
    }

    effects.enter('directiveContainerContent')
    return lineStart(code)
  }

  const lineStart: State = function (code) {
    if (code === codes.eof) {
      return after(code)
    }

    return effects.attempt(
      { tokenize: tokenizeClosingFence, partial: true },
      after,
      initialSize
        ? factorySpace(effects, chunkStart, types.linePrefix, initialSize + 1)
        : chunkStart
    )(code)
  }

  const chunkStart: State = function (code) {
    if (code === codes.eof) {
      return after(code)
    }

    const token = effects.enter(types.chunkDocument, {
      contentType: constants.contentTypeDocument,
      previous,
    })
    if (previous) previous.next = token
    previous = token
    return contentContinue(code)
  }

  const contentContinue: State = function (code) {
    if (code === codes.eof) {
      const t = effects.exit(types.chunkDocument)
      self.parser.lazy[t.start.line] = false
      return after(code)
    }

    if (markdownLineEnding(code)) {
      return effects.check(nonLazyLine, nonLazyLineAfter, lineAfter)(code)
    }

    effects.consume(code)
    return contentContinue
  }

  const nonLazyLineAfter: State = function (code) {
    effects.consume(code)
    const t = effects.exit(types.chunkDocument)
    self.parser.lazy[t.start.line] = false
    return lineStart
  }

  const lineAfter: State = function (code) {
    const t = effects.exit(types.chunkDocument)
    self.parser.lazy[t.start.line] = false
    return after(code)
  }

  const after: State = function (code) {
    effects.exit('directiveContainerContent')
    effects.exit('directiveContainer')
    return ok(code)
  }

  const tokenizeClosingFence: Tokenizer = function (effects, ok, nok) {
    let size = 0

    const closingPrefixAfter: State = function (code) {
      effects.enter('directiveContainerFence')
      effects.enter('directiveContainerSequence')
      return closingSequence(code)
    }

    const closingSequence: State = function (code) {
      if (code === codes.colon) {
        effects.consume(code)
        size++
        return closingSequence
      }

      if (size < sizeOpen) return nok(code)
      effects.exit('directiveContainerSequence')
      return factorySpace(effects, closingSequenceEnd, types.whitespace)(code)
    }

    const closingSequenceEnd: State = function (code) {
      if (code === codes.eof || markdownLineEnding(code)) {
        effects.exit('directiveContainerFence')
        return ok(code)
      }

      return nok(code)
    }

    return factorySpace(
      effects,
      closingPrefixAfter,
      types.linePrefix,
      constants.tabSize
    )
  }

  return start
}

const tokenizeLabel: Tokenizer = function (effects, ok, nok) {
  // Always a `[`
  return factoryLabel(
    effects,
    ok,
    nok,
    'directiveContainerLabel',
    'directiveContainerLabelMarker',
    'directiveContainerLabelString',
    true
  )
}

const tokenizeAttributes: Tokenizer = function (effects, ok, nok) {
  // Always a `{`
  return factoryAttributes(
    effects,
    ok,
    nok,
    'directiveContainerAttributes',
    'directiveContainerAttributesMarker',
    'directiveContainerAttribute',
    'directiveContainerAttributeId',
    'directiveContainerAttributeClass',
    'directiveContainerAttributeName',
    'directiveContainerAttributeInitializerMarker',
    'directiveContainerAttributeValueLiteral',
    'directiveContainerAttributeValue',
    'directiveContainerAttributeValueMarker',
    'directiveContainerAttributeValueData',
    true
  )
}

const tokenizeNonLazyLine: Tokenizer = function (effects, ok, nok) {
  const self = this

  const lineStart: State = function (code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code)
  }

  const start: State = function (code) {
    assert(markdownLineEnding(code), 'expected eol')
    effects.enter(types.lineEnding)
    effects.consume(code)
    effects.exit(types.lineEnding)
    return lineStart
  }

  return start
}

const label = { tokenize: tokenizeLabel, partial: true }
const attributes = { tokenize: tokenizeAttributes, partial: true }
const nonLazyLine = { tokenize: tokenizeNonLazyLine, partial: true }

export const directiveContainer: Construct = {
  tokenize: tokenizeDirectiveContainer,
  concrete: true,
}
