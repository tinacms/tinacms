import * as React from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { getMarkdownPreviewProps } from 'utils/getMarkdownPreviewProps'
import { DocsLayout, MarkdownContent } from 'components/layout'
import { NextSeo } from 'next-seo'
import { DocsPagination, LastEdited } from 'components/ui'
import {
  DocsGrid,
  DocGridHeader,
  DocsPageTitle,
  DocGridToc,
  DocGridContent,
} from '../../../docs/[...slug]'
import { useRouter } from 'next/router'
import { getGuideNavProps } from 'utils/guide_helpers'
import { useMemo } from 'react'
import { getJsonPreviewProps } from 'utils/getJsonPreviewProps'
import { createTocListener } from 'utils'
import Toc from '../../../../components/toc'
import { openGraphImage } from 'utils/open-graph-image'
import * as ga from '../../../../utils/ga'
import { getDocsNav } from 'utils/docs/getDocProps'

interface NavSectionProps {
  id: string
  slug?: string
  href?: string
  title: string
  items: NavSectionProps[]
  collapsible?: boolean
  returnLink?: {
    url: string
    label: string
  }
}

interface GuideTemplateProps {
  tocItems: string
  breadcrumb: { category: string }
  guideMeta: GitFile
  markdownFile: GitFile
  allGuides: NavSectionProps[]
  docsNav: any
}

type GitFile = {
  fileRelativePath: string
  sha: string
  data: any
}

export default function GuideTemplate({
  tocItems,
  breadcrumb,
  guideMeta,
  markdownFile,
  allGuides,
  docsNav,
}: GuideTemplateProps) {
  const isBrowser = typeof window !== `undefined`
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [activeIds, setActiveIds] = React.useState([])
  const router = useRouter()
  const currentPath = router.asPath
  const excerpt = markdownFile.data.excerpt

  /** Handles active TOC */
  React.useEffect(() => {
    if (!isBrowser || !contentRef.current) {
      return
    }

    const activeTocListener = createTocListener(contentRef, setActiveIds)
    window.addEventListener('scroll', activeTocListener)

    return () => window.removeEventListener('scroll', activeTocListener)
  }, [contentRef])

  React.useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }
    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on('routeChangeComplete', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const { frontmatter, markdownBody } = markdownFile.data
  const guide = guideMeta.data

  const guideTitle = guide?.title || 'TinaCMS Guides'
  const { prev, next } = usePrevNextSteps(guide, currentPath)

  return (
    <>
      <NextSeo
        title={frontmatter.title}
        titleTemplate={'%s | TinaCMS Docs'}
        description={excerpt}
        openGraph={{
          title: frontmatter.title,
          description: excerpt,
          images: [
            openGraphImage(guideTitle, ' | TinaCMS Docs', frontmatter.title),
          ],
        }}
      />
      <DocsLayout navItems={docsNav}>
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
            <LastEdited date={frontmatter.last_edited} />
            <DocsPagination prevPage={prev} nextPage={next} />
          </DocGridContent>
        </DocsGrid>
      </DocsLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async function (ctx) {
  const { category, guide, step } = ctx.params
  const {
    props: { file: guideMeta },
  } = await getJsonPreviewProps(
    `content/guides/${category}/${guide}/meta.json`,
    ctx.preview,
    ctx.previewData
  )

  const slug = `content/guides/${category}/${guide}/${step}.md`
  const {
    props: { preview, file: markdownFile, tocItems },
  } = await getMarkdownPreviewProps(slug, ctx.preview, ctx.previewData)

  const docsNav = (await getDocsNav(preview, slug)).data

  return {
    props: {
      preview,
      currentGuide: guideMeta.data,
      breadcrumb: {
        category,
      },
      guideMeta,
      markdownFile,
      docsNav,
      allGuides: await getGuideNavProps(),
      tocItems,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async function () {
  const fg = require('fast-glob')
  const contentDir = './content/'
  const rawPaths = await fg(`${contentDir}/guides/*/*/*.md`)
  const captureUrlParams = /\/guides\/([^\/]+)\/([^\/]+)\/([^\/]+)/
  return {
    paths: rawPaths.map((path) => {
      const [, category, guide, step] = captureUrlParams.exec(
        path.split('.md')[0]
      )
      return {
        params: { category, guide, step },
      }
    }),
    fallback: false,
  }
}

function useGuideNav(guide: any, allGuides: any) {
  return useMemo(() => {
    if (guide) {
      return [
        {
          title: guide.title,
          id: guide.title,
          collapsible: false,
          items: [
            {
              title: guide.title,
              id: guide.title + 2,
              collapsible: false,
              items: guide.steps,
            },
          ],
          returnLink: {
            url: '/guides',
            label: '‹ Back to Guides',
          },
        },
      ]
    } else {
      return allGuides
    }
  }, [guide, allGuides])
}

function usePrevNextSteps(guide: any, currentPath: string) {
  return React.useMemo(() => {
    if (!guide) {
      return { prev: null, next: null }
    }
    let prev = null,
      next = null
    const currentPathStripped = currentPath.replace(/\/$/, '')
    const allSteps = guide.steps
    const currentItemIndex = allSteps.findIndex(
      (step) => step.slug.replace(/\/$/, '') == currentPathStripped
    )
    if (currentItemIndex >= 0) {
      prev = allSteps[currentItemIndex - 1]

      if (currentItemIndex < allSteps.length - 1) {
        next = allSteps[currentItemIndex + 1]
      }
    }

    return { prev, next }
  }, [guide, currentPath])
}
