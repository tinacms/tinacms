import type { Directive, LeafDirective, TextDirective } from './types'
import type { BlockContent, DefinitionContent, Paragraph } from 'mdast'
import type {
  CompileContext,
  Extension as FromMarkdownExtension,
  Handle as FromMarkdownHandle,
  Token,
} from 'mdast-util-from-markdown'
import type {
  ConstructName,
  Handle as ToMarkdownHandle,
  Options as ToMarkdownExtension,
  State,
} from 'mdast-util-to-markdown'
import { parseEntities } from 'parse-entities'
import { stringifyEntitiesLight } from 'stringify-entities'
import { visitParents } from 'unist-util-visit-parents'
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow'
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing'
import { checkQuote } from 'mdast-util-to-markdown/lib/util/check-quote'
import { track } from 'mdast-util-to-markdown/lib/util/track'

// To do: next major: replace `containerFlow`, `containerPhrasing`, `track`
// with `state` methods.
// To do: next major: expose functions.

const own = {}.hasOwnProperty

const shortcut = /^[^\t\n\r "#'.<=>`}]+$/

/**
 * Extension for `mdast-util-to-markdown` to enable directives.
 *
 * @type {ToMarkdownExtension}
 */
export const directiveToMarkdown: ToMarkdownExtension = {
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
    containerDirective: handleDirective,
    leafDirective: handleDirective,
    textDirective: handleDirective,
  },
}

/**
 * @type {ToMarkdownHandle}
 * @param {Directive} node
 */
function handleDirective(node, _, state, safeOptions) {
  const tracker = track(safeOptions)
  const sequence = fence(node)
  const exit = state.enter(node.type)
  let value = tracker.move(sequence + (node.name || ''))
  /** @type {Paragraph | LeafDirective | TextDirective | undefined} */
  let label

  if (node.type === 'containerDirective') {
    const head = (node.children || [])[0]
    label = inlineDirectiveLabel(head) ? head : undefined
  } else {
    label = node
  }

  if (label && label.children && label.children.length > 0) {
    const exit = state.enter('label')
    /** @type {ConstructName} */
    const labelType = `${node.type}Label`
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

  value += tracker.move(attributes(node, state))

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
  }

  exit()
  return value
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

      if (key === 'id') {
        id = shortcut.test(value) ? '#' + value : quoted('id', value)
      } else if (key === 'class') {
        const list = value.split(/[\t\n\r ]+/g)
        /** @type {Array<string>} */
        const classesFullList = []
        /** @type {Array<string>} */
        const classesList = []
        let index = -1

        while (++index < list.length) {
          ;(shortcut.test(list[index]) ? classesList : classesFullList).push(
            list[index]
          )
        }

        classesFull =
          classesFullList.length > 0
            ? quoted('class', classesFullList.join(' '))
            : ''
        classes = classesList.length > 0 ? '.' + classesList.join('.') : ''
      } else {
        values.push(quoted(key, value))
      }
    }
  }

  if (classesFull) {
    values.unshift(classesFull)
  }

  if (classes) {
    values.unshift(classes)
  }

  if (id) {
    values.unshift(id)
  }

  return values.length > 0 ? '{' + values.join(' ') + '}' : ''

  /**
   * @param {string} key
   * @param {string} value
   * @returns {string}
   */
  function quoted(key, value) {
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

/**
 * @param {Directive} node
 * @returns {string}
 */
function fence(node: Directive): string {
  let size = 0

  if (node.type === 'containerDirective') {
    visitParents(node, function (node, parents) {
      if (node.type === 'containerDirective') {
        let index = parents.length
        let nesting = 0

        while (index--) {
          if (parents[index].type === 'containerDirective') {
            nesting++
          }
        }

        if (nesting > size) size = nesting
      }
    })
    size += 3
  } else if (node.type === 'leafDirective') {
    size = 2
  } else {
    size = 1
  }

  return ':'.repeat(size)
}

handleDirective.peek = peekDirective
