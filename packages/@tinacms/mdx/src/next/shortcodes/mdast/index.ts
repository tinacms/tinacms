import { ccount } from 'ccount'
import { parseEntities } from 'parse-entities'
import { stringifyPosition } from 'unist-util-stringify-position'
import { VFileMessage } from 'vfile-message'
import { stringifyEntitiesLight } from 'stringify-entities'
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow.js'
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing.js'
import { indentLines } from 'mdast-util-to-markdown/lib/util/indent-lines.js'
import { track } from 'mdast-util-to-markdown/lib/util/track.js'
import { Pattern } from '../lib/syntax'
import type {
  Handle as FromMarkdownHandle,
  Token,
  OnEnterError,
  OnExitError,
} from 'mdast-util-from-markdown'
import type {
  Handle as ToMarkdownHandle,
  Map as ToMarkdownMap,
  Options,
} from 'mdast-util-to-markdown'
import type {
  MdxJsxAttributeValueExpression,
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx-jsx'

type Tag = {
  name: string | undefined
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  close: boolean
  selfClosing: boolean
  start: Token['start']
  end: Token['end']
  shouldFallback?: boolean
}

export function mdxJsxFromMarkdown({ patterns }: { patterns: Pattern[] }) {
  const buffer: FromMarkdownHandle = function () {
    this.buffer()
  }

  const data: FromMarkdownHandle = function (token) {
    this.config?.enter?.data?.call(this, token)
    this.config?.exit?.data?.call(this, token)
  }

  const enterMdxJsxTag: FromMarkdownHandle = function (token) {
    const tag: Tag = {
      name: undefined,
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

  const enterMdxJsxTagClosingMarker: FromMarkdownHandle = function (token) {
    const stack: Array<Tag> | undefined = this.getData('mdxJsxTagStack')
    const tag: Tag | undefined = this.getData('mdxJsxTag')

    if (stack?.length === 0) {
      // Indicate that when we're exiting this tag, we should transform
      // it into text node instead
      if (tag) {
        tag.shouldFallback = true
      }
      // throw new VFileMessage(
      //   'Unexpected closing slash `/` in tag, expected an open tag first, be sure your opening tag is formatted properly',
      //   { start: token.start, end: token.end },
      //   'mdast-util-mdx-jsx:unexpected-closing-slash'
      // )
    }
  }

  const enterMdxJsxTagAnyAttribute: FromMarkdownHandle = function (token) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')

    // We're still treating this token as invalid, but instead
    // of erroring, we'll tokenize it as a text value
    // if (tag?.close) {
    //   throw new VFileMessage(
    //     'Unexpected attribute in closing tag, expected the end of the tag',
    //     { start: token.start, end: token.end },
    //     'mdast-util-mdx-jsx:unexpected-attribute'
    //   )
    // }
  }

  const enterMdxJsxTagSelfClosingMarker: FromMarkdownHandle = function (token) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')

    if (tag?.close) {
      throw new VFileMessage(
        'Unexpected self-closing slash `/` in closing tag, expected the end of the tag',
        { start: token.start, end: token.end },
        'mdast-util-mdx-jsx:unexpected-self-closing-slash'
      )
    }
  }

  const exitMdxJsxTagClosingMarker: FromMarkdownHandle = function () {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (tag) {
      tag.close = true
    }
  }

  const exitMdxJsxTagNamePrimary: FromMarkdownHandle = function (token) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (tag) {
      tag.name = this.sliceSerialize(token)
    }
  }

  const exitMdxJsxTagNameMember: FromMarkdownHandle = function (token) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (tag) {
      tag.name += '.' + this.sliceSerialize(token)
    }
  }

  const exitMdxJsxTagNameLocal: FromMarkdownHandle = function (token) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (tag) {
      tag.name += ':' + this.sliceSerialize(token)
    }
  }

  const enterMdxJsxTagAttribute: FromMarkdownHandle = function (token) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    enterMdxJsxTagAnyAttribute.call(this, token)
    if (tag) {
      tag.attributes.push({ type: 'mdxJsxAttribute', name: '', value: null })
    }
  }

  const enterMdxJsxTagExpressionAttribute: FromMarkdownHandle = function (
    token
  ) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    enterMdxJsxTagAnyAttribute.call(this, token)
    if (tag) {
      tag.attributes.push({ type: 'mdxJsxExpressionAttribute', value: '' })
    }
    this.buffer()
  }

  const exitMdxJsxTagExpressionAttribute: FromMarkdownHandle = function (
    token
  ) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (tag) {
      const tail: MdxJsxExpressionAttribute | MdxJsxAttribute | undefined =
        tag.attributes[tag.attributes.length - 1]

      /** @type {Program | undefined} */
      // @ts-expect-error: custom.
      const estree = token.estree

      if (tail) {
        tail.value = this.resume()

        if (estree) {
          tail.data = { estree }
        }
      }
    }
  }

  const exitMdxJsxTagAttributeNamePrimary: FromMarkdownHandle = function (
    token
  ) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (tag) {
      const node:
        | (MdxJsxExpressionAttribute & { name?: string })
        | (MdxJsxAttribute & { name?: string })
        | undefined = tag.attributes[tag.attributes.length - 1]
      if (node) {
        node.name = this.sliceSerialize(token)
      }
    }
  }

  const exitMdxJsxTagAttributeNameLocal: FromMarkdownHandle = function (token) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (tag) {
      const node:
        | (MdxJsxExpressionAttribute & { name?: string })
        | (MdxJsxAttribute & { name?: string })
        | undefined = tag.attributes[tag.attributes.length - 1]
      if (node) {
        node.name += ':' + this.sliceSerialize(token)
      }
    }
  }

  const exitMdxJsxTagAttributeValueLiteral: FromMarkdownHandle = function () {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (tag) {
      const attribute:
        | (MdxJsxExpressionAttribute & { name?: string })
        | (MdxJsxAttribute & { name?: string })
        | undefined = tag.attributes[tag.attributes.length - 1]
      // Support for unkeyed attributes
      if (attribute) {
        if (attribute.name === '') {
          attribute.name = '_value'
        }
        attribute.value = parseEntities(this.resume(), { nonTerminated: false })
      }
    }
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  const exitMdxJsxTagAttributeValueExpression: FromMarkdownHandle = function (
    token
  ) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (!tag) return
    const tail:
      | (MdxJsxExpressionAttribute & { name?: string })
      | (MdxJsxAttribute & { name?: string })
      | undefined = tag.attributes[tag.attributes.length - 1]

    const node: MdxJsxAttributeValueExpression = {
      type: 'mdxJsxAttributeValueExpression',
      value: this.resume(),
    }
    /** @type {Program | undefined} */
    // @ts-expect-error: custom.
    const estree = token.estree

    if (estree) {
      node.data = { estree }
    }

    if (tail) {
      tail.value = node
    }
  }

  const exitMdxJsxTagSelfClosingMarker: FromMarkdownHandle = function () {
    const tag: Tag | undefined = this.getData('mdxJsxTag')

    if (tag) {
      tag.selfClosing = true
    }
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  const exitMdxJsxTag: FromMarkdownHandle = function (token) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    const stack: Tag[] | undefined = this.getData('mdxJsxTagStack')
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

    // End of a tag, so drop the buffer.
    this.resume()

    if (tag.close) {
      stack.pop()
    } else {
      const pattern = patterns.find((pattern) => pattern.name === tag.name)
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
        // This template allows block children, so
        // we didn't mark it as self-closing. But
        // We didn't receive a closing tag, so close it now.
        // Without this, we would be calling onErrorRightIsTag
        (left, right) => {
          this.exit(right)
        }
      )
    }

    if (tag.selfClosing || tag.close) {
      // This node would be an error in MDX, but we
      // want to basically unwind it and treat it as a
      // plain string instead.
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

  const onErrorRightIsTag: OnEnterError = function (closing, open) {
    const tag: Tag | undefined = this.getData('mdxJsxTag')
    if (!tag) return
    const place = closing ? ' before the end of `' + closing.type + '`' : ''
    const position = closing
      ? { start: closing.start, end: closing.end }
      : undefined

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

  const onErrorLeftIsTag: OnExitError = function (this, a, b) {
    const tag = /** @type {Tag} */ this.getData('mdxJsxTag')
    // this.enter(
    //   {
    //     type: 'text',
    //     value: this.sliceSerialize(a),
    //   },
    //   a
    // )
    // this.exit(a)
    // console.log({ left: a, right: b, tag })
    // throw new VFileMessage(
    //   'Expected the closing tag `' +
    //     serializeAbbreviatedTag(tag) +
    //     '` either after the end of `' +
    //     b.type +
    //     '` (' +
    //     stringifyPosition(b.end) +
    //     ') or another opening tag after the start of `' +
    //     b.type +
    //     '` (' +
    //     stringifyPosition(b.start) +
    //     ')',
    //   { start: a.start, end: a.end },
    //   'mdast-util-mdx-jsx:end-tag-mismatch'
    // )
  }

  /**
   * Serialize a tag, excluding attributes.
   * `self-closing` is not supported, because we don’t need it yet.
   */
  function serializeAbbreviatedTag(tag: Tag) {
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

/**
 * Create an extension for `mdast-util-to-markdown` to enable MDX JSX.
 *
 * This extension configures `mdast-util-to-markdown` with
 * `options.fences: true` and `options.resourceLink: true` too, do not
 * overwrite them!
 *
 */
export const mdxJsxToMarkdown = function (
  options: Options & {
    printWidth?: number
    quoteSmart?: boolean
    tightSelfClosing?: boolean
    patterns: Pattern[]
  }
) {
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

  const mdxElement: ToMarkdownHandle = function (
    node: MdxJsxFlowElement | MdxJsxTextElement,
    _,
    context,
    safeOptions
  ) {
    const pattern = patterns.find((p) => p.templateName === node.name)
    if (!pattern) {
      // FIXME
      return ''
    }
    const patternName = pattern.name || pattern?.templateName
    const tracker = track(safeOptions)
    const selfClosing = pattern.leaf
    const exit = context.enter(node.type)
    let index = -1
    /** @type {Array<string>} */
    const serializedAttributes = []
    let value = tracker.move(pattern.start + ' ' + (patternName || ''))

    // None.
    if (node.attributes && node.attributes.length > 0) {
      if (!node.name) {
        throw new Error('Cannot serialize fragment w/ attributes')
      }

      while (++index < node.attributes.length) {
        const attribute = node.attributes[index]
        /** @type {string} */
        let result

        if (attribute?.type === 'mdxJsxExpressionAttribute') {
          result = '{' + (attribute.value || '') + '}'
        } else {
          if (!attribute?.name) {
            throw new Error('Cannot serialize attribute w/o name')
          }

          const value = attribute.value
          const left = attribute.name
          /** @type {string} */
          let right = ''

          if (value === undefined || value === null) {
            // Empty.
          } else if (typeof value === 'object') {
            right = '{' + (value.value || '') + '}'
          } else {
            // If the alternative is less common than `quote`, switch.
            const appliedQuote =
              quoteSmart && ccount(value, quote) > ccount(value, alternative)
                ? alternative
                : quote
            right =
              appliedQuote +
              stringifyEntitiesLight(value, { subset: [appliedQuote] }) +
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
      // Block:
      node.type === 'mdxJsxFlowElement' &&
      // Including a line ending (expressions).
      (/\r?\n|\r/.test(attributesOnOneLine) ||
        // Current position (including `<tag`).
        tracker.current().now.column +
          // -1 because columns, +1 for ` ` before attributes.
          // Attributes joined by spaces.
          attributesOnOneLine.length +
          // ` />`.
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
      const closingTag =
        pattern.start + ' /' + (patternName || ' ') + ' ' + pattern.end
      value += tracker.move(closingTag)
    }

    exit()
    return value
  }

  const map: ToMarkdownMap = function (line, _, blank) {
    return (blank ? '' : '  ') + line
  }

  const peekElement: ToMarkdownHandle = function () {
    return '<'
  }

  // @ts-ignore
  mdxElement.peek = peekElement

  return {
    ...options,
    handlers: {
      mdxJsxFlowElement: mdxElement,
      mdxJsxTextElement: mdxElement,
    },
    unsafe: [
      { character: '<', inConstruct: ['phrasing' as const] },
      { atBreak: true, character: '<' },
    ],
    // Always generate fenced code (never indented code).
    fences: true,
    // Always generate links with resources (never autolinks).
    resourceLink: true,
  }
}
