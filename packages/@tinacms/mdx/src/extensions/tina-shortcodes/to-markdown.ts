import type { Directive, LeafDirective, TextDirective } from './types'
import type { BlockContent, DefinitionContent, Paragraph } from 'mdast'
import type {
  Handle as ToMarkdownHandle,
  Options as ToMarkdownExtension,
} from 'mdast-util-to-markdown'
import { stringifyEntitiesLight } from 'stringify-entities'
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow'
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing'
import { checkQuote } from 'mdast-util-to-markdown/lib/util/check-quote'
import { track } from 'mdast-util-to-markdown/lib/util/track'
import { Pattern } from '../../stringify'
import { ConstructName } from 'mdast-util-directive/lib'
import { Context as State } from 'mdast-util-to-markdown'

const own = {}.hasOwnProperty

export const directiveToMarkdown: (
  patterns: Pattern[]
) => ToMarkdownExtension = (patterns) => ({
  unsafe: [
    {
      character: '\r',
      inConstruct: ['leafDirectiveLabel', 'containerDirectiveLabel'],
    },
    {
      character: '\n',
      inConstruct: ['leafDirectiveLabel', 'containerDirectiveLabel'],
    },
    {
      before: '[^:]',
      character: ':',
      after: '[A-Za-z]',
      inConstruct: ['phrasing'],
    },
    { atBreak: true, character: ':', after: ':' },
  ],
  handlers: {
    containerDirective: handleDirective(patterns),
    leafDirective: handleDirective(patterns),
    textDirective: handleDirective(patterns),
  },
})

const handleDirective: (patterns: Pattern[]) => ToMarkdownHandle = function (
  patterns
) {
  const handleDirective: ToMarkdownHandle = function (
    node,
    _,
    state,
    safeOptions
  ) {
    const tracker = track(safeOptions)
    const exit = state.enter(node.type)
    const pattern = patterns.find(
      (p) => p.name === node.name || p.templateName === node.name
    )
    if (!pattern) {
      console.log('no pattern found for directive', node.name)
      exit()
      return ''
    }
    const patternName = pattern.name || pattern.templateName

    const sequence = pattern.start
    let value = tracker.move(sequence + ' ' + patternName)
    let label: Paragraph | LeafDirective | TextDirective | undefined

    if (label && label.children && label.children.length > 0) {
      const exit = state.enter('label')
      const labelType = `${node.type}Label` as ConstructName
      const subexit = state.enter(labelType)
      value += tracker.move('[')
      value += tracker.move(
        containerPhrasing(label, state, {
          ...tracker.current(),
          before: value,
          after: ']',
        })
      )
      value += tracker.move(']')
      subexit()
      exit()
    }

    value += tracker.move(' ')
    value += tracker.move(attributes(node, state))
    value += tracker.move(pattern.end)

    if (node.type === 'containerDirective') {
      const head = (node.children || [])[0]
      let shallow = node

      if (inlineDirectiveLabel(head)) {
        shallow = Object.assign({}, node, { children: node.children.slice(1) })
      }

      if (shallow && shallow.children && shallow.children.length > 0) {
        value += tracker.move('\n')
        value += tracker.move(containerFlow(shallow, state, tracker.current()))
      }

      value += tracker.move('\n' + sequence)
      value += tracker.move(' /' + patternName + ' ' + pattern.end)
    }

    exit()
    return value
  }

  // @ts-ignore Property does not exist on type Handle
  // Not sure what this does!
  handleDirective.peek = peekDirective
  return handleDirective
}

/** @type {ToMarkdownHandle} */
function peekDirective() {
  return ':'
}

/**
 * @param {Directive} node
 * @param {State} state
 * @returns {string}
 */
function attributes(node: Directive, state: State): string {
  const quote = checkQuote(state)
  const subset = node.type === 'textDirective' ? [quote] : [quote, '\n', '\r']
  const attrs = node.attributes || {}
  const values: string[] = []
  let key: string

  for (key in attrs) {
    if (
      own.call(attrs, key) &&
      attrs[key] !== undefined &&
      attrs[key] !== null
    ) {
      const value = String(attrs[key])

      values.push(quoted(key, value))
    }
  }

  return values.length > 0 ? values.join(' ') + ' ' : ''

  /**
   * @param {string} key
   * @param {string} value
   * @returns {string}
   */
  function quoted(key: string, value: string) {
    const v = quote + stringifyEntitiesLight(value, { subset }) + quote
    if (key === '_value') {
      return v
    }
    return key + (value ? '=' + v : '')
  }
}

/**
 * @param {BlockContent | DefinitionContent} node
 * @returns {node is Paragraph & {data: {directiveLabel: boolean}}}
 */
function inlineDirectiveLabel(node: BlockContent | DefinitionContent) {
  return Boolean(
    node && node.type === 'paragraph' && node.data && node.data.directiveLabel
  )
}
