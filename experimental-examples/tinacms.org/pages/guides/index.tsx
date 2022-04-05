import { NextSeo } from 'next-seo'
import React from 'react'

import { getMarkdownPreviewProps } from 'utils/getMarkdownPreviewProps'
import { getDocsNav } from 'utils/docs/getDocProps'
import { createTocListener } from 'utils'
import { DocsLayout, MarkdownContent } from 'components/layout'
import {
  DocGridToc,
  DocGridContent,
  DocsGrid,
  DocGridHeader,
  DocsPageTitle,
} from '../docs/[...slug]'
import Toc from 'components/toc'
import { openGraphImage } from 'utils/open-graph-image'

const GuideTemplate = ({ markdownFile, navItems, tocItems }) => {
  const { frontmatter, markdownBody, excerpt } = markdownFile.data
  const [activeIds, setActiveIds] = React.useState([])
  const isBrowser = typeof window !== `undefined`
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isBrowser || !contentRef.current) {
      return
    }

    const activeTocListener = createTocListener(contentRef, setActiveIds)
    window.addEventListener('scroll', activeTocListener)

    return () => window.removeEventListener('scroll', activeTocListener)
  }, [contentRef])

  return (
    <>
      <NextSeo
        title={frontmatter.title}
        titleTemplate={'%s | TinaCMS Docs'}
        description={excerpt}
        openGraph={{
          title: frontmatter.title,
          description: excerpt,
          images: [openGraphImage('TinaCMS Guides')],
        }}
      />
      <DocsLayout navItems={navItems}>
        <DocsGrid>
          <DocGridHeader>
            <DocsPageTitle>{frontmatter.title}</DocsPageTitle>
          </DocGridHeader>
          <DocGridToc>
            <Toc tocItems={tocItems} activeIds={activeIds} />
          </DocGridToc>
          <DocGridContent ref={contentRef}>
            <hr />
            <MarkdownContent escapeHtml={false} content={markdownBody} />
          </DocGridContent>
        </DocsGrid>
      </DocsLayout>
    </>
  )
}

export default GuideTemplate

export const getStaticProps = async (ctx) => {
  const {
    props: { preview, file: markdownFile, tocItems },
  } = await getMarkdownPreviewProps(
    `content/guides/index.md`,
    ctx.preview,
    ctx.previewData
  )
  const navItems = await getDocsNav(preview, ctx.previewData)

  return {
    props: {
      slug: '/guides',
      markdownFile,
      tocItems,
      navItems: navItems.data,
    },
  }
}
