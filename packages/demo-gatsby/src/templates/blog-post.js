/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import { liveRemarkForm } from "gatsby-tinacms-remark"
import Img from "gatsby-image"
import { TinaField } from "@tinacms/form-builder"
import { Wysiwyg, Toggle } from "@tinacms/fields"
const get = require("lodash.get")

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
  const blocks = post.frontmatter.blocks || []

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
        {blocks.map(({ _template, ...block }) => {
          switch (_template) {
            case "heading":
              return <h1>{block.text}</h1>
            case "image":
              return (
                <p>
                  <img {...block} />
                </p>
              )
            default:
              return "What"
          }
        })}
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

const heading = {
  label: "Heading",
  defaultItem: {
    text: "",
  },
  fields: [{ name: "text", component: "text", label: "Text" }],
}

const image = {
  label: "img",
  defaultItem: {
    text: "",
  },
  fields: [
    { name: "src", component: "text", label: "Source URL" },
    { name: "alt", component: "text", label: "Alt Text" },
  ],
}

const BlogPostForm = {
  fields: [
    {
      label: "Blocks",
      name: "frontmatter.blocks",
      component: "blocks",
      templates: {
        heading,
        image,
      },
    },
    {
      label: "Gallery",
      name: "frontmatter.gallery",
      component: "group-list",
      defaultItem: {
        alt: "",
        src: "",
        photographer: {
          name: "",
          social: [],
        },
      },
      itemProps: item => ({
        key: item.src,
        label: item.alt,
      }),
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
      name: "frontmatter.fakeAuthor",
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
      name: "frontmatter.title",
      component: "text",
      validate(value = "") {
        if (value.length < 5) {
          return `Please add ${5 - value.length} characters`
        }
        if (value.length > 100) {
          return `Please remove ${value.length - 100} characters`
        }
      },
    },
    {
      label: "Draft",
      name: "frontmatter.draft",
      component: "toggle",
    },
    {
      label: "Date",
      name: "frontmatter.date",
      component: "date",
    },
    {
      label: "Description",
      name: "frontmatter.description",
      component: "textarea",
    },
    {
      label: "Heading color",
      name: "frontmatter.heading_color",
      component: "color",
    },
    {
      name: "frontmatter.thumbnail",
      label: "Thumbnail",
      component: "image",
      // Generate the frontmatter value based on the filename
      parse: filename => (filename ? `./${filename}` : null),

      // Decide the file upload directory for the post
      uploadDir: blogPost => {
        let postPathParts = blogPost.fileRelativePath.split("/")

        let postDirectory = postPathParts
          .splice(0, postPathParts.length - 1)
          .join("/")

        return "packages/demo-gatsby" + postDirectory
      },

      // Generate the src attribute for the preview image.
      previewSrc: (formValues, { input }) => {
        let path = input.name.replace("rawFrontmatter", "frontmatter")
        let gastbyImageNode = get(formValues, path)
        if (!gastbyImageNode) return ""
        return gastbyImageNode.childImageSharp.fluid.src
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
        blocks {
          _template
          text
          alt
          src
        }
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
