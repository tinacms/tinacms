import type { Directive } from './types'
import type {
  CompileContext,
  Extension as FromMarkdownExtension,
  Handle as FromMarkdownHandle,
  Token,
} from 'mdast-util-from-markdown'
import { parseEntities } from 'parse-entities'

const enterContainer: FromMarkdownHandle = function (token) {
  enter.call(this, 'containerDirective', token)
}

const enterLeaf: FromMarkdownHandle = function (token) {
  enter.call(this, 'leafDirective', token)
}

const enterText: FromMarkdownHandle = function (token) {
  enter.call(this, 'textDirective', token)
}

const enter = function (
  this: CompileContext,
  type: 'containerDirective' | 'leafDirective' | 'textDirective',
  token: Token
) {
  this.enter({ type, name: '', attributes: {}, children: [] }, token)
}

function exitName(this: CompileContext, token: Token) {
  const node = this.stack[this.stack.length - 1] as Directive
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
    const item = list[list.length - 1]
    if (item) {
      item[1] = parseEntities(this.sliceSerialize(token), {
        attribute: true,
      })
    }
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

      if (attribute) {
        if (attribute[0] === 'class' && cleaned.class) {
          cleaned.class += ' ' + attribute[1]
        } else {
          cleaned[attribute[0]] = attribute[1]
        }
      }
    }
  }

  this.setData('directiveAttributes')
  this.resume() // Drop EOLs
  const node = this.stack[this.stack.length - 1] as Directive
  node.attributes = cleaned
}

function exit(this: CompileContext, token: Token) {
  this.exit(token)
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
