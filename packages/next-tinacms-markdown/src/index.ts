/**

Copyright 2019 Forestry.io Inc

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

import matter from 'gray-matter'
import { FormOptions } from '@tinacms/core'
import { useCMS, useCMSForm } from 'react-tinacms'
import * as yaml from 'js-yaml'

interface MarkdownCollection {
  path: string
  ctx: {
    (filename: string): string
    keys(): string[]
  }
}

/**
 * Parses markdown files retrieved via webpack context.
 *
 * TODO: Some form of this could be generic.
 */
export function loadMarkdown({ ctx, path }: MarkdownCollection) {
  // Get posts from folder
  const filenames = ctx.keys()
  const files = filenames.map(ctx)

  return filenames.map((filename, index) => {
    const slug = slugify(filename)
    const document = matter(files[index])
    return {
      filename: `${path}/${filename.replace('./', '')}`,
      document: {
        content: document.content,
        frontmatter: document.data,
      },
      slug,
    }
  })
}

/**
 * Generates a slug based on the filename
 */
function slugify(filename: string) {
  return filename
    .replace(/^.*[\\\/]/, '')
    .split('.')
    .slice(0, -1)
    .join('.')
}

interface Markdown {
  path: string
  frontmatter: string
  content: string
}

export function useMarkdownForm(
  markdownRemark: Markdown,
  formOverrrides: FormOptions<any>
) {
  const cms = useCMS()

  // let throttledOnChange = React.useMemo(() => {
  // return throttle(cms.api.git.onChange, 300)
  // }, [])
  const [values, form] = useCMSForm({
    label: markdownRemark.path,
    id: markdownRemark.path,
    initialValues: markdownRemark,
    async onSubmit(data) {
      console.log({ data })
      await cms.api.git.onChange!({
        fileRelativePath: data.path,
        content: toMarkdownString(data),
      })
      return await cms.api.git.onSubmit!({
        files: [data.path],
        message: data.__commit_message || 'commit from tina',
        name: data.__commit_name,
        email: data.__commit_email || 'ncphillips.19@gmail.com',
      })
    },
    ...formOverrrides,
  })

  return [values, form]
}

function toMarkdownString(remark: Markdown) {
  return (
    '---\n' + yaml.dump(remark.frontmatter) + '---\n' + (remark.content || '')
  )
}
