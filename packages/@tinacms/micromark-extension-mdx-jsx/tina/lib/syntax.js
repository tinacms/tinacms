/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-factory-mdx-expression').Acorn} Acorn
 * @typedef {import('micromark-factory-mdx-expression').AcornOptions} AcornOptions
 */

/**
 * @typedef Options
 *   Configuration (optional).
 * @property {Acorn} [acorn]
 *   Acorn parser to use.
 * @property {AcornOptions} [acornOptions]
 *   Options to pass to acorn (default: `{ecmaVersion: 2020, sourceType:
 *   'module'}`).
 *   All fields can be set.
 *   Positional info (`loc`, `range`) is set on ES nodes regardless of acorn
 *   options.
 * @property {boolean} [addResult=false]
 *   Whether to add an `estree` field to the `mdxTextJsx` and `mdxFlowJsx`
 *   tokens with the results from acorn.
 */

import {codes} from 'micromark-util-symbol/codes.js'
import {jsxText} from './jsx-text.js'
import {jsxFlow} from './jsx-flow.js'
import {findCode} from './util'

/**
 * @param {Options} [options]
 * @returns {Extension}
 */
export function mdxJsx(options = {}) {
  const acorn = options.acorn
  /** @type {AcornOptions|undefined} */
  let acornOptions

  if (acorn) {
    if (!acorn.parse || !acorn.parseExpressionAt) {
      throw new Error(
        'Expected a proper `acorn` instance passed in as `options.acorn`'
      )
    }

    acornOptions = Object.assign(
      {ecmaVersion: 2020, sourceType: 'module'},
      options.acornOptions,
      {locations: true}
    )
  } else if (options.acornOptions || options.addResult) {
    throw new Error('Expected an `acorn` instance passed in as `options.acorn`')
  }

  const patterns = options.patterns || []

  const flowRules = {}
  const textRules = {}
  patterns.forEach((pattern) => {
    const firstCharacter = findCode(pattern.start[0])

    if (pattern.type === 'flow') {
      flowRules[firstCharacter] = flowRules[firstCharacter]
        ? [
            ...flowRules[firstCharacter],
            jsxFlow(acorn, acornOptions, options.addResult, pattern)
          ]
        : [jsxFlow(acorn, acornOptions, options.addResult, pattern)]
    } else {
      textRules[firstCharacter] = textRules[firstCharacter]
        ? [
            ...textRules[firstCharacter],
            jsxText(acorn, acornOptions, options.addResult, pattern)
          ]
        : [jsxText(acorn, acornOptions, options.addResult, pattern)]
    }
  })

  return {
    flow: flowRules,
    text: textRules
  }
}