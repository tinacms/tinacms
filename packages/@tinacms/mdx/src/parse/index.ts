/**



*/

import { remark } from 'remark'
import remarkMdx, { type Root } from 'remark-mdx'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import remarkGfm from 'remark-gfm'
import { parseMDX as parseMDXNext } from '../next'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { remarkToSlate, RichTextParseError } from './remarkToPlate'
import type { RichTextType } from '@tinacms/schema-tools'
import type * as Plate from './plate'
import { directiveFromMarkdown } from '../extensions/tina-shortcodes/from-markdown'
import { tinaDirective } from '../extensions/tina-shortcodes/extension'
import type { Pattern } from '../stringify'
import { parseShortcode } from './parseShortcode'
/**
 * ### Convert the MDXAST into an API-friendly format
 *
 * When we parse with Remark + MDX we get an AST which has a ton of JS capabilities, meaning
 * we could pass this back into a JS runtime and evaluate it. Ex.
 *
 * ```mdx
 * ## Hello world! The time and date is: {(new Date().toLocaleString())}
 * ```
 *
 * However, as an intentional constraint we don't want this information as part of our API, as
 * we don't intend to support the true JS runtime properties of MDX. Rather, we're using MDX for
 * it's expressive syntax and it's advanced tooling with how it parses JSX inside Markdown.
 *
 * Parsing here does 2 things:
 *
 * #### Remove non-literal uses of JSX
 * Things like <MyComponent myProp={() => alert("HI")} /> are not supported and will be ignored
 *
 * #### Convert remark nodes to slate-compatible nodes
 *
 * A remark node might look like this:
 * ```js
 * {
 *   type: "heading",
 *   depth: 1
 *   children: [{type: 'text', value: 'Hello'}]
 * }
 * ```
 * A slate-compatible node would be:
 * ```js
 * {
 *   type: "heading_one",
 *   children: [{type: 'text', text: 'Hello'}]
 * }
 * ```
 * It's not a huge difference, but in general slate does better with less layers of indirection.
 *
 * While it may be desirable to ultimately serve a remark AST shape as part of the API response,
 * it's currently much easier to only support the shape that works with Slate. This is ok for now for 2
 * reasons.
 *
 * 1. Us providing the `TinaMarkdown` component on the frontend abstracts away an work the developer
 * would need to do, so it doesn't really matter what shape the response is as long as the external API
 * doesn't change
 *
 * 2. We don't need to do any client-side parsing. Since TinaMarkdown and the slate editor work with the same
 * format we can just allow Tina to do it's thing and update the form value with no additional work.
 */
export const markdownToAst = (value: string, field: RichTextType) => {
  const patterns: Pattern[] = []
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
    extensions: [gfm(), tinaDirective(patterns)],
    mdastExtensions: [gfmFromMarkdown(), directiveFromMarkdown],
  })
}
export const mdxToAst = (value: string) => {
  return remark().use(remarkMdx).use(remarkGfm).parse(value)
}
export const MDX_PARSE_ERROR_MSG =
  'TinaCMS supports a stricter version of markdown and a subset of MDX. https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations'
export const MDX_PARSE_ERROR_MSG_HTML =
  'TinaCMS supports a stricter version of markdown and a subset of MDX. <a href="https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations" target="_blank" rel="noopener noreferrer">Learn More</a>'

export const parseMDX = (
  value: string,
  field: RichTextType,
  imageCallback: (s: string) => string,
  context?: { _tinaEmbeds?: Record<string, string> | null | undefined }
): Plate.RootElement => {
  if (!value) {
    return { type: 'root', children: [] }
  }
  let tree: Root | null
  try {
    if (field.parser?.type === 'markdown') {
      return parseMDXNext(value, field, imageCallback)
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
      return remarkToSlate(tree, field, imageCallback, value, false, context)
    } else {
      return { type: 'root', children: [] }
    }
  } catch (e: any) {
    if (e instanceof RichTextParseError) {
      return invalidMarkdown(e, value)
    }
    return invalidMarkdown(new RichTextParseError(e.message), value)
  }
}

export const invalidMarkdown = (
  e: RichTextParseError,
  value: string
): Plate.RootElement => {
  const extra: Record<string, unknown> = {}
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

export const replaceAll = (string: string, target: string, value: string) => {
  const regex = new RegExp(target, 'g')
  return string.valueOf().replace(regex, value)
}
