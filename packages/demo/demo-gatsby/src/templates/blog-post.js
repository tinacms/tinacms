import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import { useRemarkForm } from "@tinacms/react-tinacms-remark"
function BlogPostTemplate(props) {
  const post = props.data.markdownRemark
  const siteTitle = props.data.site.siteMetadata.title
  const { previous, next } = props.pageContext

  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />

      <div
        style={{
          backgroundColor: post.frontmatter.heading_color || "#ffffff",
        }}
      >
        <div
          style={{
            marginLeft: `auto`,
            marginRight: `auto`,
            maxWidth: rhythm(24),
            padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
          }}
        >
          <h1
            style={{
              margin: 0,
              marginTop: rhythm(2),
            }}
          >
            {post.frontmatter.title}{" "}
            {post.frontmatter.draft && (
              <small style={{ color: "fuchsia" }}>Draft</small>
            )}
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: rhythm(2),
              marginBottom: rhythm(1),
            }}
          >
            <Bio />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "600" }}>Date</span>
              <p>{post.frontmatter.date}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        dangerouslySetInnerHTML={{
          __html: props.data.markdownRemark.html,
        }}
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      />
      <div
        style={{
          marginBottom: rhythm(1),
          width: "100%",
          height: "1px",
          backgroundColor: "#eaeaea",
        }}
      />
      <ul
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
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

export default props => {
  const fullPath = props.data.markdownRemark.fields.fileRelativePath
  const imagePath = fullPath
    .split("/")
    .slice(0, -1)
    .join("/")
  useRemarkForm(props.data.markdownRemark, {
    fields: [
      {
        label: "Title",
        name: "fields.rawFrontmatter.title",
        component: "text",
        required: true,
      },
      {
        label: "Draft",
        name: "fields.rawFrontmatter.draft",
        component: "toggle",
      },
      {
        label: "Date",
        name: "fields.rawFrontmatter.date",
        component: function ReadOnly({ input }) {
          return <div>{input.value}</div>
        },
      },
      {
        label: "Description",
        name: "fields.rawFrontmatter.description",
        component: "textarea",
      },
      {
        label: "Heading color",
        name: "fields.rawFrontmatter.heading_color",
        component: "color",
      },
      {
        name: "thumbnail",
        label: "Thumbnail",
        component: "image",
        path: imagePath,
      },

      { label: "Body", name: "rawMarkdownBody", component: "textarea" },
      { name: "hr", component: () => <hr /> },
      {
        label: "Commit Name",
        name: "__commit_name",
        component: "text",
      },
      {
        label: "Commit Email",
        name: "__commit_email",
        component: "text",
      },
      {
        label: "Commit Message (Optional)",
        name: "__commit_message",
        component: "textarea",
      },
    ],
  })

  return <BlogPostTemplate {...props} />
}

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
        rawFrontmatter {
          title
          date
          description
          heading_color
          draft
        }
      }
      frontmatter {
        title
        date(formatString: "DD MMMM, YYYY")
        description
        heading_color
        draft
      }
    }
  }
`
