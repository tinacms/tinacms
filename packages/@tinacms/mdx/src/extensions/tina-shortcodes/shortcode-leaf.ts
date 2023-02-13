import type { Pattern } from '../../stringify'
import type { Construct, Tokenizer, State } from 'micromark-util-types'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { values } from 'micromark-util-symbol/values'
import { types } from 'micromark-util-symbol/types'
import { factoryAttributes } from './factory-attributes'
import { factoryName } from './factory-name'

const findValue = (string: string): string | null => {
  let lookupValue: string | null = null
  Object.entries(values).forEach(([key, value]) => {
    if (value === string) {
      lookupValue = key
    }
  })
  return lookupValue
}
export const findCode = (string: string | undefined | null): number | null => {
  if (!string) {
    return null
  }
  const lookup = findValue(string)
  let lookupValue: number | null = null
  if (lookup) {
    Object.entries(codes).forEach(([key, value]) => {
      if (key === lookup) {
        lookupValue = value
      }
    })
  }
  return lookupValue
}
export const printCode = (num: number) => {
  let lookupValue: string | null = null
  Object.entries(codes).forEach(([key, value]) => {
    if (value === num) {
      lookupValue = key
    }
  })
  console.log(lookupValue)
}

export const directiveLeaf: (pattern: Pattern) => Construct = (pattern) => {
  const tokenizeDirectiveLeaf: Tokenizer = function (effects, ook, nnok) {
    // eslint-disable-next-line
    const self = this
    let startSequenceIndex = 1
    let endSequenceIndex = 0

    const ok: State = function (code) {
      return ook(code)
    }
    const nok: State = function (code) {
      return nnok(code)
    }

    const start: State = function (code) {
      const firstCharacter = pattern.start[0]
      if (findCode(firstCharacter) === code) {
        effects.enter('directiveLeaf')
        effects.enter('directiveLeafFence')
        effects.enter('directiveLeafSequence')
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

      effects.exit('directiveLeafSequence')
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
        'directiveLeafName',
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
    const end: State = function (code) {
      effects.exit('directiveLeafFence')
      effects.exit('directiveLeaf')
      return ok(code)
    }

    const afterAttributes: State = function (code) {
      const nextCharacter = pattern.end[endSequenceIndex]
      if (pattern.end.length === endSequenceIndex) {
        return factorySpace(effects, end, types.whitespace)(code)
      }
      if (code === codes.eof) {
        return nok
      }
      if (findCode(nextCharacter) === code) {
        effects.consume(code)
        endSequenceIndex++
        return afterAttributes
      }
      return nok
    }

    return start
  }

  const tokenizeAttributes: Tokenizer = function (effects, ok, nok) {
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

  const attributes = { tokenize: tokenizeAttributes, partial: true }
  return {
    tokenize: tokenizeDirectiveLeaf,
  }
}
