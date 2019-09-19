// @ts-ignore the types are wrong?
import matter from 'gray-matter'
import { FormOptions } from '@tinacms/core'
import { useCMS, useCMSForm } from '@tinacms/react-tinacms'
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
  let cms = useCMS()

  // let throttledOnChange = React.useMemo(() => {
  // return throttle(cms.api.git.onChange, 300)
  // }, [])
  let [values, form] = useCMSForm({
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
