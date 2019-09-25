import { toMarkdownString } from './to-markdown'
import { CMS, Field } from '@tinacms/core'
import { AddContentPlugin } from '@tinacms/tinacms'

type MaybePromise<T> = Promise<T> | T

interface CreateRemarkButtonOptions<FormShape, FrontmatterShape> {
  label: string
  filename?(value: FormShape): MaybePromise<string>
  frontmatter?(value: FormShape): MaybePromise<FrontmatterShape>
  body?(value: FormShape): MaybePromise<string>
  fields?: Field[]
}

const DEFAULT_REMARK_FIELDS = [
  { name: 'title', component: 'text', label: 'Title' },
]

export function createRemarkButton<FormShape = any, FrontmatterShape = any>(
  options: CreateRemarkButtonOptions<FormShape, FrontmatterShape>
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
