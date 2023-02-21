// ../mdx/src/parse/index.ts
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'

// ../mdx/src/next/stringify/to-markdown.ts
import { toMarkdown } from 'mdast-util-to-markdown'
import { text } from 'mdast-util-to-markdown/lib/handle/text'

// ../mdx/src/next/shortcodes/mdast/index.ts
import { ccount } from 'ccount'
import { parseEntities } from 'parse-entities'
import { stringifyPosition } from 'unist-util-stringify-position'
import { VFileMessage } from 'vfile-message'
import { stringifyEntitiesLight } from 'stringify-entities'
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow.js'
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing.js'
import { indentLines } from 'mdast-util-to-markdown/lib/util/indent-lines.js'
import { track } from 'mdast-util-to-markdown/lib/util/track.js'
function mdxJsxFromMarkdown({ patterns }) {
  const buffer = function () {
    this.buffer()
  }
  const data = function (token) {
    this.config?.enter?.data?.call(this, token)
    this.config?.exit?.data?.call(this, token)
  }
  const enterMdxJsxTag = function (token) {
    const tag = {
      name: void 0,
      attributes: [],
      close: false,
      selfClosing: false,
      start: token.start,
      end: token.end,
    }
    if (!this.getData('mdxJsxTagStack')) this.setData('mdxJsxTagStack', [])
    this.setData('mdxJsxTag', tag)
    this.buffer()
  }
  const enterMdxJsxTagClosingMarker = function (token) {
    const stack = this.getData('mdxJsxTagStack')
    const tag = this.getData('mdxJsxTag')
    if (stack?.length === 0) {
      if (tag) {
        tag.shouldFallback = true
      }
    }
  }
  const enterMdxJsxTagAnyAttribute = function (token) {
    const tag = this.getData('mdxJsxTag')
  }
  const enterMdxJsxTagSelfClosingMarker = function (token) {
    const tag = this.getData('mdxJsxTag')
    if (tag?.close) {
      throw new VFileMessage(
        'Unexpected self-closing slash `/` in closing tag, expected the end of the tag',
        { start: token.start, end: token.end },
        'mdast-util-mdx-jsx:unexpected-self-closing-slash'
      )
    }
  }
  const exitMdxJsxTagClosingMarker = function () {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      tag.close = true
    }
  }
  const exitMdxJsxTagNamePrimary = function (token) {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      tag.name = this.sliceSerialize(token)
    }
  }
  const exitMdxJsxTagNameMember = function (token) {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      tag.name += '.' + this.sliceSerialize(token)
    }
  }
  const exitMdxJsxTagNameLocal = function (token) {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      tag.name += ':' + this.sliceSerialize(token)
    }
  }
  const enterMdxJsxTagAttribute = function (token) {
    const tag = this.getData('mdxJsxTag')
    enterMdxJsxTagAnyAttribute.call(this, token)
    if (tag) {
      tag.attributes.push({ type: 'mdxJsxAttribute', name: '', value: null })
    }
  }
  const enterMdxJsxTagExpressionAttribute = function (token) {
    const tag = this.getData('mdxJsxTag')
    enterMdxJsxTagAnyAttribute.call(this, token)
    if (tag) {
      tag.attributes.push({ type: 'mdxJsxExpressionAttribute', value: '' })
    }
    this.buffer()
  }
  const exitMdxJsxTagExpressionAttribute = function (token) {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      const tail = tag.attributes[tag.attributes.length - 1]
      const estree = token.estree
      if (tail) {
        tail.value = this.resume()
        if (estree) {
          tail.data = { estree }
        }
      }
    }
  }
  const exitMdxJsxTagAttributeNamePrimary = function (token) {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      const node = tag.attributes[tag.attributes.length - 1]
      if (node) {
        node.name = this.sliceSerialize(token)
      }
    }
  }
  const exitMdxJsxTagAttributeNameLocal = function (token) {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      const node = tag.attributes[tag.attributes.length - 1]
      if (node) {
        node.name += ':' + this.sliceSerialize(token)
      }
    }
  }
  const exitMdxJsxTagAttributeValueLiteral = function () {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      const attribute = tag.attributes[tag.attributes.length - 1]
      if (attribute) {
        if (attribute.name === '') {
          attribute.name = '_value'
        }
        attribute.value = parseEntities(this.resume(), { nonTerminated: false })
      }
    }
  }
  const exitMdxJsxTagAttributeValueExpression = function (token) {
    const tag = this.getData('mdxJsxTag')
    if (!tag) return
    const tail = tag.attributes[tag.attributes.length - 1]
    const node = {
      type: 'mdxJsxAttributeValueExpression',
      value: this.resume(),
    }
    const estree = token.estree
    if (estree) {
      node.data = { estree }
    }
    if (tail) {
      tail.value = node
    }
  }
  const exitMdxJsxTagSelfClosingMarker = function () {
    const tag = this.getData('mdxJsxTag')
    if (tag) {
      tag.selfClosing = true
    }
  }
  const exitMdxJsxTag = function (token) {
    const tag = this.getData('mdxJsxTag')
    const stack = this.getData('mdxJsxTagStack')
    if (!stack) return
    const tail = stack[stack.length - 1]
    if (!tag) return
    if (tail && tag.close && tail.name !== tag.name) {
      throw new VFileMessage(
        'Unexpected closing tag `' +
          serializeAbbreviatedTag(tag) +
          '`, expected corresponding closing tag for `' +
          serializeAbbreviatedTag(tail) +
          '` (' +
          stringifyPosition(tail) +
          ')',
        { start: token.start, end: token.end },
        'mdast-util-mdx-jsx:end-tag-mismatch'
      )
    }
    this.resume()
    if (tag.close) {
      stack.pop()
    } else {
      const pattern = patterns.find((pattern2) => pattern2.name === tag.name)
      const tagName = pattern?.templateName || tag.name
      this.enter(
        {
          type:
            token.type === 'mdxJsxTextTag'
              ? 'mdxJsxTextElement'
              : 'mdxJsxFlowElement',
          name: tagName || null,
          attributes: tag.attributes,
          children: [],
        },
        token,
        (left, right) => {
          this.exit(right)
        }
      )
    }
    if (tag.selfClosing || tag.close) {
      if (tag.shouldFallback) {
        if (token.type === 'mdxJsxFlowTag') {
          this.enter(
            {
              type: 'paragraph',
              children: [{ type: 'text', value: this.sliceSerialize(token) }],
            },
            token
          )
          this.exit(token)
        } else {
          this.enter(
            {
              type: 'text',
              value: this.sliceSerialize(token),
            },
            token
          )
          this.exit(token)
        }
      } else {
        this.exit(token, onErrorLeftIsTag)
      }
    } else {
      stack.push(tag)
    }
  }
  const onErrorRightIsTag = function (closing, open) {
    const tag = this.getData('mdxJsxTag')
    if (!tag) return
    const place = closing ? ' before the end of `' + closing.type + '`' : ''
    const position = closing
      ? { start: closing.start, end: closing.end }
      : void 0
    throw new VFileMessage(
      'Expected a closing tag for `' +
        serializeAbbreviatedTag(tag) +
        '` (' +
        stringifyPosition({ start: open.start, end: open.end }) +
        ')' +
        place,
      position,
      'mdast-util-mdx-jsx:end-tag-mismatch'
    )
  }
  const onErrorLeftIsTag = function (a, b) {
    const tag = this.getData('mdxJsxTag')
  }
  function serializeAbbreviatedTag(tag) {
    return '<' + (tag.close ? '/' : '') + (tag.name || '') + '>'
  }
  return {
    canContainEols: ['mdxJsxTextElement'],
    enter: {
      mdxJsxFlowTag: enterMdxJsxTag,
      mdxJsxFlowTagClosingMarker: enterMdxJsxTagClosingMarker,
      mdxJsxFlowTagAttribute: enterMdxJsxTagAttribute,
      mdxJsxFlowTagExpressionAttribute: enterMdxJsxTagExpressionAttribute,
      mdxJsxFlowTagAttributeValueLiteral: buffer,
      mdxJsxFlowTagAttributeValueExpression: buffer,
      mdxJsxFlowTagSelfClosingMarker: enterMdxJsxTagSelfClosingMarker,
      mdxJsxTextTag: enterMdxJsxTag,
      mdxJsxTextTagClosingMarker: enterMdxJsxTagClosingMarker,
      mdxJsxTextTagAttribute: enterMdxJsxTagAttribute,
      mdxJsxTextTagExpressionAttribute: enterMdxJsxTagExpressionAttribute,
      mdxJsxTextTagAttributeValueLiteral: buffer,
      mdxJsxTextTagAttributeValueExpression: buffer,
      mdxJsxTextTagSelfClosingMarker: enterMdxJsxTagSelfClosingMarker,
    },
    exit: {
      mdxJsxFlowTagClosingMarker: exitMdxJsxTagClosingMarker,
      mdxJsxFlowTagNamePrimary: exitMdxJsxTagNamePrimary,
      mdxJsxFlowTagNameMember: exitMdxJsxTagNameMember,
      mdxJsxFlowTagNameLocal: exitMdxJsxTagNameLocal,
      mdxJsxFlowTagExpressionAttribute: exitMdxJsxTagExpressionAttribute,
      mdxJsxFlowTagExpressionAttributeValue: data,
      mdxJsxFlowTagAttributeNamePrimary: exitMdxJsxTagAttributeNamePrimary,
      mdxJsxFlowTagAttributeNameLocal: exitMdxJsxTagAttributeNameLocal,
      mdxJsxFlowTagAttributeValueLiteral: exitMdxJsxTagAttributeValueLiteral,
      mdxJsxFlowTagAttributeValueLiteralValue: data,
      mdxJsxFlowTagAttributeValueExpression:
        exitMdxJsxTagAttributeValueExpression,
      mdxJsxFlowTagAttributeValueExpressionValue: data,
      mdxJsxFlowTagSelfClosingMarker: exitMdxJsxTagSelfClosingMarker,
      mdxJsxFlowTag: exitMdxJsxTag,
      mdxJsxTextTagClosingMarker: exitMdxJsxTagClosingMarker,
      mdxJsxTextTagNamePrimary: exitMdxJsxTagNamePrimary,
      mdxJsxTextTagNameMember: exitMdxJsxTagNameMember,
      mdxJsxTextTagNameLocal: exitMdxJsxTagNameLocal,
      mdxJsxTextTagExpressionAttribute: exitMdxJsxTagExpressionAttribute,
      mdxJsxTextTagExpressionAttributeValue: data,
      mdxJsxTextTagAttributeNamePrimary: exitMdxJsxTagAttributeNamePrimary,
      mdxJsxTextTagAttributeNameLocal: exitMdxJsxTagAttributeNameLocal,
      mdxJsxTextTagAttributeValueLiteral: exitMdxJsxTagAttributeValueLiteral,
      mdxJsxTextTagAttributeValueLiteralValue: data,
      mdxJsxTextTagAttributeValueExpression:
        exitMdxJsxTagAttributeValueExpression,
      mdxJsxTextTagAttributeValueExpressionValue: data,
      mdxJsxTextTagSelfClosingMarker: exitMdxJsxTagSelfClosingMarker,
      mdxJsxTextTag: exitMdxJsxTag,
    },
  }
}
var mdxJsxToMarkdown = function (options) {
  const patterns = options.patterns || []
  const options_ = options || {}
  const quote = options_.quote || '"'
  const quoteSmart = options_.quoteSmart || false
  const tightSelfClosing = options_.tightSelfClosing || false
  const printWidth = options_.printWidth || Number.POSITIVE_INFINITY
  const alternative = quote === '"' ? "'" : '"'
  if (quote !== '"' && quote !== "'") {
    throw new Error(
      'Cannot serialize attribute values with `' +
        quote +
        '` for `options.quote`, expected `"`, or `\'`'
    )
  }
  const mdxElement = function (node, _, context, safeOptions) {
    const pattern = patterns.find((p) => p.templateName === node.name)
    if (!pattern) {
      return ''
    }
    const patternName = pattern.name || pattern?.templateName
    const tracker = track(safeOptions)
    const selfClosing = pattern.leaf
    const exit = context.enter(node.type)
    let index = -1
    const serializedAttributes = []
    let value = tracker.move(pattern.start + ' ' + (patternName || ''))
    if (node.attributes && node.attributes.length > 0) {
      if (!node.name) {
        throw new Error('Cannot serialize fragment w/ attributes')
      }
      while (++index < node.attributes.length) {
        const attribute = node.attributes[index]
        let result
        if (attribute?.type === 'mdxJsxExpressionAttribute') {
          result = '{' + (attribute.value || '') + '}'
        } else {
          if (!attribute?.name) {
            throw new Error('Cannot serialize attribute w/o name')
          }
          const value2 = attribute.value
          const left = attribute.name
          let right = ''
          if (value2 === void 0 || value2 === null) {
          } else if (typeof value2 === 'object') {
            right = '{' + (value2.value || '') + '}'
          } else {
            const appliedQuote =
              quoteSmart && ccount(value2, quote) > ccount(value2, alternative)
                ? alternative
                : quote
            right =
              appliedQuote +
              stringifyEntitiesLight(value2, { subset: [appliedQuote] }) +
              appliedQuote
          }
          if (left === '_value') {
            result = right
          } else {
            result = left + (right ? '=' : '') + right
          }
        }
        serializedAttributes.push(result)
      }
    }
    let attributesOnTheirOwnLine = false
    const attributesOnOneLine = serializedAttributes.join(' ')
    if (
      node.type === 'mdxJsxFlowElement' &&
      (/\r?\n|\r/.test(attributesOnOneLine) ||
        tracker.current().now.column +
          attributesOnOneLine.length +
          (selfClosing ? (tightSelfClosing ? 2 : 3) : 1) >
          printWidth)
    ) {
      attributesOnTheirOwnLine = true
    }
    if (attributesOnTheirOwnLine) {
      value += tracker.move(
        '\n' + indentLines(serializedAttributes.join('\n'), map)
      )
    } else if (attributesOnOneLine) {
      value += tracker.move(' ' + attributesOnOneLine)
    }
    if (attributesOnTheirOwnLine) {
      value += tracker.move('\n')
    }
    if (selfClosing) {
      value += tracker.move(
        tightSelfClosing || attributesOnTheirOwnLine ? '' : ''
      )
    }
    value += tracker.move(' ' + pattern.end)
    if (node.children) {
      if (node.type === 'mdxJsxFlowElement') {
        const emptyChildren =
          node.children.length === 1 &&
          node.children[0]?.type === 'paragraph' &&
          node.children[0].children[0]?.type === 'text' &&
          node.children[0].children[0].value === ''
        if (!emptyChildren) {
          tracker.shift(2)
          value += tracker.move('\n')
          value += tracker.move(containerFlow(node, context, tracker.current()))
          value += tracker.move('\n')
        }
      } else {
        value += tracker.move(
          containerPhrasing(node, context, {
            ...tracker.current(),
            before: '<',
            after: '>',
          })
        )
      }
    }
    if (!selfClosing) {
      value += tracker.move(
        pattern.start + ' /' + (patternName || ' ') + ' ' + pattern.end
      )
    }
    exit()
    return value
  }
  const map = function (line, _, blank) {
    return (blank ? '' : '  ') + line
  }
  const peekElement = function () {
    return '<'
  }
  mdxElement.peek = peekElement
  return {
    ...options,
    handlers: {
      mdxJsxFlowElement: mdxElement,
      mdxJsxTextElement: mdxElement,
    },
    unsafe: [
      { character: '<', inConstruct: ['phrasing'] },
      { atBreak: true, character: '<' },
    ],
    fences: true,
    resourceLink: true,
  }
}

// ../mdx/src/next/util.ts
var getFieldPatterns = (field) => {
  const patterns = []
  const templates = []
  hoistAllTemplates(field, templates)
  templates?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    if (template.match) {
      patterns.push({
        start: template.match.start,
        end: template.match.end,
        name: template.match.name || template.name,
        templateName: template.name,
        type: template.inline ? 'inline' : 'flow',
        leaf: !template.fields.some((f) => f.name === 'children'),
      })
    }
  })
  return patterns
}
var hoistAllTemplates = (field, templates = []) => {
  field.templates?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    templates.push(template)
    template.fields.forEach((field2) => {
      if (field2.type === 'rich-text') {
        hoistAllTemplates(field2, templates)
      }
    })
  })
  return templates
}

// ../mdx/src/next/stringify/to-markdown.ts
var toTinaMarkdown = (tree, field) => {
  const patterns = getFieldPatterns(field)
  const handlers = {}
  handlers['text'] = (node, parent, context, safeOptions) => {
    context.unsafe = context.unsafe.filter((unsafeItem) => {
      if (
        unsafeItem.character === ' ' &&
        unsafeItem.inConstruct === 'phrasing'
      ) {
        return false
      }
      return true
    })
    if (field.parser?.type === 'markdown') {
      if (field.parser.skipEscaping === 'all') {
        return node.value
      }
      if (field.parser.skipEscaping === 'html') {
        context.unsafe = context.unsafe.filter((unsafeItem) => {
          if (unsafeItem.character === '<') {
            return false
          }
          return true
        })
      }
    }
    return text(node, parent, context, safeOptions)
  }
  return toMarkdown(tree, {
    extensions: [mdxJsxToMarkdown({ patterns })],
    listItemIndent: 'one',
    handlers,
  })
}

// ../mdx/src/stringify/index.ts
import { toMarkdown as toMarkdown2 } from 'mdast-util-to-markdown'
import { text as text3 } from 'mdast-util-to-markdown/lib/handle/text'
import { mdxJsxToMarkdown as mdxJsxToMarkdown2 } from 'mdast-util-mdx-jsx'

// ../mdx/src/stringify/acorn.ts
import { format } from 'prettier'
var stringifyPropsInline = (element, field, imageCallback) => {
  return stringifyProps(element, field, true, imageCallback)
}
function stringifyProps(element, parentField, flatten2, imageCallback) {
  const attributes2 = []
  const children = []
  let template
  let useDirective = false
  let directiveType = 'leaf'
  template = parentField.templates?.find((template2) => {
    if (typeof template2 === 'string') {
      throw new Error('Global templates not supported')
    }
    return template2.name === element.name
  })
  if (!template) {
    template = parentField.templates?.find((template2) => {
      const templateName = template2?.match?.name
      return templateName === element.name
    })
  }
  if (!template || typeof template === 'string') {
    throw new Error(`Unable to find template for JSX element ${element.name}`)
  }
  if (template.fields.find((f) => f.name === 'children')) {
    directiveType = 'block'
  }
  useDirective = !!template.match
  Object.entries(element.props).forEach(([name, value]) => {
    if (typeof template === 'string') {
      throw new Error(`Unable to find template for JSX element ${name}`)
    }
    const field = template?.fields?.find((field2) => field2.name === name)
    if (!field) {
      if (name === 'children') {
        return
      }
      return
    }
    switch (field.type) {
      case 'reference':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `"${item}"`).join(', ')}]`,
              },
            })
          }
        } else {
          if (typeof value === 'string') {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value,
            })
          }
        }
        break
      case 'datetime':
      case 'string':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `"${item}"`).join(', ')}]`,
              },
            })
          }
        } else {
          if (typeof value === 'string') {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value,
            })
          } else {
            throw new Error(
              `Expected string for attribute on field ${field.name}`
            )
          }
        }
        break
      case 'image':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value
                  .map((item) => `"${imageCallback(item)}"`)
                  .join(', ')}]`,
              },
            })
          }
        } else {
          attributes2.push({
            type: 'mdxJsxAttribute',
            name,
            value: imageCallback(String(value)),
          })
        }
        break
      case 'number':
      case 'boolean':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `${item}`).join(', ')}]`,
              },
            })
          }
        } else {
          attributes2.push({
            type: 'mdxJsxAttribute',
            name,
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: String(value),
            },
          })
        }
        break
      case 'object':
        attributes2.push({
          type: 'mdxJsxAttribute',
          name,
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: stringifyObj(value, flatten2),
          },
        })
        break
      case 'rich-text':
        if (typeof value === 'string') {
          throw new Error(
            `Unexpected string for rich-text, ensure the value has been properly parsed`
          )
        }
        if (field.list) {
          throw new Error(`Rich-text list is not supported`)
        } else {
          const joiner = flatten2 ? ' ' : '\n'
          let val = ''
          assertShape(
            value,
            (value2) =>
              value2.type === 'root' && Array.isArray(value2.children),
            `Nested rich-text element is not a valid shape for field ${field.name}`
          )
          if (field.name === 'children') {
            const root = rootElement(value, field, imageCallback)
            root.children.forEach((child) => {
              children.push(child)
            })
            return
          } else {
            const stringValue = stringifyMDX(value, field, imageCallback)
            if (stringValue) {
              val = stringValue
                .trim()
                .split('\n')
                .map((str) => `  ${str.trim()}`)
                .join(joiner)
            }
          }
          if (flatten2) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `<>${val.trim()}</>`,
              },
            })
          } else {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `<>
${val}
</>`,
              },
            })
          }
        }
        break
      default:
        throw new Error(`Stringify props: ${field.type} not yet supported`)
    }
  })
  if (template.match) {
    return {
      useDirective,
      directiveType,
      attributes: attributes2,
      children:
        children && children.length
          ? children
          : [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '',
                  },
                ],
              },
            ],
    }
  }
  return { attributes: attributes2, children, useDirective, directiveType }
}
function stringifyObj(obj, flatten2) {
  if (typeof obj === 'object' && obj !== null) {
    const dummyFunc = `const dummyFunc = `
    const res = format(`${dummyFunc}${JSON.stringify(obj)}`, {
      parser: 'acorn',
      trailingComma: 'none',
      semi: false,
    })
      .trim()
      .replace(dummyFunc, '')
    return flatten2 ? res.replaceAll('\n', '').replaceAll('  ', ' ') : res
  } else {
    throw new Error(
      `stringifyObj must be passed an object or an array of objects, received ${typeof obj}`
    )
  }
}
function assertShape(value, callback, errorMessage) {
  if (!callback(value)) {
    throw new Error(errorMessage || `Failed to assert shape`)
  }
}

// ../mdx/src/stringify/marks.ts
var matches = (a, b) => {
  return a.some((v) => b.includes(v))
}
var replaceLinksWithTextNodes = (content) => {
  const newItems = []
  content?.forEach((item) => {
    if (item.type === 'a') {
      if (item.children.length === 1) {
        const firstChild = item.children[0]
        if (firstChild?.type === 'text') {
          newItems.push({
            ...firstChild,
            linkifyTextNode: (a) => {
              return {
                type: 'link',
                url: item.url,
                title: item.title,
                children: [a],
              }
            },
          })
        } else {
          newItems.push(item)
        }
      } else {
        newItems.push(item)
      }
    } else {
      newItems.push(item)
    }
  })
  return newItems
}
var inlineElementExceptLink = (content, field, imageCallback) => {
  switch (content.type) {
    case 'a':
      throw new Error(
        `Unexpected node of type "a", link elements should be processed after all inline elements have resolved`
      )
    case 'img':
      return {
        type: 'image',
        url: imageCallback(content.url),
        alt: content.alt,
        title: content.caption,
      }
    case 'break':
      return {
        type: 'break',
      }
    case 'mdxJsxTextElement': {
      const { attributes: attributes2, children } = stringifyPropsInline(
        content,
        field,
        imageCallback
      )
      return {
        type: 'mdxJsxTextElement',
        name: content.name,
        attributes: attributes2,
        children,
      }
    }
    case 'html_inline': {
      return {
        type: 'html',
        value: content.value,
      }
    }
    default:
      if (!content.type && typeof content.text === 'string') {
        return text2(content)
      }
      throw new Error(`InlineElement: ${content.type} is not supported`)
  }
}
var text2 = (content) => {
  return {
    type: 'text',
    value: content.text,
  }
}
var eat = (c, field, imageCallback) => {
  const content = replaceLinksWithTextNodes(c)
  const first = content[0]
  if (!first) {
    return []
  }
  if (first && first?.type !== 'text') {
    if (first.type === 'a') {
      return [
        {
          type: 'link',
          url: first.url,
          title: first.title,
          children: eat(first.children, field, imageCallback),
        },
        ...eat(content.slice(1), field, imageCallback),
      ]
    }
    return [
      inlineElementExceptLink(first, field, imageCallback),
      ...eat(content.slice(1), field, imageCallback),
    ]
  }
  const marks = getMarks(first)
  if (marks.length === 0) {
    if (first.linkifyTextNode) {
      return [
        first.linkifyTextNode(text2(first)),
        ...eat(content.slice(1), field, imageCallback),
      ]
    } else {
      return [text2(first), ...eat(content.slice(1), field, imageCallback)]
    }
  }
  let nonMatchingSiblingIndex = 0
  if (
    content.slice(1).every((content2, index) => {
      if (matches(marks, getMarks(content2))) {
        return true
      } else {
        nonMatchingSiblingIndex = index
        return false
      }
    })
  ) {
    nonMatchingSiblingIndex = content.length - 1
  }
  const matchingSiblings = content.slice(1, nonMatchingSiblingIndex + 1)
  const markCounts = {}
  marks.forEach((mark) => {
    let count2 = 1
    matchingSiblings.every((sibling, index) => {
      if (getMarks(sibling).includes(mark)) {
        count2 = index + 1
        return true
      }
    })
    markCounts[mark] = count2
  })
  let count = 0
  let markToProcess = null
  Object.entries(markCounts).forEach(([mark, markCount]) => {
    const m = mark
    if (markCount > count) {
      count = markCount
      markToProcess = m
    }
  })
  if (!markToProcess) {
    return [text2(first), ...eat(content.slice(1), field, imageCallback)]
  }
  if (markToProcess === 'inlineCode') {
    if (nonMatchingSiblingIndex) {
      throw new Error(`Marks inside inline code are not supported`)
    }
    const node = {
      type: markToProcess,
      value: first.text,
    }
    return [
      first.linkifyTextNode?.(node) ?? node,
      ...eat(content.slice(nonMatchingSiblingIndex + 1), field, imageCallback),
    ]
  }
  return [
    {
      type: markToProcess,
      children: eat(
        [
          ...[first, ...matchingSiblings].map((sibling) =>
            cleanNode(sibling, markToProcess)
          ),
        ],
        field,
        imageCallback
      ),
    },
    ...eat(content.slice(nonMatchingSiblingIndex + 1), field, imageCallback),
  ]
}
var cleanNode = (node, mark) => {
  if (!mark) {
    return node
  }
  const cleanedNode = {}
  const markToClear = {
    strong: 'bold',
    emphasis: 'italic',
    inlineCode: 'code',
  }[mark]
  Object.entries(node).map(([key, value]) => {
    if (key !== markToClear) {
      cleanedNode[key] = value
    }
  })
  if (node.linkifyTextNode) {
    cleanedNode.callback = node.linkifyTextNode
  }
  return cleanedNode
}

// ../mdx/src/extensions/tina-shortcodes/to-markdown.ts
import { stringifyEntitiesLight as stringifyEntitiesLight2 } from 'stringify-entities'
import { containerFlow as containerFlow2 } from 'mdast-util-to-markdown/lib/util/container-flow'
import { containerPhrasing as containerPhrasing2 } from 'mdast-util-to-markdown/lib/util/container-phrasing'
import { checkQuote } from 'mdast-util-to-markdown/lib/util/check-quote'
import { track as track2 } from 'mdast-util-to-markdown/lib/util/track'
var own = {}.hasOwnProperty
var directiveToMarkdown = (patterns) => ({
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
var handleDirective = function (patterns) {
  const handleDirective2 = function (node, _, state, safeOptions) {
    const tracker = track2(safeOptions)
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
    let label
    if (label && label.children && label.children.length > 0) {
      const exit2 = state.enter('label')
      const labelType = `${node.type}Label`
      const subexit = state.enter(labelType)
      value += tracker.move('[')
      value += tracker.move(
        containerPhrasing2(label, state, {
          ...tracker.current(),
          before: value,
          after: ']',
        })
      )
      value += tracker.move(']')
      subexit()
      exit2()
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
        value += tracker.move(containerFlow2(shallow, state, tracker.current()))
      }
      value += tracker.move('\n' + sequence)
      value += tracker.move(' \\' + patternName + ' ' + pattern.end)
    }
    exit()
    return value
  }
  handleDirective2.peek = peekDirective
  return handleDirective2
}
function peekDirective() {
  return ':'
}
function attributes(node, state) {
  const quote = checkQuote(state)
  const subset = node.type === 'textDirective' ? [quote] : [quote, '\n', '\r']
  const attrs = node.attributes || {}
  const values3 = []
  let key
  for (key in attrs) {
    if (own.call(attrs, key) && attrs[key] !== void 0 && attrs[key] !== null) {
      const value = String(attrs[key])
      values3.push(quoted(key, value))
    }
  }
  return values3.length > 0 ? values3.join(' ') + ' ' : ''
  function quoted(key2, value) {
    const v = quote + stringifyEntitiesLight2(value, { subset }) + quote
    if (key2 === '_value') {
      return v
    }
    return key2 + (value ? '=' + v : '')
  }
}
function inlineDirectiveLabel(node) {
  return Boolean(
    node && node.type === 'paragraph' && node.data && node.data.directiveLabel
  )
}

// ../mdx/src/stringify/stringifyShortcode.ts
function stringifyShortcode(preprocessedString, template) {
  const match = template.match
  const unkeyedAttributes = !!template.fields.find((t) => t.name == '_value')
  const regex = `<[\\s]*${template.name}[\\s]*${
    unkeyedAttributes ? '(?:_value=(.*?))?' : '(.+?)?'
  }[\\s]*>[\\s]*((?:.|
)*?)[\\s]*</[\\s]*${template.name}[\\s]*>`
  const closingRegex = `
$2
${match.start} /${match.name || template.name} ${match.end}`
  const replace = `${match.start} ${match.name || template.name} $1 ${
    match.end
  }${template.fields.find((t) => t.name == 'children') ? closingRegex : ''}`
  return replaceAll(preprocessedString, regex, replace)
}

// ../mdx/src/stringify/index.ts
var stringifyMDX = (value, field, imageCallback) => {
  if (field.parser?.type === 'markdown') {
    return stringifyMDX2(value, field, imageCallback)
  }
  if (!value) {
    return
  }
  if (typeof value === 'string') {
    throw new Error('Expected an object to stringify, but received a string')
  }
  if (value?.children[0]) {
    if (value?.children[0].type === 'invalid_markdown') {
      return value.children[0].value
    }
  }
  const tree = rootElement(value, field, imageCallback)
  const res = toTinaMarkdown2(tree, field)
  const templatesWithMatchers = field.templates?.filter(
    (template) => template.match
  )
  let preprocessedString = res
  templatesWithMatchers?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates are not supported')
    }
    if (template.match) {
      preprocessedString = stringifyShortcode(preprocessedString, template)
    }
  })
  return preprocessedString
}
var toTinaMarkdown2 = (tree, field) => {
  const patterns = []
  field.templates?.forEach((template) => {
    if (typeof template === 'string') {
      return
    }
    if (template && template.match) {
      const pattern = template.match
      pattern.templateName = template.name
      patterns.push(pattern)
    }
  })
  const handlers = {}
  handlers['text'] = (node, parent, context, safeOptions) => {
    context.unsafe = context.unsafe.filter((unsafeItem) => {
      if (
        unsafeItem.character === ' ' &&
        unsafeItem.inConstruct === 'phrasing'
      ) {
        return false
      }
      return true
    })
    if (field.parser?.type === 'markdown') {
      if (field.parser.skipEscaping === 'all') {
        return node.value
      }
      if (field.parser.skipEscaping === 'html') {
        context.unsafe = context.unsafe.filter((unsafeItem) => {
          if (unsafeItem.character === '<') {
            return false
          }
          return true
        })
      }
    }
    return text3(node, parent, context, safeOptions)
  }
  return toMarkdown2(tree, {
    extensions: [directiveToMarkdown(patterns), mdxJsxToMarkdown2()],
    listItemIndent: 'one',
    handlers,
  })
}
var rootElement = (content, field, imageCallback) => {
  const children = []
  content.children?.forEach((child) => {
    const value = blockElement(child, field, imageCallback)
    if (value) {
      children.push(value)
    }
  })
  return {
    type: 'root',
    children,
  }
}
var blockElement = (content, field, imageCallback) => {
  switch (content.type) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        depth: { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }[content.type],
        children: eat(content.children, field, imageCallback),
      }
    case 'p':
      if (content.children.length === 1) {
        const onlyChild = content.children[0]
        if (
          onlyChild &&
          (onlyChild.type === 'text' || !onlyChild.type) &&
          onlyChild.text === ''
        ) {
          return null
        }
      }
      return {
        type: 'paragraph',
        children: eat(content.children, field, imageCallback),
      }
    case 'code_block':
      return {
        type: 'code',
        lang: content.lang,
        value: content.value,
      }
    case 'mdxJsxFlowElement':
      const {
        children,
        attributes: attributes2,
        useDirective,
        directiveType,
      } = stringifyProps(content, field, false, imageCallback)
      if (useDirective) {
        const name = content.name
        if (!name) {
          throw new Error(
            `Expective shortcode to have a name but it was not defined`
          )
        }
        const directiveAttributes = {}
        attributes2?.forEach((att) => {
          if (att.value && typeof att.value === 'string') {
            directiveAttributes[att.name] = att.value
          }
        })
        if (directiveType === 'leaf') {
          return {
            type: 'leafDirective',
            name,
            attributes: directiveAttributes,
            children: [],
          }
        } else {
          return {
            type: 'containerDirective',
            name,
            attributes: directiveAttributes,
            children,
          }
        }
      }
      return {
        type: 'mdxJsxFlowElement',
        name: content.name,
        attributes: attributes2,
        children,
      }
    case 'blockquote':
      return {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: eat(content.children, field, imageCallback),
          },
        ],
      }
    case 'hr':
      return {
        type: 'thematicBreak',
      }
    case 'ol':
    case 'ul':
      return {
        type: 'list',
        ordered: content.type === 'ol',
        spread: false,
        children: content.children.map((child) =>
          listItemElement(child, field, imageCallback)
        ),
      }
    case 'html': {
      return {
        type: 'html',
        value: content.value,
      }
    }
    case 'img':
      return {
        type: 'image',
        url: imageCallback(content.url),
        alt: content.alt,
        title: content.caption,
      }
    default:
      throw new Error(`BlockElement: ${content.type} is not yet supported`)
  }
}
var listItemElement = (content, field, imageCallback) => {
  return {
    type: 'listItem',
    spread: false,
    children: content.children.map((child) => {
      if (child.type === 'lic') {
        return {
          type: 'paragraph',
          children: eat(child.children, field, imageCallback),
        }
      }
      return blockContentElement(child, field, imageCallback)
    }),
  }
}
var blockContentElement = (content, field, imageCallback) => {
  switch (content.type) {
    case 'blockquote':
      return {
        type: 'blockquote',
        children: content.children.map((child) =>
          blockContentElement(child, field, imageCallback)
        ),
      }
    case 'p':
      return {
        type: 'paragraph',
        children: eat(content.children, field, imageCallback),
      }
    case 'ol':
    case 'ul':
      return {
        type: 'list',
        ordered: content.type === 'ol',
        spread: false,
        children: content.children.map((child) =>
          listItemElement(child, field, imageCallback)
        ),
      }
    default:
      throw new Error(
        `BlockContentElement: ${content.type} is not yet supported`
      )
  }
}
var getMarks = (content) => {
  const marks = []
  if (content.type !== 'text') {
    return []
  }
  if (content.bold) {
    marks.push('strong')
  }
  if (content.italic) {
    marks.push('emphasis')
  }
  if (content.code) {
    marks.push('inlineCode')
  }
  return marks
}

// ../mdx/src/next/stringify/acorn.ts
import { format as format2 } from 'prettier'
var stringifyPropsInline2 = (element, field, imageCallback) => {
  return stringifyProps2(element, field, true, imageCallback)
}
function stringifyProps2(element, parentField, flatten2, imageCallback) {
  const attributes2 = []
  const children = []
  let template
  let useDirective = false
  let directiveType = 'leaf'
  template = parentField.templates?.find((template2) => {
    if (typeof template2 === 'string') {
      throw new Error('Global templates not supported')
    }
    return template2.name === element.name
  })
  if (!template) {
    template = parentField.templates?.find((template2) => {
      const templateName = template2?.match?.name
      return templateName === element.name
    })
  }
  if (!template || typeof template === 'string') {
    throw new Error(`Unable to find template for JSX element ${element.name}`)
  }
  if (template.fields.find((f) => f.name === 'children')) {
    directiveType = 'block'
  }
  useDirective = !!template.match
  Object.entries(element.props).forEach(([name, value]) => {
    if (typeof template === 'string') {
      throw new Error(`Unable to find template for JSX element ${name}`)
    }
    const field = template?.fields?.find((field2) => field2.name === name)
    if (!field) {
      if (name === 'children') {
        return
      }
      return
    }
    switch (field.type) {
      case 'reference':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `"${item}"`).join(', ')}]`,
              },
            })
          }
        } else {
          if (typeof value === 'string') {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value,
            })
          }
        }
        break
      case 'datetime':
      case 'string':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `"${item}"`).join(', ')}]`,
              },
            })
          }
        } else {
          if (typeof value === 'string') {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value,
            })
          } else {
            throw new Error(
              `Expected string for attribute on field ${field.name}`
            )
          }
        }
        break
      case 'image':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value
                  .map((item) => `"${imageCallback(item)}"`)
                  .join(', ')}]`,
              },
            })
          }
        } else {
          attributes2.push({
            type: 'mdxJsxAttribute',
            name,
            value: imageCallback(String(value)),
          })
        }
        break
      case 'number':
      case 'boolean':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `${item}`).join(', ')}]`,
              },
            })
          }
        } else {
          attributes2.push({
            type: 'mdxJsxAttribute',
            name,
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: String(value),
            },
          })
        }
        break
      case 'object':
        attributes2.push({
          type: 'mdxJsxAttribute',
          name,
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: stringifyObj2(value, flatten2),
          },
        })
        break
      case 'rich-text':
        if (typeof value === 'string') {
          throw new Error(
            `Unexpected string for rich-text, ensure the value has been properly parsed`
          )
        }
        if (field.list) {
          throw new Error(`Rich-text list is not supported`)
        } else {
          const joiner = flatten2 ? ' ' : '\n'
          let val = ''
          assertShape2(
            value,
            (value2) =>
              value2.type === 'root' && Array.isArray(value2.children),
            `Nested rich-text element is not a valid shape for field ${field.name}`
          )
          if (field.name === 'children') {
            const root = rootElement2(value, field, imageCallback)
            root.children.forEach((child) => {
              children.push(child)
            })
            return
          } else {
            const stringValue = stringifyMDX2(value, field, imageCallback)
            if (stringValue) {
              val = stringValue
                .trim()
                .split('\n')
                .map((str) => `  ${str.trim()}`)
                .join(joiner)
            }
          }
          if (flatten2) {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `<>${val.trim()}</>`,
              },
            })
          } else {
            attributes2.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `<>
${val}
</>`,
              },
            })
          }
        }
        break
      default:
        throw new Error(`Stringify props: ${field.type} not yet supported`)
    }
  })
  if (template.match) {
    return {
      useDirective,
      directiveType,
      attributes: attributes2,
      children:
        children && children.length
          ? children
          : [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '',
                  },
                ],
              },
            ],
    }
  }
  return { attributes: attributes2, children, useDirective, directiveType }
}
function stringifyObj2(obj, flatten2) {
  if (typeof obj === 'object' && obj !== null) {
    const dummyFunc = `const dummyFunc = `
    const res = format2(`${dummyFunc}${JSON.stringify(obj)}`, {
      parser: 'acorn',
      trailingComma: 'none',
      semi: false,
    })
      .trim()
      .replace(dummyFunc, '')
    return flatten2 ? res.replaceAll('\n', '').replaceAll('  ', ' ') : res
  } else {
    throw new Error(
      `stringifyObj must be passed an object or an array of objects, received ${typeof obj}`
    )
  }
}
function assertShape2(value, callback, errorMessage) {
  if (!callback(value)) {
    throw new Error(errorMessage || `Failed to assert shape`)
  }
}

// ../mdx/src/next/stringify/marks.ts
var matches2 = (a, b) => {
  return a.some((v) => b.includes(v))
}
var replaceLinksWithTextNodes2 = (content) => {
  const newItems = []
  content?.forEach((item) => {
    if (item.type === 'a') {
      if (item.children.length === 1) {
        const firstChild = item.children[0]
        if (firstChild?.type === 'text') {
          newItems.push({
            ...firstChild,
            linkifyTextNode: (a) => {
              return {
                type: 'link',
                url: item.url,
                title: item.title,
                children: [a],
              }
            },
          })
        } else {
          newItems.push(item)
        }
      } else {
        newItems.push(item)
      }
    } else {
      newItems.push(item)
    }
  })
  return newItems
}
var inlineElementExceptLink2 = (content, field, imageCallback) => {
  switch (content.type) {
    case 'a':
      throw new Error(
        `Unexpected node of type "a", link elements should be processed after all inline elements have resolved`
      )
    case 'img':
      return {
        type: 'image',
        url: imageCallback(content.url),
        alt: content.alt,
        title: content.caption,
      }
    case 'break':
      return {
        type: 'break',
      }
    case 'mdxJsxTextElement': {
      const { attributes: attributes2, children } = stringifyPropsInline2(
        content,
        field,
        imageCallback
      )
      let c = children
      if (children.length) {
        const firstChild = children[0]
        if (firstChild && firstChild.type === 'paragraph') {
          c = firstChild.children
        }
      }
      return {
        type: 'mdxJsxTextElement',
        name: content.name,
        attributes: attributes2,
        children: c,
      }
    }
    case 'html_inline': {
      return {
        type: 'html',
        value: content.value,
      }
    }
    default:
      if (!content.type && typeof content.text === 'string') {
        return text4(content)
      }
      throw new Error(`InlineElement: ${content.type} is not supported`)
  }
}
var text4 = (content) => {
  return {
    type: 'text',
    value: content.text,
  }
}
var eat2 = (c, field, imageCallback) => {
  const content = replaceLinksWithTextNodes2(c)
  const first = content[0]
  if (!first) {
    return []
  }
  if (first && first?.type !== 'text') {
    if (first.type === 'a') {
      return [
        {
          type: 'link',
          url: first.url,
          title: first.title,
          children: eat2(first.children, field, imageCallback),
        },
        ...eat2(content.slice(1), field, imageCallback),
      ]
    }
    return [
      inlineElementExceptLink2(first, field, imageCallback),
      ...eat2(content.slice(1), field, imageCallback),
    ]
  }
  const marks = getMarks(first)
  if (marks.length === 0) {
    if (first.linkifyTextNode) {
      return [
        first.linkifyTextNode(text4(first)),
        ...eat2(content.slice(1), field, imageCallback),
      ]
    } else {
      return [text4(first), ...eat2(content.slice(1), field, imageCallback)]
    }
  }
  let nonMatchingSiblingIndex = 0
  if (
    content.slice(1).every((content2, index) => {
      if (matches2(marks, getMarks(content2))) {
        return true
      } else {
        nonMatchingSiblingIndex = index
        return false
      }
    })
  ) {
    nonMatchingSiblingIndex = content.length - 1
  }
  const matchingSiblings = content.slice(1, nonMatchingSiblingIndex + 1)
  const markCounts = {}
  marks.forEach((mark) => {
    let count2 = 1
    matchingSiblings.every((sibling, index) => {
      if (getMarks(sibling).includes(mark)) {
        count2 = index + 1
        return true
      }
    })
    markCounts[mark] = count2
  })
  let count = 0
  let markToProcess = null
  Object.entries(markCounts).forEach(([mark, markCount]) => {
    const m = mark
    if (markCount > count) {
      count = markCount
      markToProcess = m
    }
  })
  if (!markToProcess) {
    return [text4(first), ...eat2(content.slice(1), field, imageCallback)]
  }
  if (markToProcess === 'inlineCode') {
    if (nonMatchingSiblingIndex) {
      throw new Error(`Marks inside inline code are not supported`)
    }
    const node = {
      type: markToProcess,
      value: first.text,
    }
    return [
      first.linkifyTextNode?.(node) ?? node,
      ...eat2(content.slice(nonMatchingSiblingIndex + 1), field, imageCallback),
    ]
  }
  return [
    {
      type: markToProcess,
      children: eat2(
        [
          ...[first, ...matchingSiblings].map((sibling) =>
            cleanNode2(sibling, markToProcess)
          ),
        ],
        field,
        imageCallback
      ),
    },
    ...eat2(content.slice(nonMatchingSiblingIndex + 1), field, imageCallback),
  ]
}
var cleanNode2 = (node, mark) => {
  if (!mark) {
    return node
  }
  const cleanedNode = {}
  const markToClear = {
    strong: 'bold',
    emphasis: 'italic',
    inlineCode: 'code',
  }[mark]
  Object.entries(node).map(([key, value]) => {
    if (key !== markToClear) {
      cleanedNode[key] = value
    }
  })
  if (node.linkifyTextNode) {
    cleanedNode.callback = node.linkifyTextNode
  }
  return cleanedNode
}

// ../mdx/src/next/stringify/pre-processing.ts
var preProcess = (tree, field, imageCallback) => {
  const ast = rootElement2(tree, field, imageCallback)
  return ast
}
var rootElement2 = (content, field, imageCallback) => {
  const children = []
  content.children?.forEach((child) => {
    const value = blockElement2(child, field, imageCallback)
    if (value) {
      children.push(value)
    }
  })
  return {
    type: 'root',
    children,
  }
}
var blockElement2 = (content, field, imageCallback) => {
  switch (content.type) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        depth: { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }[content.type],
        children: eat2(content.children, field, imageCallback),
      }
    case 'p':
      if (content.children.length === 1) {
        const onlyChild = content.children[0]
        if (
          onlyChild &&
          (onlyChild.type === 'text' || !onlyChild.type) &&
          onlyChild.text === ''
        ) {
          return null
        }
      }
      return {
        type: 'paragraph',
        children: eat2(content.children, field, imageCallback),
      }
    case 'code_block':
      return {
        type: 'code',
        lang: content.lang,
        value: content.value,
      }
    case 'mdxJsxFlowElement':
      const {
        children,
        attributes: attributes2,
        useDirective,
        directiveType,
      } = stringifyProps2(content, field, false, imageCallback)
      return {
        type: 'mdxJsxFlowElement',
        name: content.name,
        attributes: attributes2,
        children,
      }
    case 'blockquote':
      return {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: eat2(content.children, field, imageCallback),
          },
        ],
      }
    case 'hr':
      return {
        type: 'thematicBreak',
      }
    case 'ol':
    case 'ul':
      return {
        type: 'list',
        ordered: content.type === 'ol',
        spread: false,
        children: content.children.map((child) =>
          listItemElement2(child, field, imageCallback)
        ),
      }
    case 'html': {
      return {
        type: 'html',
        value: content.value,
      }
    }
    case 'img':
      return {
        type: 'image',
        url: imageCallback(content.url),
        alt: content.alt,
        title: content.caption,
      }
    default:
      throw new Error(`BlockElement: ${content.type} is not yet supported`)
  }
}
var listItemElement2 = (content, field, imageCallback) => {
  return {
    type: 'listItem',
    spread: false,
    children: content.children.map((child) => {
      if (child.type === 'lic') {
        return {
          type: 'paragraph',
          children: eat2(child.children, field, imageCallback),
        }
      }
      return blockContentElement2(child, field, imageCallback)
    }),
  }
}
var blockContentElement2 = (content, field, imageCallback) => {
  switch (content.type) {
    case 'blockquote':
      return {
        type: 'blockquote',
        children: content.children.map((child) =>
          blockContentElement2(child, field, imageCallback)
        ),
      }
    case 'p':
      return {
        type: 'paragraph',
        children: eat2(content.children, field, imageCallback),
      }
    case 'ol':
    case 'ul':
      return {
        type: 'list',
        ordered: content.type === 'ol',
        spread: false,
        children: content.children.map((child) =>
          listItemElement2(child, field, imageCallback)
        ),
      }
    default:
      throw new Error(
        `BlockContentElement: ${content.type} is not yet supported`
      )
  }
}

// ../mdx/src/next/stringify/index.ts
var stringifyMDX2 = (value, field, imageCallback) => {
  if (!value) {
    return
  }
  const mdTree = preProcess(value, field, imageCallback)
  return toTinaMarkdown(mdTree, field)
}

// ../mdx/src/next/parse/markdown.ts
import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'

// ../mdx/src/next/shortcodes/lib/factory-tag.ts
import { ok as assert } from 'uvu/assert'
import {
  start as idStart,
  cont as idCont,
} from 'estree-util-is-identifier-name'
import { factoryMdxExpression } from 'micromark-factory-mdx-expression'
import { factorySpace } from 'micromark-factory-space'
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
  unicodeWhitespace,
} from 'micromark-util-character'
import { codes as codes2 } from 'micromark-util-symbol/codes.js'
import { constants } from 'micromark-util-symbol/constants.js'
import { types } from 'micromark-util-symbol/types.js'
import { VFileMessage as VFileMessage2 } from 'vfile-message'

// ../mdx/src/next/shortcodes/lib/util.ts
import { codes } from 'micromark-util-symbol/codes'
import { values } from 'micromark-util-symbol/values'
var findValue = (string) => {
  let lookupValue = null
  Object.entries(values).forEach(([key, value]) => {
    if (value === string) {
      lookupValue = key
    }
  })
  return lookupValue
}
var findCode = (string) => {
  if (!string) {
    return null
  }
  const lookup = findValue(string)
  let lookupValue = null
  if (lookup) {
    Object.entries(codes).forEach(([key, value]) => {
      if (key === lookup) {
        lookupValue = value
      }
    })
  }
  return lookupValue
}

// ../mdx/src/next/shortcodes/lib/factory-tag.ts
function factoryTag(
  effects,
  ok,
  nok,
  acorn2,
  acornOptions,
  addResult,
  allowLazy,
  tagType,
  tagMarkerType,
  tagClosingMarkerType,
  tagSelfClosingMarker,
  tagNameType,
  tagNamePrimaryType,
  tagNameMemberMarkerType,
  tagNameMemberType,
  tagNamePrefixMarkerType,
  tagNameLocalType,
  tagExpressionAttributeType,
  tagExpressionAttributeMarkerType,
  tagExpressionAttributeValueType,
  tagAttributeType,
  tagAttributeNameType,
  tagAttributeNamePrimaryType,
  tagAttributeNamePrefixMarkerType,
  tagAttributeNameLocalType,
  tagAttributeInitializerMarkerType,
  tagAttributeValueLiteralType,
  tagAttributeValueLiteralMarkerType,
  tagAttributeValueLiteralValueType,
  tagAttributeValueExpressionType,
  tagAttributeValueExpressionMarkerType,
  tagAttributeValueExpressionValueType,
  pattern
) {
  const self = this
  let returnState
  let marker
  let startPoint
  let tagOpenerIndex = 1
  let tagCloserIndex = 1
  let nameIndex = 1
  const start = function (code) {
    startPoint = self.now()
    effects.enter(tagType)
    effects.enter(tagMarkerType)
    effects.consume(code)
    if (pattern.start.length === 1) {
      effects.exit(tagMarkerType)
      return afterStart
    }
    return tagOpenerSequence
  }
  const tagOpenerSequence = function (code) {
    const character = findCode(pattern.start[tagOpenerIndex])
    if (code === character) {
      effects.consume(code)
      if (pattern.start.length - 1 === tagOpenerIndex) {
        effects.exit(tagMarkerType)
        return afterStart
      }
      tagOpenerIndex++
      return tagOpenerSequence
    }
    return nok
  }
  const afterStart = function (code) {
    returnState = beforeName
    return optionalEsWhitespace(code)
  }
  const beforeName = function (code) {
    if (code === codes2.slash) {
      effects.enter(tagClosingMarkerType)
      effects.consume(code)
      effects.exit(tagClosingMarkerType)
      returnState = beforeClosingTagName
      return optionalEsWhitespace
    }
    if (code === codes2.greaterThan) {
      return tagEnd(code)
    }
    if (
      code !== codes2.eof &&
      idStart(code) &&
      findCode(pattern.name[0]) === code
    ) {
      effects.enter(tagNameType)
      effects.enter(tagNamePrimaryType)
      effects.consume(code)
      return primaryName
    }
    return nok(code)
  }
  const beforeClosingTagName = function (code) {
    if (code === codes2.greaterThan) {
      return tagEnd(code)
    }
    if (code !== codes2.eof && idStart(code)) {
      effects.enter(tagNameType)
      effects.enter(tagNamePrimaryType)
      effects.consume(code)
      return primaryName
    }
    return nok(code)
  }
  const primaryName = function (code) {
    const nextCharacterInName = pattern.name[nameIndex]
    const nextCodeInName = nextCharacterInName
      ? findCode(nextCharacterInName)
      : null
    if (nextCodeInName === code) {
      effects.consume(code)
      nameIndex++
      return primaryName
    }
    nameIndex = 0
    if (
      code === codes2.dot ||
      code === codes2.slash ||
      code === codes2.colon ||
      code === codes2.greaterThan ||
      code === findCode(pattern.end[0]) ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagNamePrimaryType)
      returnState = afterPrimaryName
      return optionalEsWhitespace(code)
    }
    return nok(code)
  }
  const afterPrimaryName = function (code) {
    if (code === codes2.dot) {
      effects.enter(tagNameMemberMarkerType)
      effects.consume(code)
      effects.exit(tagNameMemberMarkerType)
      returnState = beforeMemberName
      return optionalEsWhitespace
    }
    if (code === codes2.colon) {
      effects.enter(tagNamePrefixMarkerType)
      effects.consume(code)
      effects.exit(tagNamePrefixMarkerType)
      returnState = beforeLocalName
      return optionalEsWhitespace
    }
    if (code === findCode(pattern.end[0])) {
      const tagCloserSequence = function (code2) {
        const character = findCode(pattern.end[tagCloserIndex])
        if (code2 === character) {
          if (pattern.end.length - 1 === tagCloserIndex) {
            effects.exit(tagNameType)
            return beforeAttribute(code2)
          }
          tagCloserIndex++
          effects.consume(code2)
          return tagCloserSequence
        }
        tagCloserIndex = 0
        return nok
      }
      if (pattern.end.length === 1) {
        effects.exit(tagNameType)
        return beforeAttribute(code)
      } else {
        effects.consume(code)
        return tagCloserSequence
      }
    }
    if (
      code === codes2.slash ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      (code !== codes2.eof && idStart(code))
    ) {
      effects.exit(tagNameType)
      return beforeAttribute(code)
    }
    if (code === codes2.quotationMark) {
      effects.exit(tagNameType)
      effects.enter(tagAttributeType)
      effects.enter(tagAttributeNameType)
      effects.enter(tagAttributeNamePrimaryType)
      effects.exit(tagAttributeNamePrimaryType)
      effects.exit(tagAttributeNameType)
      effects.enter(tagAttributeInitializerMarkerType)
      effects.exit(tagAttributeInitializerMarkerType)
      return beforeAttributeValue(code)
    }
    return nok(code)
    crash(
      code,
      'after name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; whitespace before attributes; or the end of the tag'
    )
  }
  const beforeMemberName = function (code) {
    if (code !== codes2.eof && idStart(code)) {
      effects.enter(tagNameMemberType)
      effects.consume(code)
      return memberName
    }
    return nok(code)
    crash(
      code,
      'before member name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; whitespace before attributes; or the end of the tag'
    )
  }
  const memberName = function (code) {
    if (code === codes2.dash || (code !== codes2.eof && idCont(code))) {
      effects.consume(code)
      return memberName
    }
    if (
      code === codes2.dot ||
      code === codes2.slash ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagNameMemberType)
      returnState = afterMemberName
      return optionalEsWhitespace(code)
    }
    crash(
      code,
      'in member name',
      'a name character such as letters, digits, `$`, or `_`; whitespace before attributes; or the end of the tag' +
        (code === codes2.atSign
          ? ' (note: to create a link in MDX, use `[text](url)`)'
          : '')
    )
  }
  const afterMemberName = function (code) {
    if (code === codes2.dot) {
      effects.enter(tagNameMemberMarkerType)
      effects.consume(code)
      effects.exit(tagNameMemberMarkerType)
      returnState = beforeMemberName
      return optionalEsWhitespace
    }
    if (
      code === codes2.slash ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      (code !== codes2.eof && idStart(code))
    ) {
      effects.exit(tagNameType)
      return beforeAttribute(code)
    }
    return nok(code)
  }
  const beforeLocalName = function (code) {
    if (code !== codes2.eof && idStart(code)) {
      effects.enter(tagNameLocalType)
      effects.consume(code)
      return localName
    }
    crash(
      code,
      'before local name',
      'a character that can start a name, such as a letter, `$`, or `_`' +
        (code === codes2.plusSign ||
        (code !== null && code > codes2.dot && code < codes2.colon)
          ? ' (note: to create a link in MDX, use `[text](url)`)'
          : '')
    )
  }
  const localName = function (code) {
    if (code === codes2.dash || (code !== codes2.eof && idCont(code))) {
      effects.consume(code)
      return localName
    }
    if (
      code === codes2.slash ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagNameLocalType)
      returnState = afterLocalName
      return optionalEsWhitespace(code)
    }
    crash(
      code,
      'in local name',
      'a name character such as letters, digits, `$`, or `_`; whitespace before attributes; or the end of the tag'
    )
  }
  const afterLocalName = function (code) {
    if (
      code === codes2.slash ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      (code !== codes2.eof && idStart(code))
    ) {
      effects.exit(tagNameType)
      return beforeAttribute(code)
    }
    if (code === findCode(pattern.end)) {
      effects.exit(tagNameType)
      return beforeAttribute(code)
    }
    crash(
      code,
      'after local name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; whitespace before attributes; or the end of the tag'
    )
  }
  const beforeAttribute = function (code) {
    if (code === findCode(pattern.end[0])) {
      const tagCloserSequence = function (code2) {
        const character = findCode(pattern.end[tagCloserIndex])
        if (code2 === character) {
          if (pattern.end.length - 1 === tagCloserIndex) {
            return beforeAttribute(code2)
          }
          tagCloserIndex++
          effects.consume(code2)
          return tagCloserSequence
        }
        tagCloserIndex = 0
        return nok
      }
      if (pattern.end.length === 1) {
        if (pattern.leaf) {
          effects.enter(tagSelfClosingMarker)
          effects.exit(tagSelfClosingMarker)
          returnState = selfClosing
          return optionalEsWhitespace
        } else {
          return tagEnd(code)
        }
      } else {
        effects.consume(code)
        return tagCloserSequence
      }
    }
    if (code === findCode(pattern.end[pattern.end.length - 1])) {
      if (pattern.leaf) {
        effects.enter(tagSelfClosingMarker)
        effects.exit(tagSelfClosingMarker)
        returnState = selfClosing
        return optionalEsWhitespace
      } else {
        return tagEnd(code)
      }
    }
    if (code === codes2.greaterThan) {
      return tagEnd(code)
    }
    if (code === codes2.leftCurlyBrace) {
      assert(startPoint, 'expected `startPoint` to be defined')
      return factoryMdxExpression.call(
        self,
        effects,
        afterAttributeExpression,
        tagExpressionAttributeType,
        tagExpressionAttributeMarkerType,
        tagExpressionAttributeValueType,
        acorn2,
        acornOptions,
        addResult,
        true,
        false,
        allowLazy,
        startPoint.column
      )(code)
    }
    if (code !== codes2.eof && idStart(code)) {
      effects.enter(tagAttributeType)
      effects.enter(tagAttributeNameType)
      effects.enter(tagAttributeNamePrimaryType)
      effects.consume(code)
      return attributePrimaryName
    }
    return nok
  }
  const afterAttributeExpression = function (code) {
    returnState = beforeAttribute
    return optionalEsWhitespace(code)
  }
  const attributePrimaryName = function (code) {
    if (code === codes2.dash || (code !== codes2.eof && idCont(code))) {
      effects.consume(code)
      return attributePrimaryName
    }
    if (
      code === codes2.slash ||
      code === codes2.colon ||
      code === codes2.equalsTo ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagAttributeNamePrimaryType)
      returnState = afterAttributePrimaryName
      return optionalEsWhitespace(code)
    }
    return nok(code)
  }
  const afterAttributePrimaryName = function (code) {
    if (code === codes2.colon) {
      effects.enter(tagAttributeNamePrefixMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeNamePrefixMarkerType)
      returnState = beforeAttributeLocalName
      return optionalEsWhitespace
    }
    if (code === codes2.equalsTo) {
      effects.exit(tagAttributeNameType)
      effects.enter(tagAttributeInitializerMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeInitializerMarkerType)
      returnState = beforeAttributeValue
      return optionalEsWhitespace
    }
    if (
      code === codes2.slash ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code) ||
      (code !== codes2.eof && idStart(code))
    ) {
      effects.exit(tagAttributeNameType)
      effects.exit(tagAttributeType)
      returnState = beforeAttribute
      return optionalEsWhitespace(code)
    }
    return nok(code)
  }
  const beforeAttributeLocalName = function (code) {
    if (code !== codes2.eof && idStart(code)) {
      effects.enter(tagAttributeNameLocalType)
      effects.consume(code)
      return attributeLocalName
    }
    crash(
      code,
      'before local attribute name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; `=` to initialize a value; or the end of the tag'
    )
  }
  const attributeLocalName = function (code) {
    if (code === codes2.dash || (code !== codes2.eof && idCont(code))) {
      effects.consume(code)
      return attributeLocalName
    }
    if (
      code === codes2.slash ||
      code === codes2.equalsTo ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      markdownLineEndingOrSpace(code) ||
      unicodeWhitespace(code)
    ) {
      effects.exit(tagAttributeNameLocalType)
      effects.exit(tagAttributeNameType)
      returnState = afterAttributeLocalName
      return optionalEsWhitespace(code)
    }
    crash(
      code,
      'in local attribute name',
      'an attribute name character such as letters, digits, `$`, or `_`; `=` to initialize a value; whitespace before attributes; or the end of the tag'
    )
  }
  const afterAttributeLocalName = function (code) {
    if (code === codes2.equalsTo) {
      effects.enter(tagAttributeInitializerMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeInitializerMarkerType)
      returnState = beforeAttributeValue
      return optionalEsWhitespace
    }
    if (
      code === codes2.slash ||
      code === codes2.greaterThan ||
      code === codes2.leftCurlyBrace ||
      (code !== codes2.eof && idStart(code))
    ) {
      effects.exit(tagAttributeType)
      return beforeAttribute(code)
    }
    crash(
      code,
      'after local attribute name',
      'a character that can start an attribute name, such as a letter, `$`, or `_`; `=` to initialize a value; or the end of the tag'
    )
  }
  const beforeAttributeValue = function (code) {
    if (code === codes2.quotationMark || code === codes2.apostrophe) {
      effects.enter(tagAttributeValueLiteralType)
      effects.enter(tagAttributeValueLiteralMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeValueLiteralMarkerType)
      marker = code
      return attributeValueQuotedStart
    }
    if (code === codes2.leftCurlyBrace) {
      assert(startPoint, 'expected `startPoint` to be defined')
      return factoryMdxExpression.call(
        self,
        effects,
        afterAttributeValueExpression,
        tagAttributeValueExpressionType,
        tagAttributeValueExpressionMarkerType,
        tagAttributeValueExpressionValueType,
        acorn2,
        acornOptions,
        addResult,
        false,
        false,
        allowLazy,
        startPoint.column
      )(code)
    }
    return nok(code)
  }
  const afterAttributeValueExpression = function (code) {
    effects.exit(tagAttributeType)
    returnState = beforeAttribute
    return optionalEsWhitespace(code)
  }
  const attributeValueQuotedStart = function (code) {
    assert(marker !== void 0, 'expected `marker` to be defined')
    if (code === codes2.eof) {
      return nok(code)
    }
    if (code === marker) {
      effects.enter(tagAttributeValueLiteralMarkerType)
      effects.consume(code)
      effects.exit(tagAttributeValueLiteralMarkerType)
      effects.exit(tagAttributeValueLiteralType)
      effects.exit(tagAttributeType)
      marker = void 0
      returnState = beforeAttribute
      return optionalEsWhitespace
    }
    if (markdownLineEnding(code)) {
      returnState = attributeValueQuotedStart
      return optionalEsWhitespace(code)
    }
    effects.enter(tagAttributeValueLiteralValueType)
    return attributeValueQuoted(code)
  }
  const attributeValueQuoted = function (code) {
    if (code === codes2.eof || code === marker || markdownLineEnding(code)) {
      effects.exit(tagAttributeValueLiteralValueType)
      return attributeValueQuotedStart(code)
    }
    effects.consume(code)
    return attributeValueQuoted
  }
  const selfClosing = function (code) {
    if (code === findCode(pattern.end[pattern.end.length - 1])) {
      return tagEnd(code)
    }
    crash(
      code,
      'after self-closing slash',
      '`>` to end the tag' +
        (code === codes2.asterisk || code === codes2.slash
          ? ' (note: JS comments in JSX tags are not supported in MDX)'
          : '')
    )
  }
  const tagEnd = function (code) {
    effects.enter(tagMarkerType)
    effects.consume(code)
    effects.exit(tagMarkerType)
    effects.exit(tagType)
    return ok
  }
  const optionalEsWhitespace = function (code) {
    if (markdownLineEnding(code)) {
      if (allowLazy) {
        effects.enter(types.lineEnding)
        effects.consume(code)
        effects.exit(types.lineEnding)
        return factorySpace(
          effects,
          optionalEsWhitespace,
          types.linePrefix,
          constants.tabSize
        )
      }
      return effects.attempt(
        lazyLineEnd,
        factorySpace(
          effects,
          optionalEsWhitespace,
          types.linePrefix,
          constants.tabSize
        ),
        crashEol
      )(code)
    }
    if (markdownSpace(code) || unicodeWhitespace(code)) {
      effects.enter('esWhitespace')
      return optionalEsWhitespaceContinue(code)
    }
    return returnState(code)
  }
  const optionalEsWhitespaceContinue = function (code) {
    if (
      markdownLineEnding(code) ||
      !(markdownSpace(code) || unicodeWhitespace(code))
    ) {
      effects.exit('esWhitespace')
      return optionalEsWhitespace(code)
    }
    effects.consume(code)
    return optionalEsWhitespaceContinue
  }
  function crashEol() {
    throw new VFileMessage2(
      'Unexpected lazy line in container, expected line to be prefixed with `>` when in a block quote, whitespace when in a list, etc',
      self.now(),
      'micromark-extension-mdx-jsx:unexpected-eof'
    )
  }
  function crash(code, at, expect) {
    throw new VFileMessage2(
      'Unexpected ' +
        (code === codes2.eof
          ? 'end of file'
          : 'character `' +
            (code === codes2.graveAccent
              ? '` ` `'
              : String.fromCodePoint(code)) +
            '` (' +
            serializeCharCode(code) +
            ')') +
        ' ' +
        at +
        ', expected ' +
        expect,
      self.now(),
      'micromark-extension-mdx-jsx:unexpected-' +
        (code === codes2.eof ? 'eof' : 'character')
    )
  }
  return start
}
var tokenizeLazyLineEnd = function (effects, ok, nok) {
  const self = this
  const start = function (code) {
    assert(markdownLineEnding(code), 'expected eol')
    effects.enter(types.lineEnding)
    effects.consume(code)
    effects.exit(types.lineEnding)
    return lineStart
  }
  const lineStart = function (code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code)
  }
  return start
}
var serializeCharCode = function (code) {
  return (
    'U+' +
    code
      .toString(constants.numericBaseHexadecimal)
      .toUpperCase()
      .padStart(4, '0')
  )
}
var lazyLineEnd = { tokenize: tokenizeLazyLineEnd, partial: true }

// ../mdx/src/next/shortcodes/lib/jsx-text.ts
var jsxText = function (acorn2, acornOptions, addResult, pattern) {
  const tokenizeJsxText = function (effects, ok, nok) {
    const self = this
    return factoryTag.call(
      self,
      effects,
      ok,
      nok,
      acorn2,
      acornOptions,
      addResult,
      true,
      'mdxJsxTextTag',
      'mdxJsxTextTagMarker',
      'mdxJsxTextTagClosingMarker',
      'mdxJsxTextTagSelfClosingMarker',
      'mdxJsxTextTagName',
      'mdxJsxTextTagNamePrimary',
      'mdxJsxTextTagNameMemberMarker',
      'mdxJsxTextTagNameMember',
      'mdxJsxTextTagNamePrefixMarker',
      'mdxJsxTextTagNameLocal',
      'mdxJsxTextTagExpressionAttribute',
      'mdxJsxTextTagExpressionAttributeMarker',
      'mdxJsxTextTagExpressionAttributeValue',
      'mdxJsxTextTagAttribute',
      'mdxJsxTextTagAttributeName',
      'mdxJsxTextTagAttributeNamePrimary',
      'mdxJsxTextTagAttributeNamePrefixMarker',
      'mdxJsxTextTagAttributeNameLocal',
      'mdxJsxTextTagAttributeInitializerMarker',
      'mdxJsxTextTagAttributeValueLiteral',
      'mdxJsxTextTagAttributeValueLiteralMarker',
      'mdxJsxTextTagAttributeValueLiteralValue',
      'mdxJsxTextTagAttributeValueExpression',
      'mdxJsxTextTagAttributeValueExpressionMarker',
      'mdxJsxTextTagAttributeValueExpressionValue',
      pattern
    )
  }
  return { tokenize: tokenizeJsxText }
}

// ../mdx/src/next/shortcodes/lib/jsx-flow.ts
import { factorySpace as factorySpace2 } from 'micromark-factory-space'
import { markdownLineEnding as markdownLineEnding2 } from 'micromark-util-character'
import { codes as codes3 } from 'micromark-util-symbol/codes.js'
import { types as types2 } from 'micromark-util-symbol/types.js'
var jsxFlow = function (acorn2, acornOptions, addResult, pattern) {
  const tokenizeJsxFlow = function (effects, ok, nok) {
    const self = this
    const start = function (code) {
      return factoryTag.call(
        self,
        effects,
        factorySpace2(effects, after, types2.whitespace),
        nok,
        acorn2,
        acornOptions,
        addResult,
        false,
        'mdxJsxFlowTag',
        'mdxJsxFlowTagMarker',
        'mdxJsxFlowTagClosingMarker',
        'mdxJsxFlowTagSelfClosingMarker',
        'mdxJsxFlowTagName',
        'mdxJsxFlowTagNamePrimary',
        'mdxJsxFlowTagNameMemberMarker',
        'mdxJsxFlowTagNameMember',
        'mdxJsxFlowTagNamePrefixMarker',
        'mdxJsxFlowTagNameLocal',
        'mdxJsxFlowTagExpressionAttribute',
        'mdxJsxFlowTagExpressionAttributeMarker',
        'mdxJsxFlowTagExpressionAttributeValue',
        'mdxJsxFlowTagAttribute',
        'mdxJsxFlowTagAttributeName',
        'mdxJsxFlowTagAttributeNamePrimary',
        'mdxJsxFlowTagAttributeNamePrefixMarker',
        'mdxJsxFlowTagAttributeNameLocal',
        'mdxJsxFlowTagAttributeInitializerMarker',
        'mdxJsxFlowTagAttributeValueLiteral',
        'mdxJsxFlowTagAttributeValueLiteralMarker',
        'mdxJsxFlowTagAttributeValueLiteralValue',
        'mdxJsxFlowTagAttributeValueExpression',
        'mdxJsxFlowTagAttributeValueExpressionMarker',
        'mdxJsxFlowTagAttributeValueExpressionValue',
        pattern
      )(code)
    }
    const after = function (code) {
      return code === codes3.lessThan
        ? start(code)
        : code === codes3.eof || markdownLineEnding2(code)
        ? ok(code)
        : nok(code)
    }
    return start
  }
  return { tokenize: tokenizeJsxFlow, concrete: true }
}

// ../mdx/src/next/shortcodes/lib/syntax.ts
function mdxJsx(options = {}) {
  const acorn2 = options.acorn
  let acornOptions
  if (acorn2) {
    if (!acorn2.parse || !acorn2.parseExpressionAt) {
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
  const flowRules = {}
  const textRules = {}
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
            jsxFlow(acorn2, acornOptions, options.addResult, pattern),
          ]
        : [jsxFlow(acorn2, acornOptions, options.addResult, pattern)]
    } else {
      const existing = textRules[firstCharacter]
      textRules[firstCharacter] = existing
        ? [
            ...existing,
            jsxText(acorn2, acornOptions, options.addResult, pattern),
          ]
        : [jsxText(acorn2, acornOptions, options.addResult, pattern)]
    }
  })
  return {
    flow: flowRules,
    text: textRules,
  }
}

// ../mdx/src/next/parse/markdown.ts
import * as acorn from 'acorn'
var fromMarkdown = (value, field) => {
  const patterns = getFieldPatterns(field)
  const acornDefault = acorn
  const tree = mdastFromMarkdown(value, {
    extensions: [mdxJsx({ acorn: acornDefault, patterns, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown({ patterns })],
  })
  return tree
}

// ../mdx/src/next/parse/index.ts
import { compact } from 'mdast-util-compact'

// ../mdx/src/next/parse/post-processing.ts
import { visit } from 'unist-util-visit'

// ../mdx/src/parse/remarkToPlate.ts
import { flatten } from 'lodash-es'

// ../mdx/src/parse/acorn.ts
var extractAttributes = (attributes2, fields, imageCallback) => {
  const properties = {}
  attributes2?.forEach((attribute) => {
    assertType(attribute, 'mdxJsxAttribute')
    const field = fields.find((field2) => field2.name === attribute.name)
    if (!field) {
      throw new Error(
        `Unable to find field definition for property "${attribute.name}"`
      )
    }
    try {
      properties[attribute.name] = extractAttribute(
        attribute,
        field,
        imageCallback
      )
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(
          `Unable to parse field value for field "${field.name}" (type: ${field.type}). ${e.message}`
        )
      }
      throw e
    }
  })
  return properties
}
var extractAttribute = (attribute, field, imageCallback) => {
  switch (field.type) {
    case 'boolean':
    case 'number':
      return extractScalar(extractExpression(attribute), field)
    case 'datetime':
    case 'string':
      if (field.list) {
        return extractScalar(extractExpression(attribute), field)
      } else {
        return extractString(attribute, field)
      }
    case 'image':
      if (field.list) {
        const values3 = extractScalar(extractExpression(attribute), field)
        return values3.split(',').map((value) => imageCallback(value))
      } else {
        const value = extractString(attribute, field)
        return imageCallback(value)
      }
    case 'reference':
      if (field.list) {
        return extractScalar(extractExpression(attribute), field)
      } else {
        return extractString(attribute, field)
      }
    case 'object':
      return extractObject(extractExpression(attribute), field)
    case 'rich-text':
      const JSXString = extractRaw(attribute)
      if (JSXString) {
        return parseMDX(JSXString, field, imageCallback)
      } else {
        return {}
      }
    default:
      throw new Error(`Extract attribute: Unhandled field type ${field.type}`)
  }
}
var extractScalar = (attribute, field) => {
  if (field.list) {
    assertType(attribute.expression, 'ArrayExpression')
    return attribute.expression.elements.map((element) => {
      assertHasType(element)
      assertType(element, 'Literal')
      return element.value
    })
  } else {
    assertType(attribute.expression, 'Literal')
    return attribute.expression.value
  }
}
var extractObject = (attribute, field) => {
  if (field.list) {
    assertType(attribute.expression, 'ArrayExpression')
    return attribute.expression.elements.map((element) => {
      assertHasType(element)
      assertType(element, 'ObjectExpression')
      return extractObjectExpression(element, field)
    })
  } else {
    assertType(attribute.expression, 'ObjectExpression')
    return extractObjectExpression(attribute.expression, field)
  }
}
var extractObjectExpression = (expression, field) => {
  const properties = {}
  expression.properties?.forEach((property) => {
    assertType(property, 'Property')
    const { key, value } = extractKeyValue(property, field)
    properties[key] = value
  })
  return properties
}
var getField = (objectField, name) => {
  if (objectField.fields) {
    if (typeof objectField.fields === 'string') {
      throw new Error('Global templates not supported')
    }
    return objectField.fields.find((f) => f.name === name)
  }
}
var extractKeyValue = (property, parentField) => {
  assertType(property.key, 'Identifier')
  const key = property.key.name
  const field = getField(parentField, key)
  if (field?.type === 'object') {
    if (field.list) {
      assertType(property.value, 'ArrayExpression')
      const value = property.value.elements.map((element) => {
        assertHasType(element)
        assertType(element, 'ObjectExpression')
        return extractObjectExpression(element, field)
      })
      return { key, value }
    } else {
      assertType(property.value, 'ObjectExpression')
      const value = extractObjectExpression(property.value, field)
      return { key, value }
    }
  } else {
    assertType(property.value, 'Literal')
    return { key, value: property.value.value }
  }
}
var extractStatement = (attribute) => {
  const body = attribute.data?.estree?.body
  if (body) {
    if (body[0]) {
      assertType(body[0], 'ExpressionStatement')
      return body[0]
    }
  }
  throw new Error(`Unable to extract body from expression`)
}
var extractString = (attribute, field) => {
  if (attribute.type === 'mdxJsxAttribute') {
    if (typeof attribute.value === 'string') {
      return attribute.value
    }
  }
  return extractScalar(extractExpression(attribute), field)
}
var extractExpression = (attribute) => {
  assertType(attribute, 'mdxJsxAttribute')
  assertHasType(attribute.value)
  assertType(attribute.value, 'mdxJsxAttributeValueExpression')
  return extractStatement(attribute.value)
}
var extractRaw = (attribute) => {
  assertType(attribute, 'mdxJsxAttribute')
  assertHasType(attribute.value)
  assertType(attribute.value, 'mdxJsxAttributeValueExpression')
  const rawValue = attribute.value.value
  return trimFragments(rawValue)
}
function assertType(val, type) {
  if (val.type !== type) {
    throw new Error(
      `Expected type to be ${type} but received ${val.type}. ${MDX_PARSE_ERROR_MSG}`
    )
  }
}
function assertHasType(val) {
  if (val) {
    if (typeof val !== 'string') {
      return
    }
  }
  throw new Error(`Expect value to be an object with property "type"`)
}
var trimFragments = (string) => {
  const rawArr = string.split('\n')
  let openingFragmentIndex = null
  let closingFragmentIndex = null
  rawArr.forEach((item, index) => {
    if (item.trim() === '<>') {
      if (!openingFragmentIndex) {
        openingFragmentIndex = index + 1
      }
    }
  })
  rawArr.reverse().forEach((item, index) => {
    if (item.trim() === '</>') {
      const length = rawArr.length - 1
      if (!closingFragmentIndex) {
        closingFragmentIndex = length - index
      }
    }
  })
  const value = rawArr
    .reverse()
    .slice(openingFragmentIndex || 0, closingFragmentIndex || rawArr.length - 1)
    .join('\n')
  return value
}

// ../mdx/src/parse/mdx.ts
import { source } from 'unist-util-source'
function mdxJsxElement(node, field, imageCallback) {
  try {
    const template = field.templates?.find((template2) => {
      const templateName =
        typeof template2 === 'string' ? template2 : template2.name
      return templateName === node.name
    })
    if (typeof template === 'string') {
      throw new Error('Global templates not yet supported')
    }
    if (!template) {
      const string = toTinaMarkdown2({ type: 'root', children: [node] }, field)
      return {
        type: node.type === 'mdxJsxFlowElement' ? 'html' : 'html_inline',
        value: string.trim(),
        children: [{ type: 'text', text: '' }],
      }
    }
    const props = extractAttributes(
      node.attributes,
      template.fields,
      imageCallback
    )
    const childField = template.fields.find(
      (field2) => field2.name === 'children'
    )
    if (childField) {
      if (childField.type === 'rich-text') {
        props.children = remarkToSlate(node, childField, imageCallback)
      }
    }
    return {
      type: node.type,
      name: node.name,
      children: [{ type: 'text', text: '' }],
      props,
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new RichTextParseError(e.message, node.position)
    }
    throw e
  }
}
var directiveElement = (node, field, imageCallback, raw) => {
  let template
  template = field.templates?.find((template2) => {
    const templateName =
      typeof template2 === 'string' ? template2 : template2.name
    return templateName === node.name
  })
  if (typeof template === 'string') {
    throw new Error('Global templates not yet supported')
  }
  if (!template) {
    template = field.templates?.find((template2) => {
      const templateName = template2?.match?.name
      return templateName === node.name
    })
  }
  if (!template) {
    return {
      type: 'p',
      children: [{ type: 'text', text: source(node, raw || '') || '' }],
    }
  }
  if (typeof template === 'string') {
    throw new Error(`Global templates not supported`)
  }
  const props = node.attributes || {}
  const childField = template.fields.find(
    (field2) => field2.name === 'children'
  )
  if (childField) {
    if (childField.type === 'rich-text') {
      if (node.type === 'containerDirective') {
        props.children = remarkToSlate(node, childField, imageCallback, raw)
      }
    }
  }
  return {
    type: 'mdxJsxFlowElement',
    name: template.name,
    props,
    children: [{ type: 'text', text: '' }],
  }
}

// ../mdx/src/parse/remarkToPlate.ts
var remarkToSlate = (root, field, imageCallback, raw, skipMDXProcess) => {
  const mdxJsxElement2 = skipMDXProcess ? (node) => node : mdxJsxElement
  const content = (content2) => {
    switch (content2.type) {
      case 'blockquote':
        const children = []
        content2.children.map((child) => {
          const inlineElements = unwrapBlockContent(child)
          inlineElements.forEach((child2) => {
            children.push(child2)
          })
        })
        return {
          type: 'blockquote',
          children,
        }
      case 'heading':
        return heading(content2)
      case 'code':
        return code(content2)
      case 'paragraph':
        return paragraph(content2)
      case 'mdxJsxFlowElement':
        return mdxJsxElement2(content2, field, imageCallback)
      case 'thematicBreak':
        return {
          type: 'hr',
          children: [{ type: 'text', text: '' }],
        }
      case 'listItem':
        return {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: flatten(
                content2.children.map((child) => unwrapBlockContent(child))
              ),
            },
          ],
        }
      case 'list':
        return list(content2)
      case 'html':
        return html(content2)
      case 'mdxFlowExpression':
      case 'mdxjsEsm':
        throw new RichTextParseError(
          `Unexpected expression ${content2.value}.`,
          content2.position
        )
      case 'leafDirective': {
        return directiveElement(content2, field, imageCallback, raw)
      }
      case 'containerDirective': {
        return directiveElement(content2, field, imageCallback, raw)
      }
      default:
        throw new RichTextParseError(
          `Content: ${content2.type} is not yet supported`,
          content2.position
        )
    }
  }
  const html = (content2) => {
    return {
      type: 'p',
      children: [{ type: 'text', text: content2.value }],
    }
  }
  const html_inline = (content2) => {
    return { type: 'text', text: content2.value }
  }
  const list = (content2) => {
    return {
      type: content2.ordered ? 'ol' : 'ul',
      children: content2.children.map((child) => listItem(child)),
    }
  }
  const listItem = (content2) => {
    return {
      type: 'li',
      children: content2.children.map((child) => {
        switch (child.type) {
          case 'list':
            return list(child)
          case 'heading':
          case 'paragraph':
            return {
              type: 'lic',
              children: flatten(
                child.children.map((child2) => phrasingContent(child2))
              ),
            }
          case 'blockquote': {
            return {
              ...blockquote(child),
              type: 'lic',
            }
          }
          case 'mdxJsxFlowElement':
            return {
              type: 'lic',
              children: [
                mdxJsxElement2(
                  { ...child, type: 'mdxJsxTextElement' },
                  field,
                  imageCallback
                ),
              ],
            }
          case 'html':
            return {
              type: 'lic',
              children: html_inline(child),
            }
          case 'leafDirective': {
            return {
              type: 'lic',
              children: [directiveElement(child, field, imageCallback)],
            }
          }
          case 'code':
          case 'thematicBreak':
          case 'table':
            throw new RichTextParseError(
              `${child.type} inside list item is not supported`,
              child.position
            )
          default:
            throw new RichTextParseError(
              `Unknown list item of type ${child.type}`,
              child.position
            )
        }
      }),
    }
  }
  const unwrapBlockContent = (content2) => {
    const flattenPhrasingContent = (children) => {
      const children2 = children.map((child) => phrasingContent(child))
      return flatten(Array.isArray(children2) ? children2 : [children2])
    }
    switch (content2.type) {
      case 'heading':
      case 'paragraph':
        return flattenPhrasingContent(content2.children)
      case 'html':
        return [html_inline(content2)]
      case 'blockquote':
      default:
        throw new RichTextParseError(
          `UnwrapBlock: Unknown block content of type ${content2.type}`,
          content2.position
        )
    }
  }
  const code = (content2) => {
    const extra = {}
    if (content2.lang) extra['lang'] = content2.lang
    return {
      type: 'code_block',
      ...extra,
      value: content2.value,
      children: [{ type: 'text', text: '' }],
    }
  }
  const link = (content2) => {
    return {
      type: 'a',
      url: content2.url,
      title: content2.title,
      children: flatten(
        content2.children.map((child) => staticPhrasingContent(child))
      ),
    }
  }
  const heading = (content2) => {
    return {
      type: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'][content2.depth - 1],
      children: flatten(content2.children.map(phrasingContent)),
    }
  }
  const staticPhrasingContent = (content2) => {
    switch (content2.type) {
      case 'mdxJsxTextElement':
        return mdxJsxElement2(content2, field, imageCallback)
      case 'text':
        return text5(content2)
      case 'inlineCode':
      case 'emphasis':
      case 'image':
      case 'strong':
        return phrashingMark(content2)
      case 'html':
        return html_inline(content2)
      default:
        throw new Error(
          `StaticPhrasingContent: ${content2.type} is not yet supported`
        )
    }
  }
  const phrasingContent = (content2) => {
    switch (content2.type) {
      case 'text':
        return text5(content2)
      case 'link':
        return link(content2)
      case 'image':
        return image(content2)
      case 'mdxJsxTextElement':
        return mdxJsxElement2(content2, field, imageCallback)
      case 'emphasis':
        return phrashingMark(content2)
      case 'strong':
        return phrashingMark(content2)
      case 'break':
        return breakContent()
      case 'inlineCode':
        return phrashingMark(content2)
      case 'html':
        return html_inline(content2)
      case 'mdxTextExpression':
        throw new RichTextParseError(
          `Unexpected expression ${content2.value}.`,
          content2.position
        )
      default:
        throw new Error(
          `PhrasingContent: ${content2.type} is not yet supported`
        )
    }
  }
  const breakContent = () => {
    return {
      type: 'break',
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
    }
  }
  const phrashingMark = (node, marks = []) => {
    const accum = []
    switch (node.type) {
      case 'emphasis': {
        const children = flatten(
          node.children.map((child) =>
            phrashingMark(child, [...marks, 'italic'])
          )
        )
        children.forEach((child) => {
          accum.push(child)
        })
        break
      }
      case 'inlineCode': {
        const markProps2 = {}
        marks.forEach((mark) => (markProps2[mark] = true))
        accum.push({
          type: 'text',
          text: node.value,
          code: true,
          ...markProps2,
        })
        break
      }
      case 'strong': {
        const children = flatten(
          node.children.map((child) => phrashingMark(child, [...marks, 'bold']))
        )
        children.forEach((child) => {
          accum.push(child)
        })
        break
      }
      case 'image': {
        accum.push(image(node))
        break
      }
      case 'link': {
        const children = flatten(
          node.children.map((child) => phrashingMark(child, marks))
        )
        accum.push({ type: 'a', url: node.url, title: node.title, children })
        break
      }
      case 'html':
      case 'text':
        const markProps = {}
        marks.forEach((mark) => (markProps[mark] = true))
        accum.push({ type: 'text', text: node.value, ...markProps })
        break
      case 'break':
        accum.push(breakContent())
        break
      default:
        throw new RichTextParseError(
          `Unexpected inline element of type ${node.type}`,
          node?.position
        )
    }
    return accum
  }
  const image = (content2) => {
    return {
      type: 'img',
      url: imageCallback(content2.url),
      alt: content2.alt || void 0,
      caption: content2.title,
      children: [{ type: 'text', text: '' }],
    }
  }
  const text5 = (content2) => {
    return {
      type: 'text',
      text: content2.value,
    }
  }
  const blockquote = (content2) => {
    const children = []
    content2.children.map((child) => {
      const inlineElements = unwrapBlockContent(child)
      inlineElements.forEach((child2) => {
        children.push(child2)
      })
    })
    return {
      type: 'blockquote',
      children,
    }
  }
  const paragraph = (content2) => {
    const children = flatten(content2.children.map(phrasingContent))
    if (children.length === 1) {
      if (children[0]) {
        if (children[0].type === 'html_inline') {
          return {
            ...children[0],
            type: 'html',
          }
        }
      }
    }
    return {
      type: 'p',
      children,
    }
  }
  return {
    type: 'root',
    children: root.children.map((child) => {
      return content(child)
    }),
  }
}
var RichTextParseError = class extends Error {
  position
  constructor(message, position) {
    super(message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RichTextParseError)
    }
    this.name = 'RichTextParseError'
    this.position = position
  }
}

// ../mdx/src/next/parse/post-processing.ts
var postProcessor = (tree, field, imageCallback) => {
  try {
    const addPropsToMdxFlow = (node) => {
      const props = {}
      node.attributes.forEach((attribute) => {
        if (attribute.type === 'mdxJsxAttribute') {
          props[attribute.name] = attribute.value
        } else {
          throw new Error('HANDLE mdxJsxExpressionAttribute')
        }
      })
      if (node.children.length) {
        let tree2
        if (node.type === 'mdxJsxTextElement') {
          tree2 = postProcessor(
            {
              type: 'root',
              children: [{ type: 'paragraph', children: node.children }],
            },
            field,
            imageCallback
          )
        } else {
          tree2 = postProcessor(
            { type: 'root', children: node.children },
            field,
            imageCallback
          )
        }
        props.children = tree2
      }
      node.props = props
      delete node.attributes
      node.children = [{ type: 'text', text: '' }]
    }
    visit(tree, 'mdxJsxFlowElement', addPropsToMdxFlow)
    visit(tree, 'mdxJsxTextElement', addPropsToMdxFlow)
    return remarkToSlate(tree, field, imageCallback, '', true)
  } catch (e) {
    console.log(e)
  }
}

// ../mdx/src/next/parse/index.ts
var parseMDX2 = (value, field, imageCallback) => {
  const backup = (v) => v
  const callback = imageCallback || backup
  const tree = fromMarkdown(value, field)
  return postProcess(tree, field, callback)
}
var postProcess = (tree, field, imageCallback) => {
  return postProcessor(compact(tree), field, imageCallback)
}

// ../mdx/src/parse/index.ts
import { fromMarkdown as fromMarkdown2 } from 'mdast-util-from-markdown'

// ../mdx/src/extensions/tina-shortcodes/from-markdown.ts
import { parseEntities as parseEntities2 } from 'parse-entities'

// ../mdx/src/extensions/tina-shortcodes/shortcode-leaf.ts
import { factorySpace as factorySpace4 } from 'micromark-factory-space'
import {
  markdownLineEnding as markdownLineEnding4,
  markdownSpace as markdownSpace3,
} from 'micromark-util-character'
import { codes as codes6 } from 'micromark-util-symbol/codes'
import { values as values2 } from 'micromark-util-symbol/values'
import { types as types4 } from 'micromark-util-symbol/types'

// ../mdx/src/extensions/tina-shortcodes/factory-attributes.ts
import { factorySpace as factorySpace3 } from 'micromark-factory-space'
import { factoryWhitespace } from 'micromark-factory-whitespace'
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding as markdownLineEnding3,
  markdownLineEndingOrSpace as markdownLineEndingOrSpace2,
  markdownSpace as markdownSpace2,
} from 'micromark-util-character'
import { codes as codes4 } from 'micromark-util-symbol/codes'
import { types as types3 } from 'micromark-util-symbol/types'

// ../mdx/src/extensions/tina-shortcodes/factory-name.ts
import {
  asciiAlpha as asciiAlpha2,
  asciiAlphanumeric as asciiAlphanumeric2,
} from 'micromark-util-character'
import { codes as codes5 } from 'micromark-util-symbol/codes'

// ../mdx/src/extensions/tina-shortcodes/shortcode-container.ts
import { ok as assert2 } from 'uvu/assert'
import { factorySpace as factorySpace5 } from 'micromark-factory-space'
import {
  markdownLineEnding as markdownLineEnding5,
  markdownSpace as markdownSpace4,
} from 'micromark-util-character'
import { codes as codes7 } from 'micromark-util-symbol/codes'
import { constants as constants2 } from 'micromark-util-symbol/constants'
import { types as types5 } from 'micromark-util-symbol/types'

// ../mdx/src/parse/parseShortcode.ts
function parseShortcode(preprocessedString, template) {
  const match = template.match
  const unkeyedAttributes = !!template.fields.find((t) => t.name === '_value')
  const hasChildren = !!template.fields.find((t) => t.name == 'children')
  const replacement = `<${template.name} ${
    unkeyedAttributes ? '_value="$1"' : '$1'
  }>${hasChildren ? '$2' : '\n'}</${template.name}>`
  const endRegex = `((?:.|\\n)*)${match.start}\\s/\\s*${
    match.name || template.name
  }[\\s]*${match.end}`
  const regex = `${match.start}\\s*${match.name || template.name}[\\s]+${
    unkeyedAttributes ? `['"]?(.*?)['"]?` : '(.*?)'
  }[\\s]*${match.end}${hasChildren ? endRegex : ''}`
  return replaceAll(preprocessedString, regex, replacement)
}

// ../mdx/src/parse/index.ts
var mdxToAst = (value) => {
  return remark().use(remarkMdx).parse(value)
}
var MDX_PARSE_ERROR_MSG =
  'TinaCMS supports a stricter version of markdown and a subset of MDX. https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations'
var parseMDX = (value, field, imageCallback) => {
  if (!value) {
    return { type: 'root', children: [] }
  }
  let tree
  try {
    if (field.parser?.type === 'markdown') {
      return parseMDX2(value, field, imageCallback)
    }
    let preprocessedString = value
    const templatesWithMatchers = field.templates?.filter(
      (template) => template.match
    )
    templatesWithMatchers?.forEach((template) => {
      if (typeof template === 'string') {
        throw new Error('Global templates are not supported')
      }
      if (template.match) {
        if (preprocessedString) {
          preprocessedString = parseShortcode(preprocessedString, template)
        }
      }
    })
    tree = mdxToAst(preprocessedString)
    if (tree) {
      return remarkToSlate(tree, field, imageCallback, value)
    } else {
      return { type: 'root', children: [] }
    }
  } catch (e) {
    if (e instanceof RichTextParseError) {
      return invalidMarkdown(e, value)
    }
    return invalidMarkdown(new RichTextParseError(e.message), value)
  }
}
var invalidMarkdown = (e, value) => {
  const extra = {}
  if (e.position && Object.keys(e.position).length) {
    extra['position'] = e.position
  }
  return {
    type: 'root',
    children: [
      {
        type: 'invalid_markdown',
        value,
        message: e.message || `Error parsing markdown ${MDX_PARSE_ERROR_MSG}`,
        children: [{ type: 'text', text: '' }],
        ...extra,
      },
    ],
  }
}
var replaceAll = (string, target, value) => {
  const regex = new RegExp(target, 'g')
  return string.valueOf().replace(regex, value)
}
export { parseMDX, stringifyMDX }
