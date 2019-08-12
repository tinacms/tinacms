import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import { toMarkdownString } from "@forestryio/gatsby-plugin-xeditor"
import { useCMS } from "@forestryio/cms-react"
import { relative } from "path"
import { remarkForm } from "@forestryio/gatsby-xeditor-remark"

function BlogPostTemplate(props) {
  const post = props.data.markdownRemark
  const siteTitle = props.data.site.siteMetadata.title
  const { previous, next } = props.pageContext

  let cms = useCMS()
  let filepath = relative(
    "/home/dj/Forestry/cms/packages/demo/demo-gatsby/",
    post.fields.fileRelativePath
  )

  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <h1
        style={{
          marginTop: rhythm(1),
          marginBottom: 0,
        }}
      >
        {post.frontmatter.title}
      </h1>
      <button onClick={() => cms.api.gitlab.authorize()}>Login</button>
      <button
        onClick={() =>
          cms.api.gitlab.onSubmit({
            path: filepath,
            contents: toMarkdownString(post),
          })
        }
      >
        Save
      </button>
      <p
        style={{
          ...scale(-1 / 5),
          display: `block`,
          marginBottom: rhythm(1),
        }}
      >
        {post.frontmatter.date}
      </p>
      <div
        dangerouslySetInnerHTML={{
          __html: props.data.markdownRemark.html,
        }}
      />
      <hr
        style={{
          marginBottom: rhythm(1),
        }}
      />
      <Bio />

      <ul
        style={{
          display: `flex`,
          flexWrap: `wrap`,
          justifyContent: `space-between`,
          listStyle: `none`,
          padding: 0,
        }}
      >
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel="prev">
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel="next">
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </ul>
    </Layout>
  )
}

export default remarkForm({
  fields: [
    {
      label: "Title",
      name: "frontmatter.title",
      component: "text",
      required: true,
    },
    {
      label: "Date",
      name: "frontmatter.date",
      component: function ReadOnly({ input }) {
        return <div>{input.value}</div>
      },
    },
    {
      label: "Description",
      name: "frontmatter.description",
      component: "textarea",
    },
    { label: "Body", name: "rawMarkdownBody", component: "textarea" },
  ],
})(BlogPostTemplate)

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      rawMarkdownBody
      fields {
        fileRelativePath
      }
      frontmatter {
        title
        date
        description
      }
    }
  }
`
