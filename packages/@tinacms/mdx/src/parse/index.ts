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

import { unified } from 'unified'
import markdown from 'remark-parse'
import mdx from 'remark-mdx'
import { RichTypeInner } from '@tinacms/schema-tools'
import { visit } from 'unist-util-visit'
import { remarkToSlate } from './remarkToPlate'
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
 * format we can just allow Tina to do it's thing and update the form valuse with no additional work.
 */
import { fromMarkdown } from 'mdast-util-from-markdown'
import * as acorn from 'acorn'
import { mdxJsxFromMarkdown } from 'mdast-util-mdx-jsx'
import { mdxJsx } from 'micromark-extension-mdx-jsx'
import { mdxMd } from 'micromark-extension-mdx-md'
export const markdownToAst = (value: string, skipMDX?: boolean) => {
  const tree = fromMarkdown(value, 'utf-8', {
    extensions: [mdxMd, mdxJsx({ acorn: acorn, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown()],
  })
  if (!tree) {
    throw new Error('Error parsing markdown')
  }
  // Delete useless position info
  visit(tree, (node) => {
    delete node.position
  })
  return tree
}

export const parseMDX = (
  value: string,
  field: RichTypeInner,
  imageCallback: (s: string) => string,
  skipMDX?: boolean
) => {
  const tree = markdownToAst(value, skipMDX)
  return remarkToSlate(tree, field, imageCallback)
}
