import React from 'react'
import styled from 'styled-components'
import { NextSeo } from 'next-seo'
import { GetStaticProps, GetStaticPaths } from 'next'
import { DocsLayout, MarkdownContent } from 'components/layout'
import { NavToggle, DocsPagination, LastEdited } from 'components/ui'
import { getDocProps } from 'utils/docs/getDocProps'
import Toc from '../../components/toc'
import { openGraphImage } from 'utils/open-graph-image'
import Error from 'next/error'
import { NotFoundError } from 'utils/error/NotFoundError'
import { useRouter } from 'next/router'
import { CloudDisclaimer } from 'components/cloud-beta-disclaimer'
import * as ga from '../../utils/ga'
import { Breadcrumbs } from 'components/DocumentationNavigation/Breadcrumbs'
import { useTocListener } from 'utils/toc_helpers'
import SetupOverview from '../../components/layout/setup-overview'

export function DocTemplate(props) {
  if (props.file.fileRelativePath.includes('setup-overview')) {
    return <SetupOverview {...props} />
  }
  return <_DocTemplate {...props} />
}

function _DocTemplate(props) {
  // fallback workaround
  if (props.notFound) {
    return <Error statusCode={404} />
  }
  const data = props.file.data

  const router = useRouter()
  const isCloudDocs = router.asPath.includes('tina-cloud')

  const isBrowser = typeof window !== `undefined`

  const frontmatter = data.frontmatter
  const markdownBody = data.markdownBody
  const excerpt = props.file.data.excerpt
  const tocItems = props.tocItems

  const { activeIds, contentRef } = useTocListener(data)

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

  return (
    <>
      <NextSeo
        title={frontmatter.title}
        titleTemplate={'%s | TinaCMS Docs'}
        description={excerpt}
        openGraph={{
          title: frontmatter.title,
          description: excerpt,
          images: [openGraphImage(frontmatter.title, '| TinaCMS Docs')],
        }}
      />
      <DocsLayout navItems={props.docsNav}>
        <DocsGrid>
          <DocGridHeader>
            <Breadcrumbs navItems={props.docsNav} />
            <DocsPageTitle>{frontmatter.title}</DocsPageTitle>
          </DocGridHeader>
          <DocGridToc>
            <Toc tocItems={tocItems} activeIds={activeIds} />
          </DocGridToc>
          <DocGridContent ref={contentRef}>
            <hr />
            {isCloudDocs ? <CloudDisclaimer /> : null}
            <MarkdownContent escapeHtml={false} content={markdownBody} />
            <LastEdited date={frontmatter.last_edited} />
            {(props.prevPage?.slug !== null ||
              props.nextPage?.slug !== null) && (
              <DocsPagination
                prevPage={props.prevPage}
                nextPage={props.nextPage}
              />
            )}
          </DocGridContent>
        </DocsGrid>
      </DocsLayout>
    </>
  )
}

export default DocTemplate

/*
 * DATA FETCHING ------------------------------------------------------
 */

export const getStaticProps: GetStaticProps = async function (props) {
  let { slug: slugs } = props.params

  // @ts-ignore This should maybe always be a string[]?
  const slug = slugs.join('/')

  try {
    return await getDocProps(props, slug)
  } catch (e) {
    if (e) {
      return {
        props: {
          error: { ...e }, //workaround since we cant return error as JSON
        },
      }
    } else if (e instanceof NotFoundError) {
      return {
        props: {
          notFound: true,
        },
      }
    }
  }
}

export const getStaticPaths: GetStaticPaths = async function () {
  const fg = require('fast-glob')
  const contentDir = './content/docs/'
  const files = await fg(`${contentDir}**/*.md`)
  return {
    fallback: false,
    paths: files
      .filter((file) => !file.endsWith('index.md'))
      .map((file) => {
        const path = file.substring(contentDir.length, file.length - 3)
        return { params: { slug: path.split('/') } }
      }),
  }
}

/*
 * STYLES --------------------------------------------------------------
 */

export const DocsGrid = styled.div`
  display: block;
  width: 100%;
  position: relative;
  padding: 1rem 2rem 3rem 2rem;
  max-width: 768px;
  margin: 0 auto;

  @media (min-width: 500px) {
    padding: 1rem 3rem 3rem 3rem;
  }

  @media (min-width: 1200px) {
    display: grid;
    max-width: none;
    padding: 2rem 0rem 4rem 0rem;
    grid-template-areas:
      '. header header .'
      '. content toc .';
    grid-auto-columns: minmax(0, auto) minmax(300px, 800px)
      clamp(17.5rem, 10rem + 10vw, 21.25rem) minmax(0, auto);
    grid-column-gap: 3rem;
  }
`

export const DocGridHeader = styled.div`
  grid-area: header;
  width: 100%;
`

export const DocGridToc = styled.div`
  grid-area: toc;
  width: 100%;

  @media (min-width: 1200px) {
    padding-top: 4.5rem;
  }
`

interface ContentProps {
  ref: any
}

export const DocGridContent = styled.div<ContentProps>`
  grid-area: content;
  width: 100%;
`

export const DocsPageTitle = styled.h1`
  font-size: 2rem;
  line-height: 1.2 !important;
  letter-spacing: 0.1px;
  color: var(--color-orange);
  position: relative;
  font-family: var(--font-tuner);
  font-style: normal;

  margin: 0 0 0 0 !important;

  @media (max-width: 1199px) {
    margin: 0 0 1.25rem 0 !important;
  }
`

export const DocsNavToggle = styled(NavToggle)`
  position: fixed;
  margin-top: 1.25rem;
  left: 1rem;
  z-index: 500;

  @media (min-width: 999px) {
    display: none;
  }
`
