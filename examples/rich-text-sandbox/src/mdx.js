// ../mdx/src/parse/index.ts
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'

// ../../../node_modules/.pnpm/mdast-util-to-string@3.1.0/node_modules/mdast-util-to-string/index.js
function toString(node, options) {
  var { includeImageAlt = true } = options || {}
  return one(node, includeImageAlt)
}
function one(node, includeImageAlt) {
  return (
    (node &&
      typeof node === 'object' &&
      (node.value ||
        (includeImageAlt ? node.alt : '') ||
        ('children' in node && all(node.children, includeImageAlt)) ||
        (Array.isArray(node) && all(node, includeImageAlt)))) ||
    ''
  )
}
function all(values2, includeImageAlt) {
  var result = []
  var index = -1
  while (++index < values2.length) {
    result[index] = one(values2[index], includeImageAlt)
  }
  return result.join('')
}

// ../../../node_modules/.pnpm/mdast-util-from-markdown@1.3.0/node_modules/mdast-util-from-markdown/lib/index.js
import { parse } from 'micromark/lib/parse.js'
import { preprocess } from 'micromark/lib/preprocess.js'
import { postprocess } from 'micromark/lib/postprocess.js'

// ../../../node_modules/.pnpm/micromark-util-decode-numeric-character-reference@1.0.0/node_modules/micromark-util-decode-numeric-character-reference/index.js
function decodeNumericCharacterReference(value, base) {
  const code = Number.parseInt(value, base)
  if (
    code < 9 ||
    code === 11 ||
    (code > 13 && code < 32) ||
    (code > 126 && code < 160) ||
    (code > 55295 && code < 57344) ||
    (code > 64975 && code < 65008) ||
    (code & 65535) === 65535 ||
    (code & 65535) === 65534 ||
    code > 1114111
  ) {
    return '\uFFFD'
  }
  return String.fromCharCode(code)
}

// ../../../node_modules/.pnpm/decode-named-character-reference@1.0.2/node_modules/decode-named-character-reference/index.dom.js
var element = document.createElement('i')
function decodeNamedCharacterReference(value) {
  const characterReference = '&' + value + ';'
  element.innerHTML = characterReference
  const char = element.textContent
  if (char.charCodeAt(char.length - 1) === 59 && value !== 'semi') {
    return false
  }
  return char === characterReference ? false : char
}

// ../../../node_modules/.pnpm/micromark-util-decode-string@1.0.2/node_modules/micromark-util-decode-string/index.js
var characterEscapeOrReference =
  /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi
function decodeString(value) {
  return value.replace(characterEscapeOrReference, decode)
}
function decode($0, $1, $2) {
  if ($1) {
    return $1
  }
  const head = $2.charCodeAt(0)
  if (head === 35) {
    const head2 = $2.charCodeAt(1)
    const hex = head2 === 120 || head2 === 88
    return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10)
  }
  return decodeNamedCharacterReference($2) || $0
}

// ../../../node_modules/.pnpm/mdast-util-from-markdown@1.3.0/node_modules/mdast-util-from-markdown/lib/index.js
import { normalizeIdentifier } from 'micromark-util-normalize-identifier'
import { stringifyPosition } from 'unist-util-stringify-position'
var own = {}.hasOwnProperty
var fromMarkdown = function (value, encoding, options) {
  if (typeof encoding !== 'string') {
    options = encoding
    encoding = void 0
  }
  return compiler(options)(
    postprocess(
      parse(options).document().write(preprocess()(value, encoding, true))
    )
  )
}
function compiler(options) {
  const config = {
    transforms: [],
    canContainEols: ['emphasis', 'fragment', 'heading', 'paragraph', 'strong'],
    enter: {
      autolink: opener(link),
      autolinkProtocol: onenterdata,
      autolinkEmail: onenterdata,
      atxHeading: opener(heading),
      blockQuote: opener(blockQuote),
      characterEscape: onenterdata,
      characterReference: onenterdata,
      codeFenced: opener(codeFlow),
      codeFencedFenceInfo: buffer,
      codeFencedFenceMeta: buffer,
      codeIndented: opener(codeFlow, buffer),
      codeText: opener(codeText, buffer),
      codeTextData: onenterdata,
      data: onenterdata,
      codeFlowValue: onenterdata,
      definition: opener(definition),
      definitionDestinationString: buffer,
      definitionLabelString: buffer,
      definitionTitleString: buffer,
      emphasis: opener(emphasis),
      hardBreakEscape: opener(hardBreak),
      hardBreakTrailing: opener(hardBreak),
      htmlFlow: opener(html, buffer),
      htmlFlowData: onenterdata,
      htmlText: opener(html, buffer),
      htmlTextData: onenterdata,
      image: opener(image),
      label: buffer,
      link: opener(link),
      listItem: opener(listItem),
      listItemValue: onenterlistitemvalue,
      listOrdered: opener(list, onenterlistordered),
      listUnordered: opener(list),
      paragraph: opener(paragraph),
      reference: onenterreference,
      referenceString: buffer,
      resourceDestinationString: buffer,
      resourceTitleString: buffer,
      setextHeading: opener(heading),
      strong: opener(strong),
      thematicBreak: opener(thematicBreak),
    },
    exit: {
      atxHeading: closer(),
      atxHeadingSequence: onexitatxheadingsequence,
      autolink: closer(),
      autolinkEmail: onexitautolinkemail,
      autolinkProtocol: onexitautolinkprotocol,
      blockQuote: closer(),
      characterEscapeValue: onexitdata,
      characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
      characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
      characterReferenceValue: onexitcharacterreferencevalue,
      codeFenced: closer(onexitcodefenced),
      codeFencedFence: onexitcodefencedfence,
      codeFencedFenceInfo: onexitcodefencedfenceinfo,
      codeFencedFenceMeta: onexitcodefencedfencemeta,
      codeFlowValue: onexitdata,
      codeIndented: closer(onexitcodeindented),
      codeText: closer(onexitcodetext),
      codeTextData: onexitdata,
      data: onexitdata,
      definition: closer(),
      definitionDestinationString: onexitdefinitiondestinationstring,
      definitionLabelString: onexitdefinitionlabelstring,
      definitionTitleString: onexitdefinitiontitlestring,
      emphasis: closer(),
      hardBreakEscape: closer(onexithardbreak),
      hardBreakTrailing: closer(onexithardbreak),
      htmlFlow: closer(onexithtmlflow),
      htmlFlowData: onexitdata,
      htmlText: closer(onexithtmltext),
      htmlTextData: onexitdata,
      image: closer(onexitimage),
      label: onexitlabel,
      labelText: onexitlabeltext,
      lineEnding: onexitlineending,
      link: closer(onexitlink),
      listItem: closer(),
      listOrdered: closer(),
      listUnordered: closer(),
      paragraph: closer(),
      referenceString: onexitreferencestring,
      resourceDestinationString: onexitresourcedestinationstring,
      resourceTitleString: onexitresourcetitlestring,
      resource: onexitresource,
      setextHeading: closer(onexitsetextheading),
      setextHeadingLineSequence: onexitsetextheadinglinesequence,
      setextHeadingText: onexitsetextheadingtext,
      strong: closer(),
      thematicBreak: closer(),
    },
  }
  configure(config, (options || {}).mdastExtensions || [])
  const data = {}
  return compile
  function compile(events) {
    let tree = {
      type: 'root',
      children: [],
    }
    const context = {
      stack: [tree],
      tokenStack: [],
      config,
      enter: enter2,
      exit: exit2,
      buffer,
      resume,
      setData,
      getData,
    }
    const listStack = []
    let index = -1
    while (++index < events.length) {
      if (
        events[index][1].type === 'listOrdered' ||
        events[index][1].type === 'listUnordered'
      ) {
        if (events[index][0] === 'enter') {
          listStack.push(index)
        } else {
          const tail = listStack.pop()
          index = prepareList(events, tail, index)
        }
      }
    }
    index = -1
    while (++index < events.length) {
      const handler = config[events[index][0]]
      if (own.call(handler, events[index][1].type)) {
        handler[events[index][1].type].call(
          Object.assign(
            {
              sliceSerialize: events[index][2].sliceSerialize,
            },
            context
          ),
          events[index][1]
        )
      }
    }
    if (context.tokenStack.length > 0) {
      const tail = context.tokenStack[context.tokenStack.length - 1]
      const handler = tail[1] || defaultOnError
      handler.call(context, void 0, tail[0])
    }
    tree.position = {
      start: point(
        events.length > 0
          ? events[0][1].start
          : {
              line: 1,
              column: 1,
              offset: 0,
            }
      ),
      end: point(
        events.length > 0
          ? events[events.length - 2][1].end
          : {
              line: 1,
              column: 1,
              offset: 0,
            }
      ),
    }
    index = -1
    while (++index < config.transforms.length) {
      tree = config.transforms[index](tree) || tree
    }
    return tree
  }
  function prepareList(events, start, length) {
    let index = start - 1
    let containerBalance = -1
    let listSpread = false
    let listItem2
    let lineIndex
    let firstBlankLineIndex
    let atMarker
    while (++index <= length) {
      const event = events[index]
      if (
        event[1].type === 'listUnordered' ||
        event[1].type === 'listOrdered' ||
        event[1].type === 'blockQuote'
      ) {
        if (event[0] === 'enter') {
          containerBalance++
        } else {
          containerBalance--
        }
        atMarker = void 0
      } else if (event[1].type === 'lineEndingBlank') {
        if (event[0] === 'enter') {
          if (
            listItem2 &&
            !atMarker &&
            !containerBalance &&
            !firstBlankLineIndex
          ) {
            firstBlankLineIndex = index
          }
          atMarker = void 0
        }
      } else if (
        event[1].type === 'linePrefix' ||
        event[1].type === 'listItemValue' ||
        event[1].type === 'listItemMarker' ||
        event[1].type === 'listItemPrefix' ||
        event[1].type === 'listItemPrefixWhitespace'
      ) {
      } else {
        atMarker = void 0
      }
      if (
        (!containerBalance &&
          event[0] === 'enter' &&
          event[1].type === 'listItemPrefix') ||
        (containerBalance === -1 &&
          event[0] === 'exit' &&
          (event[1].type === 'listUnordered' ||
            event[1].type === 'listOrdered'))
      ) {
        if (listItem2) {
          let tailIndex = index
          lineIndex = void 0
          while (tailIndex--) {
            const tailEvent = events[tailIndex]
            if (
              tailEvent[1].type === 'lineEnding' ||
              tailEvent[1].type === 'lineEndingBlank'
            ) {
              if (tailEvent[0] === 'exit') continue
              if (lineIndex) {
                events[lineIndex][1].type = 'lineEndingBlank'
                listSpread = true
              }
              tailEvent[1].type = 'lineEnding'
              lineIndex = tailIndex
            } else if (
              tailEvent[1].type === 'linePrefix' ||
              tailEvent[1].type === 'blockQuotePrefix' ||
              tailEvent[1].type === 'blockQuotePrefixWhitespace' ||
              tailEvent[1].type === 'blockQuoteMarker' ||
              tailEvent[1].type === 'listItemIndent'
            ) {
            } else {
              break
            }
          }
          if (
            firstBlankLineIndex &&
            (!lineIndex || firstBlankLineIndex < lineIndex)
          ) {
            listItem2._spread = true
          }
          listItem2.end = Object.assign(
            {},
            lineIndex ? events[lineIndex][1].start : event[1].end
          )
          events.splice(lineIndex || index, 0, ['exit', listItem2, event[2]])
          index++
          length++
        }
        if (event[1].type === 'listItemPrefix') {
          listItem2 = {
            type: 'listItem',
            _spread: false,
            start: Object.assign({}, event[1].start),
          }
          events.splice(index, 0, ['enter', listItem2, event[2]])
          index++
          length++
          firstBlankLineIndex = void 0
          atMarker = true
        }
      }
    }
    events[start][1]._spread = listSpread
    return length
  }
  function setData(key, value) {
    data[key] = value
  }
  function getData(key) {
    return data[key]
  }
  function opener(create, and) {
    return open
    function open(token) {
      enter2.call(this, create(token), token)
      if (and) and.call(this, token)
    }
  }
  function buffer() {
    this.stack.push({
      type: 'fragment',
      children: [],
    })
  }
  function enter2(node, token, errorHandler) {
    const parent = this.stack[this.stack.length - 1]
    parent.children.push(node)
    this.stack.push(node)
    this.tokenStack.push([token, errorHandler])
    node.position = {
      start: point(token.start),
    }
    return node
  }
  function closer(and) {
    return close
    function close(token) {
      if (and) and.call(this, token)
      exit2.call(this, token)
    }
  }
  function exit2(token, onExitError) {
    const node = this.stack.pop()
    const open = this.tokenStack.pop()
    if (!open) {
      throw new Error(
        'Cannot close `' +
          token.type +
          '` (' +
          stringifyPosition({
            start: token.start,
            end: token.end,
          }) +
          '): it\u2019s not open'
      )
    } else if (open[0].type !== token.type) {
      if (onExitError) {
        onExitError.call(this, token, open[0])
      } else {
        const handler = open[1] || defaultOnError
        handler.call(this, token, open[0])
      }
    }
    node.position.end = point(token.end)
    return node
  }
  function resume() {
    return toString(this.stack.pop())
  }
  function onenterlistordered() {
    setData('expectingFirstListItemValue', true)
  }
  function onenterlistitemvalue(token) {
    if (getData('expectingFirstListItemValue')) {
      const ancestor = this.stack[this.stack.length - 2]
      ancestor.start = Number.parseInt(this.sliceSerialize(token), 10)
      setData('expectingFirstListItemValue')
    }
  }
  function onexitcodefencedfenceinfo() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.lang = data2
  }
  function onexitcodefencedfencemeta() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.meta = data2
  }
  function onexitcodefencedfence() {
    if (getData('flowCodeInside')) return
    this.buffer()
    setData('flowCodeInside', true)
  }
  function onexitcodefenced() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data2.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, '')
    setData('flowCodeInside')
  }
  function onexitcodeindented() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data2.replace(/(\r?\n|\r)$/g, '')
  }
  function onexitdefinitionlabelstring(token) {
    const label = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.label = label
    node.identifier = normalizeIdentifier(
      this.sliceSerialize(token)
    ).toLowerCase()
  }
  function onexitdefinitiontitlestring() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.title = data2
  }
  function onexitdefinitiondestinationstring() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.url = data2
  }
  function onexitatxheadingsequence(token) {
    const node = this.stack[this.stack.length - 1]
    if (!node.depth) {
      const depth = this.sliceSerialize(token).length
      node.depth = depth
    }
  }
  function onexitsetextheadingtext() {
    setData('setextHeadingSlurpLineEnding', true)
  }
  function onexitsetextheadinglinesequence(token) {
    const node = this.stack[this.stack.length - 1]
    node.depth = this.sliceSerialize(token).charCodeAt(0) === 61 ? 1 : 2
  }
  function onexitsetextheading() {
    setData('setextHeadingSlurpLineEnding')
  }
  function onenterdata(token) {
    const node = this.stack[this.stack.length - 1]
    let tail = node.children[node.children.length - 1]
    if (!tail || tail.type !== 'text') {
      tail = text3()
      tail.position = {
        start: point(token.start),
      }
      node.children.push(tail)
    }
    this.stack.push(tail)
  }
  function onexitdata(token) {
    const tail = this.stack.pop()
    tail.value += this.sliceSerialize(token)
    tail.position.end = point(token.end)
  }
  function onexitlineending(token) {
    const context = this.stack[this.stack.length - 1]
    if (getData('atHardBreak')) {
      const tail = context.children[context.children.length - 1]
      tail.position.end = point(token.end)
      setData('atHardBreak')
      return
    }
    if (
      !getData('setextHeadingSlurpLineEnding') &&
      config.canContainEols.includes(context.type)
    ) {
      onenterdata.call(this, token)
      onexitdata.call(this, token)
    }
  }
  function onexithardbreak() {
    setData('atHardBreak', true)
  }
  function onexithtmlflow() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data2
  }
  function onexithtmltext() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data2
  }
  function onexitcodetext() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data2
  }
  function onexitlink() {
    const node = this.stack[this.stack.length - 1]
    if (getData('inReference')) {
      const referenceType = getData('referenceType') || 'shortcut'
      node.type += 'Reference'
      node.referenceType = referenceType
      delete node.url
      delete node.title
    } else {
      delete node.identifier
      delete node.label
    }
    setData('referenceType')
  }
  function onexitimage() {
    const node = this.stack[this.stack.length - 1]
    if (getData('inReference')) {
      const referenceType = getData('referenceType') || 'shortcut'
      node.type += 'Reference'
      node.referenceType = referenceType
      delete node.url
      delete node.title
    } else {
      delete node.identifier
      delete node.label
    }
    setData('referenceType')
  }
  function onexitlabeltext(token) {
    const string = this.sliceSerialize(token)
    const ancestor = this.stack[this.stack.length - 2]
    ancestor.label = decodeString(string)
    ancestor.identifier = normalizeIdentifier(string).toLowerCase()
  }
  function onexitlabel() {
    const fragment = this.stack[this.stack.length - 1]
    const value = this.resume()
    const node = this.stack[this.stack.length - 1]
    setData('inReference', true)
    if (node.type === 'link') {
      const children = fragment.children
      node.children = children
    } else {
      node.alt = value
    }
  }
  function onexitresourcedestinationstring() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.url = data2
  }
  function onexitresourcetitlestring() {
    const data2 = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.title = data2
  }
  function onexitresource() {
    setData('inReference')
  }
  function onenterreference() {
    setData('referenceType', 'collapsed')
  }
  function onexitreferencestring(token) {
    const label = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.label = label
    node.identifier = normalizeIdentifier(
      this.sliceSerialize(token)
    ).toLowerCase()
    setData('referenceType', 'full')
  }
  function onexitcharacterreferencemarker(token) {
    setData('characterReferenceType', token.type)
  }
  function onexitcharacterreferencevalue(token) {
    const data2 = this.sliceSerialize(token)
    const type = getData('characterReferenceType')
    let value
    if (type) {
      value = decodeNumericCharacterReference(
        data2,
        type === 'characterReferenceMarkerNumeric' ? 10 : 16
      )
      setData('characterReferenceType')
    } else {
      const result = decodeNamedCharacterReference(data2)
      value = result
    }
    const tail = this.stack.pop()
    tail.value += value
    tail.position.end = point(token.end)
  }
  function onexitautolinkprotocol(token) {
    onexitdata.call(this, token)
    const node = this.stack[this.stack.length - 1]
    node.url = this.sliceSerialize(token)
  }
  function onexitautolinkemail(token) {
    onexitdata.call(this, token)
    const node = this.stack[this.stack.length - 1]
    node.url = 'mailto:' + this.sliceSerialize(token)
  }
  function blockQuote() {
    return {
      type: 'blockquote',
      children: [],
    }
  }
  function codeFlow() {
    return {
      type: 'code',
      lang: null,
      meta: null,
      value: '',
    }
  }
  function codeText() {
    return {
      type: 'inlineCode',
      value: '',
    }
  }
  function definition() {
    return {
      type: 'definition',
      identifier: '',
      label: null,
      title: null,
      url: '',
    }
  }
  function emphasis() {
    return {
      type: 'emphasis',
      children: [],
    }
  }
  function heading() {
    return {
      type: 'heading',
      depth: void 0,
      children: [],
    }
  }
  function hardBreak() {
    return {
      type: 'break',
    }
  }
  function html() {
    return {
      type: 'html',
      value: '',
    }
  }
  function image() {
    return {
      type: 'image',
      title: null,
      url: '',
      alt: null,
    }
  }
  function link() {
    return {
      type: 'link',
      title: null,
      url: '',
      children: [],
    }
  }
  function list(token) {
    return {
      type: 'list',
      ordered: token.type === 'listOrdered',
      start: null,
      spread: token._spread,
      children: [],
    }
  }
  function listItem(token) {
    return {
      type: 'listItem',
      spread: token._spread,
      checked: null,
      children: [],
    }
  }
  function paragraph() {
    return {
      type: 'paragraph',
      children: [],
    }
  }
  function strong() {
    return {
      type: 'strong',
      children: [],
    }
  }
  function text3() {
    return {
      type: 'text',
      value: '',
    }
  }
  function thematicBreak() {
    return {
      type: 'thematicBreak',
    }
  }
}
function point(d) {
  return {
    line: d.line,
    column: d.column,
    offset: d.offset,
  }
}
function configure(combined, extensions) {
  let index = -1
  while (++index < extensions.length) {
    const value = extensions[index]
    if (Array.isArray(value)) {
      configure(combined, value)
    } else {
      extension(combined, value)
    }
  }
}
function extension(combined, extension2) {
  let key
  for (key in extension2) {
    if (own.call(extension2, key)) {
      if (key === 'canContainEols') {
        const right = extension2[key]
        if (right) {
          combined[key].push(...right)
        }
      } else if (key === 'transforms') {
        const right = extension2[key]
        if (right) {
          combined[key].push(...right)
        }
      } else if (key === 'enter' || key === 'exit') {
        const right = extension2[key]
        if (right) {
          Object.assign(combined[key], right)
        }
      }
    }
  }
}
function defaultOnError(left, right) {
  if (left) {
    throw new Error(
      'Cannot close `' +
        left.type +
        '` (' +
        stringifyPosition({
          start: left.start,
          end: left.end,
        }) +
        '): a different token (`' +
        right.type +
        '`, ' +
        stringifyPosition({
          start: right.start,
          end: right.end,
        }) +
        ') is open'
    )
  } else {
    throw new Error(
      'Cannot close document, a token (`' +
        right.type +
        '`, ' +
        stringifyPosition({
          start: right.start,
          end: right.end,
        }) +
        ') is still open'
    )
  }
}

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
        const values2 = extractScalar(extractExpression(attribute), field)
        return values2.split(',').map((value) => imageCallback(value))
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
    return attribute.expression.elements.map((element2) => {
      assertHasType(element2)
      assertType(element2, 'Literal')
      return element2.value
    })
  } else {
    assertType(attribute.expression, 'Literal')
    return attribute.expression.value
  }
}
var extractObject = (attribute, field) => {
  if (field.list) {
    assertType(attribute.expression, 'ArrayExpression')
    return attribute.expression.elements.map((element2) => {
      assertHasType(element2)
      assertType(element2, 'ObjectExpression')
      return extractObjectExpression(element2, field)
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
      const value = property.value.elements.map((element2) => {
        assertHasType(element2)
        assertType(element2, 'ObjectExpression')
        return extractObjectExpression(element2, field)
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

// ../mdx/src/stringify/index.ts
import { toMarkdown } from 'mdast-util-to-markdown'
import { text as text2 } from 'mdast-util-to-markdown/lib/handle/text'

// ../../../node_modules/.pnpm/mdast-util-mdx-jsx@2.0.2/node_modules/mdast-util-mdx-jsx/lib/index.js
import { ccount } from 'ccount'
import { parseEntities } from 'parse-entities'
import { stringifyPosition as stringifyPosition2 } from 'unist-util-stringify-position'
import { VFileMessage } from 'vfile-message'
import { stringifyEntitiesLight } from 'stringify-entities'
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow.js'
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing.js'
import { indentLines } from 'mdast-util-to-markdown/lib/util/indent-lines.js'
import { track } from 'mdast-util-to-markdown/lib/util/track.js'
function mdxJsxToMarkdown(options = {}) {
  const {
    quote = '"',
    quoteSmart,
    tightSelfClosing,
    printWidth = Number.POSITIVE_INFINITY,
  } = options
  const alternative = quote === '"' ? "'" : '"'
  if (quote !== '"' && quote !== "'") {
    throw new Error(
      'Cannot serialize attribute values with `' +
        quote +
        '` for `options.quote`, expected `"`, or `\'`'
    )
  }
  mdxElement.peek = peekElement
  return {
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
  function mdxElement(node, _, context, safeOptions) {
    const tracker = track(safeOptions)
    const selfClosing =
      node.name && (!node.children || node.children.length === 0)
    const exit2 = context.enter(node.type)
    let index = -1
    const serializedAttributes = []
    let value = tracker.move('<' + (node.name || ''))
    if (node.attributes && node.attributes.length > 0) {
      if (!node.name) {
        throw new Error('Cannot serialize fragment w/ attributes')
      }
      while (++index < node.attributes.length) {
        const attribute = node.attributes[index]
        let result
        if (attribute.type === 'mdxJsxExpressionAttribute') {
          result = '{' + (attribute.value || '') + '}'
        } else {
          if (!attribute.name) {
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
          result = left + (right ? '=' : '') + right
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
        (tightSelfClosing || attributesOnTheirOwnLine ? '' : ' ') + '/'
      )
    }
    value += tracker.move('>')
    if (node.children && node.children.length > 0) {
      if (node.type === 'mdxJsxFlowElement') {
        tracker.shift(2)
        value += tracker.move('\n')
        value += tracker.move(
          indentLines(containerFlow(node, context, tracker.current()), map)
        )
        value += tracker.move('\n')
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
      value += tracker.move('</' + (node.name || '') + '>')
    }
    exit2()
    return value
  }
  function map(line, _, blank) {
    return (blank ? '' : '  ') + line
  }
  function peekElement() {
    return '<'
  }
}

// ../mdx/src/stringify/acorn.ts
import { format } from 'prettier'
var stringifyPropsInline = (element2, field, imageCallback) => {
  return stringifyProps(element2, field, true, imageCallback)
}
function stringifyProps(element2, parentField, flatten2, imageCallback) {
  const attributes2 = []
  const children = []
  let template
  let useDirective = false
  let directiveType = 'leaf'
  template = parentField.templates?.find((template2) => {
    if (typeof template2 === 'string') {
      throw new Error('Global templates not supported')
    }
    return template2.name === element2.name
  })
  if (!template) {
    template = parentField.templates?.find((template2) => {
      const templateName = template2?.match?.name
      return templateName === element2.name
    })
  }
  if (!template || typeof template === 'string') {
    throw new Error(`Unable to find template for JSX element ${element2.name}`)
  }
  if (template.fields.find((f) => f.name === 'children')) {
    directiveType = 'block'
  }
  useDirective = !!template.match
  Object.entries(element2.props).forEach(([name, value]) => {
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
        return text(content)
      }
      throw new Error(`InlineElement: ${content.type} is not supported`)
  }
}
var text = (content) => {
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
        first.linkifyTextNode(text(first)),
        ...eat(content.slice(1), field, imageCallback),
      ]
    } else {
      return [text(first), ...eat(content.slice(1), field, imageCallback)]
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
    return [text(first), ...eat(content.slice(1), field, imageCallback)]
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
var own2 = {}.hasOwnProperty
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
    const exit2 = state.enter(node.type)
    const pattern = patterns.find(
      (p) => p.name === node.name || p.templateName === node.name
    )
    if (!pattern) {
      console.log('no pattern found for directive', node.name)
      exit2()
      return ''
    }
    const patternName = pattern.name || pattern.templateName
    const sequence = pattern.start
    let value = tracker.move(sequence + ' ' + patternName)
    let label
    if (label && label.children && label.children.length > 0) {
      const exit3 = state.enter('label')
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
      exit3()
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
    exit2()
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
  const values2 = []
  let key
  for (key in attrs) {
    if (own2.call(attrs, key) && attrs[key] !== void 0 && attrs[key] !== null) {
      const value = String(attrs[key])
      values2.push(quoted(key, value))
    }
  }
  return values2.length > 0 ? values2.join(' ') + ' ' : ''
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
  const res = toTinaMarkdown(tree, field)
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
var toTinaMarkdown = (tree, field) => {
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
    return text2(node, parent, context, safeOptions)
  }
  return toMarkdown(tree, {
    extensions: [directiveToMarkdown(patterns), mdxJsxToMarkdown()],
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
      const string = toTinaMarkdown({ type: 'root', children: [node] }, field)
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
var remarkToSlate = (root, field, imageCallback, raw) => {
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
        return mdxJsxElement(content2, field, imageCallback)
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
                mdxJsxElement(
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
        return mdxJsxElement(content2, field, imageCallback)
      case 'text':
        return text3(content2)
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
        return text3(content2)
      case 'link':
        return link(content2)
      case 'image':
        return image(content2)
      case 'mdxJsxTextElement':
        return mdxJsxElement(content2, field, imageCallback)
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
  const text3 = (content2) => {
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

// ../mdx/src/extensions/tina-shortcodes/from-markdown.ts
import { parseEntities as parseEntities2 } from 'parse-entities'
var enterContainer = function (token) {
  enter.call(this, 'containerDirective', token)
}
var enterLeaf = function (token) {
  enter.call(this, 'leafDirective', token)
}
var enterText = function (token) {
  enter.call(this, 'textDirective', token)
}
var enter = function (type, token) {
  this.enter({ type, name: '', attributes: {}, children: [] }, token)
}
function exitName(token) {
  const node = this.stack[this.stack.length - 1]
  node.name = this.sliceSerialize(token)
}
var enterContainerLabel = function (token) {
  this.enter(
    { type: 'paragraph', data: { directiveLabel: true }, children: [] },
    token
  )
}
var exitContainerLabel = function (token) {
  this.exit(token)
}
var enterAttributes = function () {
  this.setData('directiveAttributes', [])
  this.buffer()
}
var exitAttributeIdValue = function (token) {
  const list = this.getData('directiveAttributes')
  if (list) {
    list.push([
      'id',
      parseEntities2(this.sliceSerialize(token), {
        attribute: true,
      }),
    ])
  }
}
var exitAttributeClassValue = function (token) {
  const list = this.getData('directiveAttributes')
  if (list) {
    list.push([
      'class',
      parseEntities2(this.sliceSerialize(token), {
        attribute: true,
      }),
    ])
  }
}
var exitAttributeValue = function (token) {
  const list = this.getData('directiveAttributes')
  if (list) {
    const item = list[list.length - 1]
    if (item) {
      item[1] = parseEntities2(this.sliceSerialize(token), {
        attribute: true,
      })
    }
  }
}
var exitAttributeName = function (token) {
  const list = this.getData('directiveAttributes')
  if (list) {
    const name = this.sliceSerialize(token)
    if (!name) {
      list.push(['_value', ''])
    } else {
      list.push([this.sliceSerialize(token), ''])
    }
  }
}
function exitAttributes() {
  const list = this.getData('directiveAttributes')
  const cleaned = {}
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
  this.resume()
  const node = this.stack[this.stack.length - 1]
  node.attributes = cleaned
}
function exit(token) {
  this.exit(token)
}
var directiveFromMarkdown = {
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

// ../mdx/src/extensions/tina-shortcodes/shortcode-leaf.ts
import { factorySpace as factorySpace2 } from 'micromark-factory-space'
import {
  markdownLineEnding as markdownLineEnding2,
  markdownSpace as markdownSpace2,
} from 'micromark-util-character'
import { codes as codes3 } from 'micromark-util-symbol/codes'
import { values } from 'micromark-util-symbol/values'
import { types as types2 } from 'micromark-util-symbol/types'

// ../mdx/src/extensions/tina-shortcodes/factory-attributes.ts
import { factorySpace } from 'micromark-factory-space'
import { factoryWhitespace } from 'micromark-factory-whitespace'
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character'
import { codes } from 'micromark-util-symbol/codes'
import { types } from 'micromark-util-symbol/types'
function factoryAttributes(
  effects,
  ok,
  nnok,
  attributesType,
  attributesMarkerType,
  attributeType,
  attributeIdType,
  attributeClassType,
  attributeNameType,
  attributeInitializerType,
  attributeValueLiteralType,
  attributeValueType,
  attributeValueMarker,
  attributeValueData,
  disallowEol
) {
  let type
  let marker
  const nok = function (code) {
    return nnok(code)
  }
  const start = function (code) {
    effects.enter(attributesType)
    return between(code)
  }
  const between = function (code) {
    if (code === codes.numberSign) {
      type = attributeIdType
      return shortcutStart(code)
    }
    if (code === codes.dot) {
      type = attributeClassType
      return shortcutStart(code)
    }
    if (code === codes.colon || code === codes.underscore || asciiAlpha(code)) {
      effects.enter(attributeType)
      effects.enter(attributeNameType)
      effects.consume(code)
      return name
    }
    if (code === codes.quotationMark || code === codes.apostrophe) {
      effects.enter(attributeNameType)
      effects.exit(attributeNameType)
      effects.enter(attributeType)
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
  const shortcutStart = function (code) {
    effects.enter(attributeType)
    effects.enter(type)
    effects.enter(type + 'Marker')
    effects.consume(code)
    effects.exit(type + 'Marker')
    return shortcutStartAfter
  }
  const shortcutStartAfter = function (code) {
    if (
      code === codes.eof ||
      code === codes.quotationMark ||
      code === codes.numberSign ||
      code === codes.apostrophe ||
      code === codes.dot ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent ||
      code === codes.rightCurlyBrace ||
      markdownLineEndingOrSpace(code)
    ) {
      return nok(code)
    }
    effects.enter(type + 'Value')
    effects.consume(code)
    return shortcut
  }
  const shortcut = function (code) {
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
    if (
      code === codes.numberSign ||
      code === codes.dot ||
      code === codes.rightCurlyBrace ||
      markdownLineEndingOrSpace(code)
    ) {
      effects.exit(type + 'Value')
      effects.exit(type)
      effects.exit(attributeType)
      return between(code)
    }
    effects.consume(code)
    return shortcut
  }
  const name = function (code) {
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
    effects.exit(attributeNameType)
    if (disallowEol && markdownSpace(code)) {
      return factorySpace(effects, nameAfter, types.whitespace)(code)
    }
    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return factoryWhitespace(effects, nameAfter)(code)
    }
    return nameAfter(code)
  }
  const nameAfter = function (code) {
    if (code === codes.equalsTo) {
      effects.enter(attributeInitializerType)
      effects.consume(code)
      effects.exit(attributeInitializerType)
      return valueBefore
    }
    effects.exit(attributeType)
    return between(code)
  }
  const valueBefore = function (code) {
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
      effects.enter(attributeValueLiteralType)
      effects.enter(attributeValueMarker)
      effects.consume(code)
      effects.exit(attributeValueMarker)
      marker = code
      return valueQuotedStart
    }
    if (disallowEol && markdownSpace(code)) {
      return factorySpace(effects, valueBefore, types.whitespace)(code)
    }
    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return factoryWhitespace(effects, valueBefore)(code)
    }
    effects.enter(attributeValueType)
    effects.enter(attributeValueData)
    effects.consume(code)
    marker = void 0
    return valueUnquoted
  }
  const valueUnquoted = function (code) {
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
      effects.exit(attributeValueData)
      effects.exit(attributeValueType)
      effects.exit(attributeType)
      return between(code)
    }
    effects.consume(code)
    return valueUnquoted
  }
  const valueQuotedStart = function (code) {
    if (code === marker) {
      effects.enter(attributeValueMarker)
      effects.consume(code)
      effects.exit(attributeValueMarker)
      effects.exit(attributeValueLiteralType)
      effects.exit(attributeType)
      return valueQuotedAfter
    }
    effects.enter(attributeValueType)
    return valueQuotedBetween(code)
  }
  const valueQuotedBetween = function (code) {
    if (code === marker) {
      effects.exit(attributeValueType)
      return valueQuotedStart(code)
    }
    if (code === codes.eof) {
      return nok(code)
    }
    if (markdownLineEnding(code)) {
      return disallowEol
        ? nok(code)
        : factoryWhitespace(effects, valueQuotedBetween)(code)
    }
    effects.enter(attributeValueData)
    effects.consume(code)
    return valueQuoted
  }
  const valueQuoted = function (code) {
    if (code === marker || code === codes.eof || markdownLineEnding(code)) {
      effects.exit(attributeValueData)
      return valueQuotedBetween(code)
    }
    effects.consume(code)
    return valueQuoted
  }
  const valueQuotedAfter = function (code) {
    return code === codes.rightCurlyBrace || markdownLineEndingOrSpace(code)
      ? between(code)
      : end(code)
  }
  const end = function (code) {
    if (!asciiAlpha(code)) {
      effects.enter(attributesMarkerType)
      effects.exit(attributesMarkerType)
      effects.exit(attributesType)
      return ok(code)
    }
    return nok(code)
  }
  return start
}

// ../mdx/src/extensions/tina-shortcodes/factory-name.ts
import {
  asciiAlpha as asciiAlpha2,
  asciiAlphanumeric as asciiAlphanumeric2,
} from 'micromark-util-character'
import { codes as codes2 } from 'micromark-util-symbol/codes'
function factoryName(effects, ok, nok, type, patternName) {
  const self = this
  let nameIndex = 0
  const start = function (code) {
    const character = patternName[nameIndex]
    if (asciiAlpha2(code) && findCode(character) === code) {
      nameIndex++
      effects.enter(type)
      effects.consume(code)
      return name
    }
    return nok(code)
  }
  const name = function (code) {
    const character = patternName[nameIndex]
    if (
      code === codes2.dash ||
      code === codes2.underscore ||
      asciiAlphanumeric2(code)
    ) {
      if (findCode(character) === code) {
        effects.consume(code)
        nameIndex++
        return name
      }
      return nok(code)
    }
    effects.exit(type)
    return self.previous === codes2.dash || self.previous === codes2.underscore
      ? nok(code)
      : ok(code)
  }
  return start
}

// ../mdx/src/extensions/tina-shortcodes/shortcode-leaf.ts
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
    Object.entries(codes3).forEach(([key, value]) => {
      if (key === lookup) {
        lookupValue = value
      }
    })
  }
  return lookupValue
}
var directiveLeaf = (pattern) => {
  const tokenizeDirectiveLeaf = function (effects, ook, nnok) {
    const self = this
    let startSequenceIndex = 1
    let endSequenceIndex = 0
    const ok = function (code) {
      return ook(code)
    }
    const nok = function (code) {
      return nnok(code)
    }
    const start = function (code) {
      const firstCharacter = pattern.start[0]
      if (findCode(firstCharacter) === code) {
        effects.enter('directiveLeaf')
        effects.enter('directiveLeafFence')
        effects.enter('directiveLeafSequence')
        effects.consume(code)
        return sequenceOpen(code)
      }
      return nok(code)
    }
    const sequenceOpen = function (code) {
      const nextCharacter = pattern.start[startSequenceIndex]
      if (findCode(nextCharacter) === code) {
        effects.consume(code)
        startSequenceIndex++
        return sequenceOpen
      }
      if (startSequenceIndex < pattern.start.length) {
        return nok(code)
      }
      effects.exit('directiveLeafSequence')
      return factorName(code)
    }
    const factorName = (code) => {
      if (markdownSpace2(code)) {
        return factorySpace2(effects, factorName, types2.whitespace)(code)
      }
      return factoryName.call(
        self,
        effects,
        afterName,
        nok,
        'directiveLeafName',
        pattern.name || pattern.templateName
      )(code)
    }
    const afterName = function (code) {
      if (markdownSpace2(code)) {
        return factorySpace2(effects, afterName, types2.whitespace)(code)
      }
      if (markdownLineEnding2(code)) {
        return nok
      }
      return startAttributes
    }
    const startAttributes = function (code) {
      const nextCharacter = pattern.end[endSequenceIndex]
      if (findCode(nextCharacter) === code) {
        return afterAttributes(code)
      }
      return effects.attempt(
        attributes2,
        afterAttributes,
        afterAttributes
      )(code)
    }
    const end = function (code) {
      effects.exit('directiveLeafFence')
      effects.exit('directiveLeaf')
      return ok(code)
    }
    const afterAttributes = function (code) {
      const nextCharacter = pattern.end[endSequenceIndex]
      if (pattern.end.length === endSequenceIndex) {
        return factorySpace2(effects, end, types2.whitespace)(code)
      }
      if (code === codes3.eof) {
        return nok
      }
      if (findCode(nextCharacter) === code) {
        effects.consume(code)
        endSequenceIndex++
        return afterAttributes
      }
      return nok
    }
    return start
  }
  const tokenizeAttributes = function (effects, ok, nok) {
    return factoryAttributes(
      effects,
      ok,
      nok,
      'directiveLeafAttributes',
      'directiveLeafAttributesMarker',
      'directiveLeafAttribute',
      'directiveLeafAttributeId',
      'directiveLeafAttributeClass',
      'directiveLeafAttributeName',
      'directiveLeafAttributeInitializerMarker',
      'directiveLeafAttributeValueLiteral',
      'directiveLeafAttributeValue',
      'directiveLeafAttributeValueMarker',
      'directiveLeafAttributeValueData',
      true
    )
  }
  const attributes2 = { tokenize: tokenizeAttributes, partial: true }
  return {
    tokenize: tokenizeDirectiveLeaf,
  }
}

// ../mdx/src/extensions/tina-shortcodes/shortcode-container.ts
import { ok as assert } from 'uvu/assert'
import { factorySpace as factorySpace3 } from 'micromark-factory-space'
import {
  markdownLineEnding as markdownLineEnding3,
  markdownSpace as markdownSpace3,
} from 'micromark-util-character'
import { codes as codes4 } from 'micromark-util-symbol/codes'
import { constants } from 'micromark-util-symbol/constants'
import { types as types3 } from 'micromark-util-symbol/types'
var directiveContainer = (pattern) => {
  const tokenizeDirectiveContainer = function (effects, ook, nnok) {
    const self = this
    const tail = self.events[self.events.length - 1]
    const initialSize =
      tail && tail[1].type === types3.linePrefix
        ? tail[2].sliceSerialize(tail[1], true).length
        : 0
    let previous
    let startSequenceIndex = 1
    let closeStartSequenceIndex = 0
    let endNameIndex = 0
    let endSequenceIndex = 0
    let closeEndSequenceIndex = 0
    const ok = function (code) {
      return ook(code)
    }
    const nok = function (code) {
      return nnok(code)
    }
    const start = function (code) {
      const firstCharacter = pattern.start[0]
      if (findCode(firstCharacter) === code) {
        effects.enter('directiveContainer')
        effects.enter('directiveContainerFence')
        effects.enter('directiveContainerSequence')
        effects.consume(code)
        return sequenceOpen(code)
      }
      return nok(code)
    }
    const sequenceOpen = function (code) {
      const nextCharacter = pattern.start[startSequenceIndex]
      if (findCode(nextCharacter) === code) {
        effects.consume(code)
        startSequenceIndex++
        return sequenceOpen
      }
      if (startSequenceIndex < pattern.start.length) {
        return nok(code)
      }
      effects.exit('directiveContainerSequence')
      return factorName(code)
    }
    const factorName = (code) => {
      if (markdownSpace3(code)) {
        return factorySpace3(effects, factorName, types3.whitespace)(code)
      }
      return factoryName.call(
        self,
        effects,
        afterName,
        nok,
        'directiveContainerName',
        pattern.name || pattern.templateName
      )(code)
    }
    const afterName = function (code) {
      if (markdownSpace3(code)) {
        return factorySpace3(effects, afterName, types3.whitespace)(code)
      }
      if (markdownLineEnding3(code)) {
        return nok
      }
      return startAttributes
    }
    const startAttributes = function (code) {
      const nextCharacter = pattern.end[endSequenceIndex]
      if (findCode(nextCharacter) === code) {
        return afterAttributes(code)
      }
      return effects.attempt(
        attributes2,
        afterAttributes,
        afterAttributes
      )(code)
    }
    const afterAttributes = function (code) {
      const nextCharacter = pattern.end[endSequenceIndex]
      if (code === codes4.eof) {
        return nok
      }
      if (findCode(nextCharacter) === code) {
        effects.consume(code)
        endSequenceIndex++
        return afterAttributes
      }
      if (pattern.end.length === endSequenceIndex) {
        return factorySpace3(effects, openAfter, types3.whitespace)(code)
      }
      return nok
    }
    const openAfter = function (code) {
      effects.exit('directiveContainerFence')
      if (code === codes4.eof) {
        return afterOpening(code)
      }
      if (markdownLineEnding3(code)) {
        if (self.interrupt) {
          return nok(code)
        }
        return effects.attempt(nonLazyLine, contentStart, afterOpening)(code)
      }
      return nok(code)
    }
    const afterOpening = function (code) {
      return nok(code)
    }
    const contentStart = function (code) {
      if (code === codes4.eof) {
        return nok(code)
      }
      effects.enter('directiveContainerContent')
      return lineStart(code)
    }
    const lineStart = function (code) {
      if (code === codes4.eof) {
        return nok(code)
      }
      return effects.attempt(
        { tokenize: tokenizeClosingFence, partial: true },
        after,
        initialSize
          ? factorySpace3(
              effects,
              chunkHoldup,
              types3.linePrefix,
              initialSize + 1
            )
          : chunkHoldup
      )(code)
    }
    const chunkHoldup = function (code) {
      return chunkStart(code)
    }
    const chunkStart = function (code) {
      if (code === codes4.eof) {
        return nok(code)
      }
      const token = effects.enter(types3.chunkDocument, {
        contentType: constants.contentTypeDocument,
        previous,
      })
      if (previous) previous.next = token
      previous = token
      return contentContinue(code)
    }
    const contentContinue = function (code) {
      if (code === codes4.eof) {
        const t = effects.exit(types3.chunkDocument)
        self.parser.lazy[t.start.line] = false
        return nok(code)
      }
      if (markdownLineEnding3(code)) {
        return effects.check(nonLazyLine, nonLazyLineAfter, lineAfter)(code)
      }
      effects.consume(code)
      return contentContinue
    }
    const nonLazyLineAfter = function (code) {
      effects.consume(code)
      const t = effects.exit(types3.chunkDocument)
      self.parser.lazy[t.start.line] = false
      return lineStart
    }
    const lineAfter = function (code) {
      const t = effects.exit(types3.chunkDocument)
      self.parser.lazy[t.start.line] = false
      return after(code)
    }
    const after = function (code) {
      effects.exit('directiveContainerContent')
      effects.exit('directiveContainer')
      return ok(code)
    }
    const tokenizeClosingFence = function (effects2, ok2, nok2) {
      const closingPrefixAfter = function (code) {
        effects2.enter('directiveContainerFence')
        effects2.enter('directiveContainerSequence')
        return closingSequence(code)
      }
      const closingSequence = function (code) {
        const nextCharacter = pattern.start[closeStartSequenceIndex]
        if (findCode(nextCharacter) === code) {
          effects2.consume(code)
          closeStartSequenceIndex++
          return closingSequence
        }
        if (closeStartSequenceIndex < pattern.end.length - 1) {
          return nok2(code)
        }
        effects2.exit('directiveContainerSequence')
        return factorySpace3(
          effects2,
          closingSequenceNameStart,
          types3.whitespace
        )(code)
      }
      const closingSequenceName = function (code) {
        const patternName = pattern.name || pattern.templateName
        const nextCharacter = patternName[endNameIndex]
        if (code === codes4.eof) {
          return nok2
        }
        if (markdownLineEnding3(code)) {
          return nok2
        }
        if (findCode(nextCharacter) === code) {
          effects2.consume(code)
          endNameIndex++
          return closingSequenceName
        }
        if (patternName.length === endNameIndex) {
          return closingSequenceEnd
        }
        return nok2
      }
      const closingSequenceNameStart = function (code) {
        if (markdownSpace3(code)) {
          return factorySpace3(
            effects2,
            closingSequenceNameStart,
            types3.whitespace
          )
        }
        if (code === codes4.backslash) {
          effects2.consume(code)
          return closingSequenceName
        }
        return nok2(code)
      }
      const closingSequenceEnd = function (code) {
        if (markdownSpace3(code)) {
          return factorySpace3(effects2, closingSequenceEnd, types3.whitespace)
        }
        if (code === codes4.eof) {
          return nok2
        }
        if (pattern.end.length - 1 === closeEndSequenceIndex) {
          effects2.exit('directiveContainerFence')
          console.log('done')
          self.events.forEach((e) => {
            console.log(`${e[0]} - ${e[1].type}`)
          })
          return ok2(code)
        }
        const nextCharacter = pattern.end[closeEndSequenceIndex]
        if (findCode(nextCharacter) === code) {
          effects2.consume(code)
          closeEndSequenceIndex++
          return closingSequenceEnd
        }
        return nok2(code)
      }
      return factorySpace3(
        effects2,
        closingPrefixAfter,
        types3.linePrefix,
        constants.tabSize
      )
    }
    return start
  }
  const tokenizeAttributes = function (effects, ok, nok) {
    return factoryAttributes(
      effects,
      ok,
      nok,
      'directiveContainerAttributes',
      'directiveContainerAttributesMarker',
      'directiveContainerAttribute',
      'directiveContainerAttributeId',
      'directiveContainerAttributeClass',
      'directiveContainerAttributeName',
      'directiveContainerAttributeInitializerMarker',
      'directiveContainerAttributeValueLiteral',
      'directiveContainerAttributeValue',
      'directiveContainerAttributeValueMarker',
      'directiveContainerAttributeValueData',
      true
    )
  }
  const tokenizeNonLazyLine = function (effects, ok, nok) {
    const self = this
    const lineStart = function (code) {
      return self.parser.lazy[self.now().line] ? nok(code) : ok(code)
    }
    const start = function (code) {
      assert(markdownLineEnding3(code), 'expected eol')
      effects.enter(types3.lineEnding)
      effects.consume(code)
      effects.exit(types3.lineEnding)
      return lineStart
    }
    return start
  }
  const attributes2 = { tokenize: tokenizeAttributes, partial: true }
  const nonLazyLine = { tokenize: tokenizeNonLazyLine, partial: true }
  return {
    tokenize: tokenizeDirectiveContainer,
    concrete: true,
  }
}

// ../mdx/src/extensions/tina-shortcodes/extension.ts
var tinaDirective = function (patterns) {
  const rules = {}
  patterns.forEach((pattern) => {
    const firstKey = pattern.start[0]
    if (firstKey) {
      const code = findCode(firstKey)
      if (code) {
        if (pattern.type === 'leaf') {
          const directive = directiveLeaf(pattern)
          if (rules[code]) {
            rules[code] = [...(rules[code] || []), directive]
          } else {
            rules[code] = [directive]
          }
        }
        if (pattern.type === 'block') {
          const directive = directiveContainer(pattern)
          if (rules[code]) {
            rules[code] = [...(rules[code] || []), directive]
          } else {
            rules[code] = [directive]
          }
        }
      }
    }
  })
  return {
    flow: rules,
  }
}

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
var markdownToAst = (value, field) => {
  const patterns = []
  field.templates?.forEach((template) => {
    if (typeof template === 'string') {
      return
    }
    if (template && template.match) {
      patterns.push({
        ...template.match,
        name: template.match?.name || template.name,
        templateName: template.name,
        type: template.fields.find((f) => f.name === 'children')
          ? 'block'
          : 'leaf',
      })
    }
  })
  return fromMarkdown(value, {
    extensions: [tinaDirective(patterns)],
    mdastExtensions: [directiveFromMarkdown],
  })
}
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
      tree = markdownToAst(value, field)
    } else {
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
    }
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
