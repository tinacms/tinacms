import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import { liveRemarkForm } from "@tinacms/react-tinacms-remark"
import Img from "gatsby-image"
import { TinaField } from "@tinacms/form-builder"
import { Wysiwyg, Toggle } from "@tinacms/fields"

const PlainText = props => (
  <input style={{ background: "transparent " }} {...props.input} />
)
const MyToggle = props => (
  <>
    <label>Draft: </label>
    <Toggle {...props} />
  </>
)

function BlogPostTemplate(props) {
  const post = props.data.markdownRemark
  const siteTitle = props.data.site.siteMetadata.title
  const { previous, next } = props.pageContext
  const { isEditing, setIsEditing } = props

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
            <TinaField name="rawFrontmatter.title" Component={PlainText}>
              {post.frontmatter.title}{" "}
            </TinaField>
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
              {post.frontmatter.thumbnail && (
                <Img
                  fluid={post.frontmatter.thumbnail.childImageSharp.fluid}
                  alt="Gatsby can't find me"
                />
              )}
              <span style={{ fontWeight: "600" }}>Date</span>
              <p>{post.frontmatter.date}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <button onClick={() => setIsEditing(p => !p)}>
          {isEditing ? "Stop Editing" : "Start Editing"}
        </button>
        <TinaField
          name="rawFrontmatter.draft"
          Component={MyToggle}
          type="checkbox"
        >
          {post.frontmatter.draft && (
            <small style={{ color: "fuchsia" }}>Draft</small>
          )}
        </TinaField>
        <TinaField name="rawMarkdownBody" Component={Wysiwyg}>
          <div
            dangerouslySetInnerHTML={{
              __html: props.data.markdownRemark.html,
            }}
          />
        </TinaField>
      </div>
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

const BlogPostForm = {
  fields: [
    {
      label: "Gallery",
      name: "rawFrontmatter.gallery",
      component: "group-list",
      fields: [
        { name: "alt", component: "text" },
        { name: "src", component: "text" },
        {
          label: "Photographer",
          name: "photographer",
          component: "group",
          fields: [
            { name: "name", component: "text" },
            {
              name: "social",
              component: "group-list",
              fields: [
                { name: "platformName", component: "text" },
                { name: "account", component: "text" },
              ],
            },
          ],
        },
      ],
    },
    {
      label: "Fake Author",
      name: "rawFrontmatter.fakeAuthor",
      component: "group",
      fields: [
        { name: "name", component: "text" },
        {
          name: "social",
          component: "group",
          fields: [
            { name: "twitter", component: "text" },
            { name: "facebook", component: "text" },
            { name: "instagram", component: "text" },
          ],
        },
      ],
    },
    {
      label: "Title",
      name: "rawFrontmatter.title",
      component: "text",
      required: true,
    },
    {
      label: "Draft",
      name: "rawFrontmatter.draft",
      component: "toggle",
    },
    {
      label: "Date",
      name: "rawFrontmatter.date",
      component: "date",
    },
    {
      label: "Description",
      name: "rawFrontmatter.description",
      component: "textarea",
    },
    {
      label: "Heading color",
      name: "rawFrontmatter.heading_color",
      component: "color",
    },
    {
      name: "rawFrontmatter.thumbnail",
      label: "Thumbnail",
      component: "image",
      // Generate the frontmatter value based on the filename
      parse: filename => `./${filename}`,

      // Decide the file upload directory for the post
      uploadDir: blogPost => {
        let postPathParts = blogPost.fileRelativePath.split("/")

        let postDirectory = postPathParts
          .splice(0, postPathParts.length - 1)
          .join("/")

        return postDirectory
      },

      // Generate the src attribute for the preview image.
      previewSrc: formValues => {
        if (!formValues.frontmatter.thumbnail) return ""
        return formValues.frontmatter.thumbnail.childImageSharp.fluid.src
      },
    },
    { label: "Body", name: "rawMarkdownBody", component: "markdown" },
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
}

export default liveRemarkForm(BlogPostTemplate, BlogPostForm)

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
      fileRelativePath
      rawFrontmatter
      rawMarkdownBody

      frontmatter {
        title
        date(formatString: "DD MMMM, YYYY")
        description
        heading_color
        draft
        thumbnail {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`
