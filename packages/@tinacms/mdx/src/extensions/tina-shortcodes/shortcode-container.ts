import { codes } from 'micromark-util-symbol/codes'
import type { Construct, Tokenizer, State, Code } from 'micromark-util-types'
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character'
import { factorySpace } from 'micromark-factory-space'
import { types } from 'micromark-util-symbol/types'
import { values } from 'micromark-util-symbol/values'
import { factoryWhitespace } from 'micromark-factory-whitespace'
import type { Pattern } from '../../stringify'

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
const printCode = (num: number) => {
  let lookupValue: string | null = null
  Object.entries(codes).forEach(([key, value]) => {
    if (value === num) {
      lookupValue = key
    }
  })
  console.log(lookupValue)
}

const tokenizeDirective = function (pattern: Pattern) {
  // This should be passed in as an arg
  const startPattern = pattern.start
  const endPattern = pattern.end
  const patternName = pattern.name || pattern.templateName
  const tokenizedirectiveContainer: Tokenizer = function (effects, ok, nok) {
    // Assigning global this to self
    // eslint-disable-next-line
    const self = this
    const logSelf = () => {
      self.events.forEach((e) => {
        console.log(`${e[0]} - ${e[1].type}`)
      })
    }
    if (pattern.type === 'leaf') {
      return nok
    }

    let startIndex = 0
    let endIndex = 0
    let nameIndex = 0

    const start: State = function (code) {
      effects.enter('shortcode', { pattern })
      effects.enter('shortcodeOpen')
      effects.consume(code)
      if (startPattern.length - 1 === startIndex) {
        effects.exit('shortcodeOpen')
        return startName
      } else {
        startIndex = startIndex + 1
        return startSequence
      }
    }

    const startSequence: State = function (code) {
      const nextItem = startPattern[startIndex]
      if (code === findCode(nextItem)) {
        effects.consume(code)
        if (startPattern.length - 1 === startIndex) {
          effects.exit('shortcodeOpen')
          return startName
        } else {
          startIndex = startIndex + 1
          return startSequence
        }
      }

      return nok(code)
    }

    const startName: State = function (code) {
      if (markdownSpace(code)) {
        return factorySpace(effects, startName, types.whitespace)(code)
      }
      const firstCharacter = patternName[nameIndex]
      if (code === findCode(firstCharacter)) {
        if (asciiAlpha(code)) {
          nameIndex = nameIndex + 1
          effects.enter('shortcodeName')
          effects.consume(code)
          return nameName
        }
      }

      return nok(code)
    }

    const nameName: State = function (code) {
      if (
        code === codes.dash ||
        code === codes.underscore ||
        asciiAlphanumeric(code)
      ) {
        const nextCharacter = patternName[nameIndex]
        if (code === findCode(nextCharacter)) {
          nameIndex = nameIndex + 1
          effects.consume(code)
          return nameName
        }
      }

      effects.exit('shortcodeName')
      return self.previous === codes.dash || self.previous === codes.underscore
        ? nok(code)
        : attributes(code)
    }

    const attributes: State = function (code) {
      if (markdownSpace(code)) {
        return factorySpace(effects, attributes, types.whitespace)(code)
      }
      if (
        code === codes.dash ||
        code === codes.underscore ||
        code === codes.quotationMark ||
        asciiAlphanumeric(code)
      ) {
        return between(code)
      }
      if (code === findCode(endPattern[endIndex])) {
        effects.enter('shortcodeClose')
        effects.consume(code)
        if (endPattern.length - 1 === endIndex) {
          effects.exit('shortcodeClose')
          return end
        } else {
          endIndex = endIndex + 1
          return endSequence
        }
      }
      return nok(code)
    }

    // TODO: this breaks the attributes, same logic
    // needed over there
    const endSequence: State = function (code) {
      const nextItem = endPattern[endIndex]
      if (code === findCode(nextItem)) {
        effects.consume(code)
        if (endPattern.length - 1 === endIndex) {
          effects.exit('shortcodeClose')
          return end
        } else {
          endIndex = endIndex + 1
          return endSequence
        }
      }

      return nok(code)
    }
    const end: State = function (code) {
      // TODO: not supporting other text on this line
      if (code === codes.eof || markdownLineEnding(code)) {
        effects.exit('shortcode')
        return ok(code)
      }

      return nok(code)
    }

    const okInside = end
    const between: State = function (code) {
      const disallowEol = true
      let marker: Code | undefined

      const end: State = function (code) {
        const nextItem = endPattern[endIndex]
        if (code === findCode(nextItem)) {
          if (endPattern.length - 1 === endIndex) {
            effects.enter('directiveContainerAttributesMarker')
            effects.consume(code)
            effects.exit('directiveContainerAttributesMarker')
            effects.exit('directiveContainerAttributes')
            effects.exit('shortcodeClose')
            return okInside
          } else {
            effects.exit('directiveContainerAttributes')
            effects.enter('shortcodeClose')
            effects.consume(code)
            endIndex = endIndex + 1
            return endSequence
          }
        }

        return nok(code)
      }

      const valueQuotedAfter: State = function (code) {
        return code === codes.rightCurlyBrace || markdownLineEndingOrSpace(code)
          ? between(code)
          : end(code)
      }
      const valueQuoted: State = function (code) {
        if (code === marker || code === codes.eof || markdownLineEnding(code)) {
          effects.exit('directiveContainerAttributeValueData')
          return valueQuotedBetween(code)
        }

        effects.consume(code)
        return valueQuoted
      }
      const valueQuotedBetween: State = function (code) {
        if (code === marker) {
          effects.exit('directiveContainerAttributeValue')
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

        effects.enter('directiveContainerAttributeValueData')
        effects.consume(code)
        return valueQuoted
      }

      const valueQuotedStart: State = function (code) {
        if (code === marker) {
          effects.enter('directiveContainerAttributeValueMarker')
          effects.consume(code)
          effects.exit('directiveContainerAttributeValueMarker')
          effects.exit('directiveContainerAttributeValueLiteral')
          effects.exit('directiveContainerAttribute')
          return valueQuotedAfter
        }

        effects.enter('directiveContainerAttributeValue')
        return valueQuotedBetween(code)
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
          effects.exit('directiveContainerAttributeValueData')
          effects.exit('directiveContainerAttributeValue')
          effects.exit('directiveContainerAttribute')
          return between(code)
        }

        effects.consume(code)
        return valueUnquoted
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
          effects.enter('directiveContainerAttributeValueLiteral')
          effects.enter('directiveContainerAttributeValueMarker')
          effects.consume(code)
          effects.exit('directiveContainerAttributeValueMarker')
          marker = code
          return valueQuotedStart
        }

        if (disallowEol && markdownSpace(code)) {
          return factorySpace(effects, valueBefore, types.whitespace)(code)
        }

        if (!disallowEol && markdownLineEndingOrSpace(code)) {
          return factoryWhitespace(effects, valueBefore)(code)
        }

        effects.enter('directiveContainerAttributeValue')
        effects.enter('directiveContainerAttributeValueData')
        effects.consume(code)
        marker = undefined
        return valueUnquoted
      }

      const nameAfter: State = function (code) {
        if (code === codes.equalsTo) {
          effects.enter('directiveContainerAttributeInitializerMarker')
          effects.consume(code)
          effects.exit('directiveContainerAttributeInitializerMarker')
          return valueBefore
        }

        // Attribute w/o value.
        effects.exit('directiveContainerAttribute')
        return between(code)
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

        effects.exit('directiveContainerAttributeName')

        if (disallowEol && markdownSpace(code)) {
          return factorySpace(effects, nameAfter, types.whitespace)(code)
        }

        if (!disallowEol && markdownLineEndingOrSpace(code)) {
          return factoryWhitespace(effects, nameAfter)(code)
        }

        return nameAfter(code)
      }

      const between: State = function (code) {
        if (
          code === codes.colon ||
          code === codes.underscore ||
          asciiAlpha(code)
        ) {
          effects.enter('directiveContainerAttribute')
          effects.enter('directiveContainerAttributeName')
          effects.consume(code)
          return name
        }
        if (code === codes.quotationMark) {
          effects.enter('directiveContainerAttribute')
          effects.enter('directiveContainerAttributeName')
          effects.exit('directiveContainerAttributeName')
          effects.enter('directiveContainerAttributeInitializerMarker')
          effects.exit('directiveContainerAttributeInitializerMarker')
          return valueBefore(code)
        }

        if (disallowEol && markdownSpace(code)) {
          return factorySpace(effects, between, types.whitespace)(code)
        }

        if (!disallowEol && markdownLineEndingOrSpace(code)) {
          return factoryWhitespace(effects, between)(code)
        }

        return end(code)
      }

      const start: State = function (code) {
        effects.enter('directiveContainerAttributes')
        return between(code)
      }
      return start(code)
    }

    return start
  }
  return tokenizedirectiveContainer
}

export const directiveContainer: (pattern: Pattern) => Construct = function (
  pattern
) {
  return { tokenize: tokenizeDirective(pattern) }
}
