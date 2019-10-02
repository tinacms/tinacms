import { toMarkdownString } from './to-markdown'
import { CMS, Field } from '@tinacms/core'
import { AddContentPlugin } from '@tinacms/tinacms'

type MaybePromise<T> = Promise<T> | T

interface CreateRemarkButtonOptions<FormShape, FrontmatterShape> {
  label: string
  fields: Field[]
  filename(value: FormShape): MaybePromise<string>
  frontmatter?(value: FormShape): MaybePromise<FrontmatterShape>
  body?(value: FormShape): MaybePromise<string>
}

export function createRemarkButton<FormShape = any, FrontmatterShape = any>(
  options: CreateRemarkButtonOptions<FormShape, FrontmatterShape>
): AddContentPlugin {
  let formatFilename = options.filename
  let createFrontmatter = options.frontmatter || (() => ({}))
  let createBody = options.body || (() => '')
  return {
    __type: 'content-button',
    name: options.label,
    fields: options.fields,
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
