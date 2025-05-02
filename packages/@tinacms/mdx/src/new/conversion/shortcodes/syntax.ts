import { jsxText } from './jsx-text'
import { jsxFlow } from './jsx-flow'
import { findCode } from './util'
import type { Construct, Extension } from 'micromark-util-types'
import type { Acorn, AcornOptions } from 'micromark-factory-mdx-expression'

export type Pattern = {
  start: string
  end: string
  name: string
  templateName: string
  type: 'inline' | 'flow'
  leaf: boolean
}

export type Options = {
  acorn?: Acorn
  acornOptions?: AcornOptions
  patterns?: Pattern[]
  addResult?: boolean
  skipHTML?: boolean
}

export function mdxJsx(options: Options = {}): Extension {
  const acorn = options.acorn
  /** @type {AcornOptions|undefined} */
  let acornOptions: AcornOptions | undefined

  if (acorn) {
    if (!acorn.parse || !acorn.parseExpressionAt) {
      throw new Error(
        'Expected a proper `acorn` instance passed in as `options.acorn`'
      )
    }

    acornOptions = Object.assign(
      { ecmaVersion: 2020, sourceType: 'module' },
      options.acornOptions,
      { locations: true }
    )
  } else if (options.acornOptions || options.addResult) {
    throw new Error('Expected an `acorn` instance passed in as `options.acorn`')
  }

  const patterns = options.patterns || []

  const flowRules: Record<string, Construct[]> = {}
  const textRules: Record<string, Construct[]> = {}
  patterns.forEach((pattern) => {
    const firstCharacter = findCode(pattern.start[0])?.toString()
    if (!firstCharacter) {
      return
    }

    if (pattern.type === 'flow') {
      const existing = flowRules[firstCharacter]
      flowRules[firstCharacter] = existing
        ? [
            ...existing,
            jsxFlow(acorn, acornOptions, options.addResult, pattern),
          ]
        : [jsxFlow(acorn, acornOptions, options.addResult, pattern)]
    } else {
      const existing = textRules[firstCharacter]
      textRules[firstCharacter] = existing
        ? [
            ...existing,
            jsxText(acorn, acornOptions, options.addResult, pattern),
          ]
        : [jsxText(acorn, acornOptions, options.addResult, pattern)]
    }
  })

  let disabledTokens: string[] = []
  if (options.skipHTML) {
    disabledTokens = ['htmlFlow', 'htmlText']
  }
  return {
    flow: flowRules,
    text: textRules,
    disable: { null: disabledTokens },
  }
}
