import { Handlers, toMarkdown } from 'mdast-util-to-markdown'
import { text } from 'mdast-util-to-markdown/lib/handle/text'
import { mdxJsxToMarkdown } from '../mdast'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type * as Md from 'mdast'
import { Pattern } from '..'
import { getFieldPatterns } from '../../util'

export const toTinaMarkdown = (tree: Md.Root, field: RichTypeInner) => {
  const patterns = getFieldPatterns(field)
  /**
   *
   * Escaping elements which we can't accound for (eg. `<`) is usually good. But when the rich-text other tooling
   * is responsible for parsing markdown, and Tina's only job is to provide a rich-text editor, we need to avoid
   * escaping so things like shortcodes continue to work (eg. '{{<' would become '{{\<').
   *
   * We can probably be more fine-grained with this, but for now, if you've provided a `match` property on your
   * templates, we're assuming you'll need to escape
   *
   */
  const handlers: Handlers = {}
  handlers['text'] = (node, parent, context, safeOptions) => {
    // Empty spaces before/after strings
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
        // Remove this character from the unsafe list, and then
        // proceed with the original text handler
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
