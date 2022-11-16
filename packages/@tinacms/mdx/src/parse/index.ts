/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { remarkToSlate, RichTextParseError } from './remarkToPlate'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type * as Md from 'mdast'
import type * as Plate from './plate'
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
export const markdownToAst = (value: string, field: RichTypeInner) => {
  const templatesWithMatchers = field.templates?.filter(
    (template) => template.match
  )
  let preprocessedString = value
  templatesWithMatchers?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates are not supported')
    }
    if (template.match) {
      if (preprocessedString) {
        preprocessedString = replaceAll(
          preprocessedString,
          template.match.start,
          `<${template.name}>\``
        )
        preprocessedString = replaceAll(
          preprocessedString,
          template.match.end,
          `\`</${template.name}>`
        )
      }
    }
  })
  try {
    // Remark Root is not the same as mdast for some reason
    const tree = remark().use(remarkMdx).parse(preprocessedString) as Md.Root
    if (!tree) {
      throw new Error('Error parsing markdown')
    }
    // NOTE: if we want to provide error highlighing in the raw editor
    // we could keep this info around in edit mode
    // Delete useless position info
    // visit(tree, (node) => {
    //   delete node.position
    // })
    return tree
  } catch (e) {
    // @ts-ignore VMessage is the error type but it's not accessible
    throw new RichTextParseError(e, e.position)
  }
}

export const MDX_PARSE_ERROR_MSG =
  'TinaCMS supports a stricter version of markdown and a subset of MDX. https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations'
export const MDX_PARSE_ERROR_MSG_HTML =
  'TinaCMS supports a stricter version of markdown and a subset of MDX. <a href="https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations" target="_blank" rel="noopener noreferrer">Learn More</a>'

export const parseMDX = (
  value: string,
  field: RichTypeInner,
  imageCallback: (s: string) => string
): Plate.RootElement => {
  let tree
  try {
    tree = markdownToAst(value, field)
    if (tree) {
      return remarkToSlate(tree, field, imageCallback)
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
