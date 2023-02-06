import type { Directive, LeafDirective, TextDirective } from './types'
import type { BlockContent, DefinitionContent, Paragraph } from 'mdast'
import type {
  CompileContext,
  Extension as FromMarkdownExtension,
  Handle as FromMarkdownHandle,
  Token,
} from 'mdast-util-from-markdown'
import { parseEntities } from 'parse-entities'
import { stringifyEntitiesLight } from 'stringify-entities'
import { visitParents } from 'unist-util-visit-parents'
import { checkQuote } from 'mdast-util-to-markdown/lib/util/check-quote'

const own = {}.hasOwnProperty

const shortcut = /^[^\t\n\r "#'.<=>`}]+$/

const enterContainer: FromMarkdownHandle = function (token) {
  enter.call(this, 'containerDirective', token)
}

const enterLeaf: FromMarkdownHandle = function (token) {
  enter.call(this, 'leafDirective', token)
}

const enterText: FromMarkdownHandle = function (token) {
  enter.call(this, 'textDirective', token)
}

const enter = function (this: CompileContext, type: Directive, token: Token) {
  this.enter({ type, name: '', attributes: {}, children: [] }, token)
}

function exitName(this: CompileContext, token: Token) {
  const node: Directive = this.stack[this.stack.length - 1]
  node.name = this.sliceSerialize(token)
}

const enterContainerLabel: FromMarkdownHandle = function (token) {
  this.enter(
    { type: 'paragraph', data: { directiveLabel: true }, children: [] },
    token
  )
}

const exitContainerLabel: FromMarkdownHandle = function (token) {
  this.exit(token)
}

const enterAttributes: FromMarkdownHandle = function () {
  this.setData('directiveAttributes', [])
  this.buffer() // Capture EOLs
}

const exitAttributeIdValue: FromMarkdownHandle = function (token) {
  const list = this.getData('directiveAttributes')
  if (list) {
    list.push([
      'id',
      parseEntities(this.sliceSerialize(token), {
        attribute: true,
      }),
    ])
  }
}

const exitAttributeClassValue: FromMarkdownHandle = function (token) {
  const list = this.getData('directiveAttributes')
  if (list) {
    list.push([
      'class',
      parseEntities(this.sliceSerialize(token), {
        attribute: true,
      }),
    ])
  }
}

const exitAttributeValue: FromMarkdownHandle = function (token) {
  const list = this.getData('directiveAttributes')
  if (list) {
    list[list.length - 1][1] = parseEntities(this.sliceSerialize(token), {
      attribute: true,
    })
  }
}

const exitAttributeName: FromMarkdownHandle = function (token) {
  const list = this.getData('directiveAttributes')

  // Attribute names in CommonMark are significantly limited, so character
  // references can’t exist.
  if (list) {
    const name = this.sliceSerialize(token)
    if (!name) {
      list.push(['_value', ''])
    } else {
      list.push([this.sliceSerialize(token), ''])
    }
  }
}

function exitAttributes(this: CompileContext) {
  const list = this.getData('directiveAttributes')
  const cleaned: Record<string, string> = {}
  let index = -1

  if (list) {
    while (++index < list.length) {
      const attribute = list[index]

      if (attribute[0] === 'class' && cleaned.class) {
        cleaned.class += ' ' + attribute[1]
      } else {
        cleaned[attribute[0]] = attribute[1]
      }
    }
  }

  this.setData('directiveAttributes')
  this.resume() // Drop EOLs
  const node: Directive = this.stack[this.stack.length - 1]
  node.attributes = cleaned
}

function exit(token: Token) {
  this.exit(token)
}

function attributes(node: Directive, state: State): string {
  const quote = checkQuote(state)
  const subset = node.type === 'textDirective' ? [quote] : [quote, '\n', '\r']
  const attrs = node.attributes || {}
  const values: string[] = []
  let classesFull: string | undefined
  let classes: string | undefined
  let id: string | undefined
  let key: string

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
        const classesFullList: string[] = []
        const classesList: string[] = []
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

  function quoted(key: string, value: string): string {
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

export const directiveFromMarkdown: FromMarkdownExtension = {
  canContainEols: ['textDirective'],
  enter: {
    directiveContainer: enterContainer,
    directiveContainerAttributes: enterAttributes,
    directiveContainerLabel: enterContainerLabel,

    directiveLeaf: enterLeaf,
    directiveLeafAttributes: enterAttributes,

    directiveText: enterText,
    directiveTextAttributes: enterAttributes,
  },
  exit: {
    directiveContainer: exit,
    directiveContainerAttributeClassValue: exitAttributeClassValue,
    directiveContainerAttributeIdValue: exitAttributeIdValue,
    directiveContainerAttributeName: exitAttributeName,
    directiveContainerAttributeValue: exitAttributeValue,
    directiveContainerAttributes: exitAttributes,
    directiveContainerLabel: exitContainerLabel,
    directiveContainerName: exitName,

    directiveLeaf: exit,
    directiveLeafAttributeClassValue: exitAttributeClassValue,
    directiveLeafAttributeIdValue: exitAttributeIdValue,
    directiveLeafAttributeName: exitAttributeName,
    directiveLeafAttributeValue: exitAttributeValue,
    directiveLeafAttributes: exitAttributes,
    directiveLeafName: exitName,

    directiveText: exit,
    directiveTextAttributeClassValue: exitAttributeClassValue,
    directiveTextAttributeIdValue: exitAttributeIdValue,
    directiveTextAttributeName: exitAttributeName,
    directiveTextAttributeValue: exitAttributeValue,
    directiveTextAttributes: exitAttributes,
    directiveTextName: exitName,
  },
}
