import { toMarkdownString } from './to-markdown'
import { CMS } from '@tinacms/core'
import { AddContentPlugin } from '@forestryio/xeditor'

interface CreateRemarkButtonOptions {
  label: string
  filename(value: string): Promise<string> | string
  frontmatter(value: string): Promise<object> | object
  body(value: string): Promise<string> | string
}

export function createRemarkButton(
  options: CreateRemarkButtonOptions
): AddContentPlugin {
  let formatFilename = options.filename || ((value: string) => value)
  let createFrontmatter = options.frontmatter || (() => ({}))
  let createBody = options.body || (() => '')
  return {
    __type: 'content-button',
    name: options.label,
    onSubmit: async (value: string, cms: CMS) => {
      let filename = await formatFilename(value)
      let frontmatter = await createFrontmatter(value)
      let rawMarkdownBody = await createBody(value)

      let fileRelativePath = filename
      cms.api.git!.onChange!({
        fileRelativePath,
        content: toMarkdownString({
          frontmatter,
          rawMarkdownBody,
          // unnecessary
          id: '',
          html: '',
          fields: { fileRelativePath },
        }),
      })
    },
  }
}
