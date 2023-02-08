import type {
  Directive,
  LeafDirective,
  TextDirective,
} from '../directive/types'
import type { BlockContent, DefinitionContent, Paragraph } from 'mdast'
import type {
  Handle as ToMarkdownHandle,
  Options as ToMarkdownExtension,
} from 'mdast-util-to-markdown'
import { stringifyEntitiesLight } from 'stringify-entities'
import { visitParents } from 'unist-util-visit-parents'
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow'
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing'
import { checkQuote } from 'mdast-util-to-markdown/lib/util/check-quote'
import { track } from 'mdast-util-to-markdown/lib/util/track'
import { Pattern } from '../../stringify'
import { ConstructName } from 'mdast-util-directive/lib'
import { MdxJsxAttribute } from 'mdast-util-mdx-jsx'
import { MdxJsxExpressionAttribute } from 'mdast-util-mdx'
import { State } from 'micromark-util-types'

const own = {}.hasOwnProperty

const shortcut = /^[^\t\n\r "#'.<=>`}]+$/

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
      return
    }
    const patternName = pattern.name || pattern.templateName

    const sequence = pattern.start
    let value = tracker.move(sequence + ' ' + patternName)
    let label: Paragraph | LeafDirective | TextDirective | undefined

    // if (node.type === 'containerDirective') {
    //   const head = (node.children || [])[0]
    //   label = inlineDirectiveLabel(head) ? head : undefined
    // } else {
    //   label = node
    // }

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
      value += tracker.move(' \\' + patternName + ' ' + pattern.end)
    }

    exit()
    return value
  }
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
  const attrs: Record<string, string> = {}
  // These are actually "mdxJsxAttribute" until we support directives properly
  node.attributes.forEach((att: MdxJsxAttribute) => {
    if (att.value && typeof att.value === 'string') {
      attrs[att.name] = att.value
    }
  })
  // const attrs = node.attributes || {}
  /** @type {Array<string>} */
  const values = []
  /** @type {string | undefined} */
  let classesFull
  /** @type {string | undefined} */
  let classes
  /** @type {string | undefined} */
  let id
  /** @type {string} */
  let key

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
    return (
      key +
      (value
        ? '=' + quote + stringifyEntitiesLight(value, { subset }) + quote
        : '')
    )
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

handleDirective.peek = peekDirective
