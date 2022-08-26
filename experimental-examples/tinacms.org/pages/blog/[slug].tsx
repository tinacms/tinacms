import { client } from '../../.tina/__generated__/client'

import * as React from 'react'
import styled from 'styled-components'
import { NextSeo } from 'next-seo'
import { GetStaticProps, GetStaticPaths } from 'next'
import { formatDate, isRelevantPost } from '../../utils'
import {
  Layout,
  Hero,
  Wrapper,
  MarkdownContent,
  DocsTextWrapper,
} from 'components/layout'
import { fileToUrl } from 'utils/urls'
import { getPageRef } from 'utils/docs/getDocProps'
const fg = require('fast-glob')
import { LastEdited, DocsPagination } from 'components/ui'
import { openGraphImage } from 'utils/open-graph-image'
import { WarningCallout } from '../../utils/shortcodes'
import { useTina } from 'tinacms/dist/edit-state'
import path from 'path'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import atomOneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/atom-dark'

const components = {
  Iframe: ({ iframeSrc, height }) => {
    return <iframe width="100%" height={`${height}px`} src={iframeSrc} />
  },
  Youtube: ({ embedSrc }) => (
    <iframe
      width="560"
      height="315"
      src={embedSrc}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen={true}
    ></iframe>
  ),
  CreateAppCta: ({ ctaText, cliText }) => (
    <>
      <a
        href="/docs/introduction/using-starter/"
        style={{
          textDecoration: 'none',
          borderRadius: '10px',
          padding: '1rem 1.5rem',
          lineHeight: '1em',
          fontWeight: 'bold',
          background: '#ec4815',
          display: 'inline-block',
          color: 'white',
        }}
      >
        {ctaText}
      </a>

      <div
        style={{
          padding: '1rem 1.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          width: 'auto',
          display: 'inline-block',
          border: '1px solid #8080803b',
          lineHeight: '1em',
          borderRadius: '10px',
          marginLeft: '20px',
          fontSize: '1rem',
        }}
      >
        {cliText}
      </div>
    </>
  ),
  Callout: ({ title, description, url, buttonText }) => (
    <div className="callout">
      <img
        className="learnImage"
        src="/img/tina-laptop.png"
        alt="Tina laptop"
      />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        <a href={url} className="calloutButton">
          {buttonText}
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 448 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
          </svg>
        </a>
      </div>
    </div>
  ),
  Codesandbox: ({ embedSrc, title }) => (
    <iframe
      src={embedSrc}
      style={{
        width: '100%',
        height: '500px',
        border: 'none',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
      title={title}
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      className="wide"
    ></iframe>
  ),
  Diagram: ({ alt, src }) => (
    <img
      alt={alt}
      style={{
        margin: 'auto',
        padding: '2rem .5rem',
        border: 'none',
      }}
      src={src}
    />
  ),
  code_block: ({ children, lang }) => {
    return (
      <SyntaxHighlighter
        code={children || ''}
        language={lang || 'jsx'}
        style={atomOneDark}
      />
    )
  },
  CustomFieldComponentDemo: () => (
    <iframe
      height="450"
      style={{ width: '100%' }}
      scrolling="no"
      title="CSS Filters + A Springer Spaniel"
      src="https://codepen.io/kendallstrautman/embed/WNbzLJZ?height=265&theme-id=default&default-tab=css,result"
      frameBorder="no"
      allowTransparency={true}
      allowFullScreen={true}
    >
      See the Pen{' '}
      <a href="https://codepen.io/kendallstrautman/pen/WNbzLJZ">
        CSS Filters + A Springer Spaniel
      </a>{' '}
      by Kendall strautman (
      <a href="https://codepen.io/kendallstrautman">@kendallstrautman</a>) on{' '}
      <a href="https://codepen.io">CodePen</a>.
    </iframe>
  ),
}

function BlogTemplate({ file, siteConfig, ...props }) {
  const { data, isLoading } = useTina({
    query: props.query,
    data: props.data,
    variables: props.vars,
  })

  const { body, excerpt, prev, next, ...frontmatter } = data?.post

  const prevPage = React.useMemo(() => {
    if (!prev) return null
    const { name } = path.parse(prev.id)
    return {
      slug: `/blog/${name}`,
      title: prev.title,
    }
  }, [prev])

  const nextPage = React.useMemo(() => {
    if (!next) return null
    const { name } = path.parse(next.id)
    return {
      slug: `/blog/${name}`,
      title: next.title,
    }
  }, [next])

  const warningMessage =
    data.warningMessage ||
    (!isRelevantPost(frontmatter) &&
      '**Update:** The Tina API has been evolving, and the content in this post is outdated. For help getting started with Tina, we suggest checking out our [getting started doc](/docs/setup-overview/).')

  return (
    <Layout>
      <NextSeo
        title={frontmatter.title}
        titleTemplate={'%s | ' + siteConfig.title + ' Blog'}
        description={excerpt}
        openGraph={{
          title: frontmatter.title,
          description: excerpt,
          images: [
            frontmatter.opengraph?.image ||
              openGraphImage(
                frontmatter.title,
                ' | TinaCMS Blog',
                frontmatter.author
              ),
          ],
        }}
      />
      <Hero>{frontmatter.title}</Hero>
      <BlogWrapper>
        <DocsTextWrapper>
          <BlogMeta>
            <MetaWrap>
              <MetaBit>{formatDate(frontmatter.date)}</MetaBit>
              <MetaBit>
                <span>By</span> <strong>{frontmatter.author}</strong>
              </MetaBit>
            </MetaWrap>
          </BlogMeta>
          {warningMessage && <WarningCallout text={warningMessage} />}
          <TinaMarkdown components={components} content={body} />
          <LastEdited date={frontmatter.last_edited} />
          {(prevPage?.slug !== null || nextPage?.slug !== null) && (
            <DocsPagination prevPage={prevPage} nextPage={nextPage} />
          )}
        </DocsTextWrapper>
      </BlogWrapper>
    </Layout>
  )
}

export default BlogTemplate

/*
 ** DATA FETCHING --------------------------------------------------
 */

export const getStaticProps: GetStaticProps = async function ({
  preview,
  previewData,
  ...ctx
}) {
  const { slug } = ctx.params

  //TODO - move to readFile
  const { default: siteConfig } = await import('../../content/siteConfig.json')

  const vars = { relativePath: `${slug}.md` }
  const res = await client.queries.getExpandedPostDocument(vars)
  console.log('response', slug, res)

  return {
    props: {
      query: res.query,
      data: res.data,
      vars,
      siteConfig: { title: siteConfig.title },
    },
  }
}

export const getStaticPaths: GetStaticPaths = async function () {
  const blogs = await fg(`./content/blog/**/*.md`)
  return {
    paths: blogs.map((file) => {
      const slug = fileToUrl(file, 'blog')
      return { params: { slug } }
    }),
    fallback: false,
  }
}

/*
 ** STYLES ---------------------------------------------------------
 */

const BlogWrapper = styled(Wrapper)`
  padding-top: 4rem;
  padding-bottom: 3rem;
  max-width: 768px;
`

const BlogMeta = styled.div`
  width: 100%;
  justify-content: space-between;
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-bottom: 3rem;
  margin-top: -0.5rem;

  @media (min-width: 550px) {
    flex-direction: row;
  }
`

const MetaWrap = styled.span`
  opacity: 0.8;
`

const MetaBit = styled.p`
  display: flex;
  margin: 0 !important;

  span {
    opacity: 0.7;
    margin-right: 0.25rem;
  }
`
