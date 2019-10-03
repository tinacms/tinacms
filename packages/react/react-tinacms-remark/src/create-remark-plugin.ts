import { toMarkdownString } from './to-markdown'
import { CMS, Field } from '@tinacms/core'
import { AddContentPlugin } from '@tinacms/tinacms'

type MaybePromise<T> = Promise<T> | T

interface CreateRemarkButtonOptions<FormShape, FrontmatterShape> {
  label: string
  fields: Field[]
  filename(form: FormShape): MaybePromise<string>
  frontmatter?(form: FormShape): MaybePromise<FrontmatterShape>
  body?(form: FormShape): MaybePromise<string>
}

export function createRemarkButton<FormShape = any, FrontmatterShape = any>(
  options: CreateRemarkButtonOptions<FormShape, FrontmatterShape>
): AddContentPlugin {
  if (!options.filename) {
    throw new Error('createRemarkButton must be given `filename(form): string`')
  }
  if (!options.fields || options.fields.length === 0) {
    throw new Error(
      'createRemarkButton must be given `fields: Field[]` with at least 1 item'
    )
  }
  let formatFilename = options.filename
  let createFrontmatter = options.frontmatter || (() => ({}))
  let createBody = options.body || (() => '')
  return {
    __type: 'content-button',
    name: options.label,
    fields: options.fields,
    onSubmit: async (form: any, cms: CMS) => {
      let filename = await formatFilename(form)
      let rawFrontmatter = await createFrontmatter(form)
      let rawMarkdownBody = await createBody(form)

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
