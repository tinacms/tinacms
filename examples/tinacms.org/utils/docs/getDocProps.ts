import { getJsonFile } from '../getJsonPreviewProps'
import {
  getMarkdownPreviewProps,
  getMarkdownFile,
} from '../getMarkdownPreviewProps'
import { NotFoundError } from 'utils/error/NotFoundError'

export async function getDocsNav(preview: boolean, previewData: any) {
  return getJsonFile('content/toc-doc.json', preview, previewData)
}

export async function getDocProps({ preview, previewData }: any, slug: string) {
  const currentDoc = (
    await getMarkdownPreviewProps(
      `content/docs/${slug}.md`,
      preview,
      previewData
    )
  ).props

  const docsNav = await getDocsNav(preview, previewData)

  if (!currentDoc || currentDoc.error || !docsNav) {
    throw new NotFoundError('Document not found')
  }

  return {
    props: {
      ...currentDoc,
      docsNav: docsNav.data,
      nextPage: await getPageRef(
        currentDoc.file.data.frontmatter.next,
        preview,
        previewData
      ),
      prevPage: await getPageRef(
        currentDoc.file.data.frontmatter.prev,
        preview,
        previewData
      ),
    },
  }
}

export async function getPageRef(
  slug: string = null,
  preview: boolean,
  previewData: any
) {
  if (!slug) {
    return {
      slug: null,
      title: null,
    }
  }
  const prevDoc = await getMarkdownFile(
    `content${slug}.md`,
    preview,
    previewData
  )

  const { title } = prevDoc.data.frontmatter

  return { slug, title }
}
