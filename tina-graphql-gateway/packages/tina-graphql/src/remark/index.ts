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

import unified from 'unified'
import remark2rehype from 'remark-rehype'
import htmlStringify from 'rehype-stringify'
import parse from 'remark-parse'
import mdx from 'remark-mdx'
import removePosition from 'unist-util-remove-position'

export const toHTML = async ({ contents: c }: { contents: string }) => {
  // @ts-ignore
  var compiler = unified().use(parse).use(remark2rehype).use(htmlStringify)

  const { contents } = compiler.processSync({ contents: c })

  return contents as string
}

export const toAst = async ({ contents }: { contents: string }) => {
  // @ts-ignore
  var tree = unified().use(parse).use(mdx).parse(contents)

  removePosition(tree, true)

  return tree
}
