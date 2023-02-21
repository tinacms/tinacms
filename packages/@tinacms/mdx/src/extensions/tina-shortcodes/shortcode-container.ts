import type { Pattern } from '../../stringify'
import type { Construct, Tokenizer, State, Token } from 'micromark-util-types'
import { ok as assert } from 'uvu/assert'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { constants } from 'micromark-util-symbol/constants'
import { types } from 'micromark-util-symbol/types'
import { factoryAttributes } from './factory-attributes'
import { factoryName } from './factory-name'
import { findCode } from './shortcode-leaf'

export const directiveContainer: (pattern: Pattern) => Construct = (
  pattern
) => {
  const tokenizeDirectiveContainer: Tokenizer = function (effects, ook, nnok) {
    // eslint-disable-next-line
    const self = this
    const tail = self.events[self.events.length - 1]
    const initialSize =
      tail && tail[1].type === types.linePrefix
        ? tail[2].sliceSerialize(tail[1], true).length
        : 0
    let previous: Token
    let startSequenceIndex = 1
    let closeStartSequenceIndex = 0
    let endNameIndex = 0
    let endSequenceIndex = 0
    let closeEndSequenceIndex = 0

    const ok: State = function (code) {
      return ook(code)
    }
    const nok: State = function (code) {
      // console.trace()
      return nnok(code)
    }

    const start: State = function (code) {
      const firstCharacter = pattern.start[0]
      if (findCode(firstCharacter) === code) {
        effects.enter('directiveContainer')
        effects.enter('directiveContainerFence')
        effects.enter('directiveContainerSequence')
        effects.consume(code)
        return sequenceOpen(code)
      }
      return nok(code)
    }

    const sequenceOpen: State = function (code) {
      const nextCharacter = pattern.start[startSequenceIndex]
      if (findCode(nextCharacter) === code) {
        effects.consume(code)
        startSequenceIndex++
        return sequenceOpen
      }

      if (startSequenceIndex < pattern.start.length) {
        return nok(code)
      }

      effects.exit('directiveContainerSequence')
      return factorName(code)
    }
    const factorName: State = (code) => {
      if (markdownSpace(code)) {
        return factorySpace(effects, factorName, types.whitespace)(code)
      }
      return factoryName.call(
        self,
        effects,
        afterName,
        nok,
        'directiveContainerName',
        pattern.name || pattern.templateName
      )(code)
    }

    const afterName: State = function (code) {
      if (markdownSpace(code)) {
        return factorySpace(effects, afterName, types.whitespace)(code)
      }
      if (markdownLineEnding(code)) {
        return nok
      }
      return startAttributes
    }

    const startAttributes: State = function (code) {
      const nextCharacter = pattern.end[endSequenceIndex]
      if (findCode(nextCharacter) === code) {
        return afterAttributes(code)
      }
      return effects.attempt(attributes, afterAttributes, afterAttributes)(code)
    }

    const afterAttributes: State = function (code) {
      const nextCharacter = pattern.end[endSequenceIndex]
      if (code === codes.eof) {
        return nok
      }
      if (findCode(nextCharacter) === code) {
        effects.consume(code)
        endSequenceIndex++
        return afterAttributes
      }
      if (pattern.end.length === endSequenceIndex) {
        return factorySpace(effects, openAfter, types.whitespace)(code)
      }
      return nok
    }

    const openAfter: State = function (code) {
      effects.exit('directiveContainerFence')

      if (code === codes.eof) {
        return afterOpening(code)
      }

      if (markdownLineEnding(code)) {
        if (self.interrupt) {
          // return ok(code)
          return nok(code)
        }

        return effects.attempt(nonLazyLine, contentStart, afterOpening)(code)
      }

      return nok(code)
    }

    const afterOpening: State = function (code) {
      // effects.exit('directiveContainer')
      return nok(code)
    }

    const contentStart: State = function (code) {
      if (code === codes.eof) {
        return nok(code)
      }

      effects.enter('directiveContainerContent')
      return lineStart(code)
    }

    const lineStart: State = function (code) {
      // If we arrive at the end of the file without finding a
      // closing sequence, don't make it a shortcode
      if (code === codes.eof) {
        return nok(code)
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
        return nok(code)
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
        // return after(code)
        return nok(code)
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
      const closingPrefixAfter: State = function (code) {
        effects.enter('directiveContainerFence')
        effects.enter('directiveContainerSequence')
        return closingSequence(code)
      }

      const closingSequence: State = function (code) {
        const nextCharacter = pattern.start[closeStartSequenceIndex]
        if (findCode(nextCharacter) === code) {
          effects.consume(code)
          closeStartSequenceIndex++
          return closingSequence
        }

        if (closeStartSequenceIndex < pattern.end.length - 1) {
          return nok(code)
        }
        effects.exit('directiveContainerSequence')
        return factorySpace(
          effects,
          closingSequenceNameStart,
          types.whitespace
        )(code)
      }

      const closingSequenceName: State = function (code) {
        const patternName = pattern.name || pattern.templateName
        const nextCharacter = patternName[endNameIndex]
        if (code === codes.eof) {
          return nok
        }
        if (markdownLineEnding(code)) {
          return nok
        }

        if (findCode(nextCharacter) === code) {
          effects.consume(code)
          endNameIndex++
          return closingSequenceName
        }
        if (patternName.length === endNameIndex) {
          return closingSequenceEnd
        }
        return nok
      }
      const closingSequenceNameStart: State = function (code) {
        if (markdownSpace(code)) {
          return factorySpace(
            effects,
            closingSequenceNameStart,
            types.whitespace
          )
        }
        if (code === codes.slash) {
          effects.consume(code)
          return closingSequenceName
        }

        return nok(code)
      }

      const closingSequenceEnd: State = function (code) {
        if (markdownSpace(code)) {
          return factorySpace(effects, closingSequenceEnd, types.whitespace)
        }
        if (code === codes.eof) {
          return nok
        }
        if (pattern.end.length - 1 === closeEndSequenceIndex) {
          effects.exit('directiveContainerFence')
          return ok(code)
        }
        const nextCharacter = pattern.end[closeEndSequenceIndex]
        if (findCode(nextCharacter) === code) {
          effects.consume(code)
          closeEndSequenceIndex++
          return closingSequenceEnd
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
    // eslint-disable-next-line
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

  const attributes = { tokenize: tokenizeAttributes, partial: true }
  const nonLazyLine = { tokenize: tokenizeNonLazyLine, partial: true }
  return {
    tokenize: tokenizeDirectiveContainer,
    concrete: true,
  }
}
