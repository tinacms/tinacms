import type {
  CompileContext,
  Extension as FromMarkdownExtension,
  Handle as FromMarkdownHandle,
  Token,
} from 'mdast-util-from-markdown'
import { parseEntities } from 'parse-entities'

const enter = function (this: CompileContext, type: any, token: Token) {
  this.enter({ type, name: '', attributes: {}, children: [] }, token)
}

const enterShortcode: FromMarkdownHandle = function (token) {
  enter.call(this, 'leafDirective', token)
}
const enterShortcodeContainer: FromMarkdownHandle = function (token) {
  // enter.call(this, 'containerDirective', token)
}

function exitName(this: CompileContext, token: Token) {
  const node = this.stack[this.stack.length - 1]
  node.name = this.sliceSerialize(token)
}

function exit(this: CompileContext, token: Token) {
  console.log('exit called', token)
  this.exit(token)
}

export const tinaDirectiveFromMarkdown: FromMarkdownExtension = {
  // canContainEols: ["textDirective"],
  enter: {
    shortcode: enterShortcode,
    // shortcodeContainer: enterShortcodeContainer,
  },
  exit: {
    shortcode: exit,
    // shortcodeContainer: exit,
    // containerDirective: exit,
    // shortcodeName: exitName,
  },
}
