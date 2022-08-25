import React from 'react'
import styled from 'styled-components'
import { NextSeo } from 'next-seo'
import { GetStaticProps, GetStaticPaths } from 'next'
import { orderPosts, formatExcerpt, formatDate } from '../../../utils'
import path from 'path'

import {
  Layout,
  Wrapper,
  Hero,
  MarkdownContent,
  RichTextWrapper,
} from 'components/layout'
import { DynamicLink, BlogPagination } from 'components/ui'
import { getMarkdownPreviewProps } from 'utils/getMarkdownPreviewProps'
const Index = (props) => {
  const { currentPage, numPages } = props

  return (
    <Layout>
      <NextSeo
        title="Blog"
        openGraph={{
          title: 'Blog',
        }}
      />
      <Hero mini="true"></Hero>
      <BlogWrapper>
        {props.posts.map((post) => (
          <DynamicLink
            key={post.data.slug}
            href={`/blog/${post.data.slug}`}
            passHref
          >
            <BlogExcerpt>
              <BlogTitle>{post.data.title}</BlogTitle>
              <RichTextWrapper>
                <BlogMeta>
                  <MetaBit>
                    <span>By</span> <strong>{post.data.author}</strong>
                  </MetaBit>
                  <MetaBit>{formatDate(post.data.date)}</MetaBit>
                </BlogMeta>
                <MarkdownContent skipHtml={true} content={post.content} />
                <hr />
              </RichTextWrapper>
              <br />
            </BlogExcerpt>
          </DynamicLink>
        ))}
        <BlogPagination currentPage={currentPage} numPages={numPages} />
      </BlogWrapper>
    </Layout>
  )
}

/*
 ** DATA FETCHING ---------------------------------
 */

const POSTS_PER_PAGE = 8

export const getStaticPaths: GetStaticPaths = async function () {
  const fg = require('fast-glob')
  const contentDir = './content/blog/'
  const posts = await fg(`${contentDir}**/*.md`)

  const numPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  var pages = []
  for (var i = 1; i <= numPages; i++) {
    pages.push({
      params: { page_index: i.toString() },
    })
  }

  return { paths: pages, fallback: false }
}

export const getStaticProps: GetStaticProps = async function ({
  preview,
  previewData,
  ...ctx
}) {
  // @ts-ignore page_index should always be a single string
  const page = parseInt((ctx.params && ctx.params.page_index) || '1')

  try {
    const files = await getLocalFiles('content/blog')

    const posts = await Promise.all(
      // TODO - potentially making a lot of requests here
      files.map(async (file) => {
        const post = (await getMarkdownPreviewProps(file, preview, previewData))
          .props.file

        // create slug from filename
        const slug = file
          .replace(/^.*[\\\/]/, '')
          .split('.')
          .slice(0, -1)
          .join('.')

        const excerpt = await formatExcerpt(post.data.markdownBody)

        return {
          data: { ...post.data.frontmatter, slug },
          content: excerpt,
        }
      })
    )

    // for pagination and ordering
    const numPages = Math.ceil(posts.length / POSTS_PER_PAGE)
    const pageIndex = page - 1
    const orderedPosts = orderPosts(posts).slice(
      pageIndex * POSTS_PER_PAGE,
      (pageIndex + 1) * POSTS_PER_PAGE
    )

    return {
      props: {
        posts: orderedPosts,
        numPages: numPages,
        currentPage: page,
        preview: !!preview,
      },
    }
  } catch (e) {
    return {
      props: {
        error: { ...e }, //workaround since we cant return error as JSON
      },
    }
  }
}

export default Index

const getLocalFiles = async (filePath: string) => {
  // grab all md files
  const fg = require('fast-glob')
  const glob = path.resolve(filePath, '*')
  const files = await fg(glob)

  return files
}

/**
 *  STYLES -----------------------------------------------------
 */

const BlogWrapper = styled(Wrapper)`
  padding-top: 10rem;
  max-width: 768px;
`

const BlogTitle = styled(({ children, ...styleProps }) => {
  return (
    <h3 className {...styleProps}>
      {children}
    </h3>
  )
})`
  font-family: var(--font-tuner);
  font-weight: regular;
  font-style: normal;
  font-size: 2rem;
  color: inherit;
  transition: all 180ms ease-out;
  line-height: 1.3;
  margin-bottom: 1.5rem;
  color: var(--color-secondary);
  max-width: 38rem;
`

const BlogExcerpt = styled.a`
  cursor: pointer;
  text-decoration: none;
  &:hover,
  &:focus {
    outline: none;
    ${BlogTitle} {
      color: var(--color-orange) !important;
    }
  }
  &:focus {
    hr {
      transition: all 230ms ease-out;
      width: 100%;
    }
  }
  hr {
    transition: all 180ms ease-out;
  }
`

const MetaBit = styled.p`
  display: flex;
  margin: 0 !important;

  strong {
    opacity: 0.7;
  }

  span {
    opacity: 0.7;
    margin-right: 0.25rem;
  }
`

const BlogMeta = styled.div`
  width: 100%;
  justify-content: space-between;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  margin-bottom: 1.5rem;
  margin-top: -0.5rem;

  @media (min-width: 550px) {
    flex-direction: row;
  }
`
