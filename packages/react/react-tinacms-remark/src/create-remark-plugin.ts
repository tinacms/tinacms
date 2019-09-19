import { toMarkdownString } from './to-markdown'
import { CMS, Field } from '@tinacms/core'
import { AddContentPlugin } from '@tinacms/tinacms'

interface CreateRemarkButtonOptions {
  label: string
  filename(value: string): Promise<string> | string
  frontmatter(value: string): Promise<object> | object
  body(value: string): Promise<string> | string
  fields?: Field[]
}
const DEFAULT_REMARK_FIELDS = [
  { name: 'title', component: 'text', label: 'Title' },
]

export function createRemarkButton(
  options: CreateRemarkButtonOptions
): AddContentPlugin {
  let formatFilename = options.filename || ((value: any) => value.title)
  let createFrontmatter = options.frontmatter || (() => ({}))
  let createBody = options.body || (() => '')
  return {
    __type: 'content-button',
    name: options.label,
    fields: options.fields || DEFAULT_REMARK_FIELDS,
    onSubmit: async (value: any, cms: CMS) => {
      let filename = await formatFilename(value)
      let rawFrontmatter = await createFrontmatter(value)
      let rawMarkdownBody = await createBody(value)

      let fileRelativePath = filename
      cms.api.git!.onChange!({
        fileRelativePath,
        content: toMarkdownString({
          id: '',
          fileRelativePath,
          rawFrontmatter,
          rawMarkdownBody,
        }),
      })
    },
  }
}
