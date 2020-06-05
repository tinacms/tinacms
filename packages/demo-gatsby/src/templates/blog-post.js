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
import { useRemarkForm, DeleteAction } from "gatsby-tinacms-remark"
import Img from "gatsby-image"
import { ModalProvider, usePlugin } from "tinacms"
import { EditToggle } from "../components/edit-toggle"

import {
  InlineForm,
  InlineBlocks,
  InlineTextareaField,
  InlineImageField,
  useInlineForm,
} from "react-tinacms-inline"

import { BLOCKS } from "../components/blog-blocks"
import { useCMS } from "tinacms"

const get = require("lodash.get")

function InlineWysiwyg(props) {
  const { status } = useInlineForm()
  const [{ InlineWysiwyg }, setEditor] = React.useState({})

  React.useEffect(() => {
    if (!InlineWysiwyg && status === "active") {
      import("react-tinacms-editor").then(setEditor)
    }
  }, [status])

  if (InlineWysiwyg) {
    return <InlineWysiwyg {...props} />
  }

  return props.children
}

function BlogPostTemplate(props) {
  const siteTitle = props.data.site.siteMetadata.title
  const { previous, next } = props.pageContext

  const cms = useCMS()

  const [post, form] = useRemarkForm(props.data.markdownRemark, BlogPostForm)
  usePlugin(form)

  return (
    <ModalProvider>
      <InlineForm form={form}>
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
                <InlineTextareaField name="rawFrontmatter.title" />
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
                  <InlineImageField
                    name="rawFrontmatter.thumbnail"
                    // Generate the frontmatter value based on the filename
                    parse={filename => (filename ? `./${filename}` : null)}
                    // Decide the file upload directory for the post
                    uploadDir={blogPost => {
                      const postPathParts = blogPost.initialValues.fileRelativePath.split(
                        "/"
                      )

                      const postDirectory = postPathParts
                        .splice(0, postPathParts.length - 1)
                        .join("/")

                      return postDirectory
                    }}
                    previewSrc={formValues => {
                      const preview =
                        formValues.frontmatter.thumbnail.childImageSharp.fluid
                          .src
                      return preview
                    }}
                  >
                    {props => (
                      <Img
                        fluid={post.frontmatter.thumbnail.childImageSharp.fluid}
                        alt="Gatsby can't find me"
                        {...props}
                      />
                    )}
                  </InlineImageField>
                  {/* <Img
                    fluid={post.frontmatter.thumbnail.childImageSharp.fluid}
                    alt="Gatsby can't find me"
                  /> */}
                  <span style={{ fontWeight: "600" }}>Date</span>
                  <p>{post.frontmatter.date}</p>
                </div>
                {/**
                 * TODO: make inline toggle
                 */}
                {/* <TinaField
                  name="rawFrontmatter.draft"
                  Component={MyToggle}
                  type="checkbox"
                >
                  {post.frontmatter.draft && (
                    <small style={{ color: "fuchsia" }}>Draft</small>
                  )}
                </TinaField> */}
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
            {/**
             * TODO: make inline select
             */}

            {/* <TinaField
              name="rawFrontmatter.cool"
              Component={MySelect}
              options={[100, "Love this!", "How cool!"]}
            >
              <p>{post.frontmatter.cool}</p>
            </TinaField> */}
            <p>{post.frontmatter.cool}</p>
            <InlineBlocks
              name="rawFrontmatter.blocks"
              blocks={BLOCKS}
            ></InlineBlocks>

            <InlineWysiwyg
              sticky="74px"
              name="rawMarkdownBody"
              imageProps={{
                async upload(files) {
                  const directory = "/static/images/"

                  let media = await cms.media.store.persist(
                    files.map(file => ({
                      directory,
                      file,
                    }))
                  )

                  return media.map(m => `/images/${m.filename}`)
                },
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: props.data.markdownRemark.html,
                }}
              />
            </InlineWysiwyg>
          </div>
          <EditToggle />
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
      </InlineForm>
    </ModalProvider>
  )
}

/**
 * Blog Post Form
 */
const BlogPostForm = {
  actions: [DeleteAction],
  fields: [
    { name: "rawMarkdownBody", component: "markdown" },
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
      label: "New Shiny Select",
      name: "frontmatter.cool",
      component: "select",
      options: [100, "Love this!", "How cool!"],
    },
    {
      label: "Testing Number Component",
      name: "frontmatter.testNumber",
      component: "number",
      steps: 3,
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
      colors: ["#ff0000", "#ffff00", "#00ff00", "#0000ff"],
      widget: "sketch",
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

        return postDirectory
      },

      // Generate the src attribute for the preview image.
      previewSrc: (formValues, { input }) => {
        let path = input.name.replace("rawFrontmatter", "frontmatter")
        console.log({ path })
        let gastbyImageNode = get(formValues, path)
        console.log({ gastbyImageNode })
        if (!gastbyImageNode) return ""
        return gastbyImageNode.childImageSharp.fluid.src
      },
    },
  ],
}

export function DiscardChanges() {
  const { form } = useInlineForm()

  return (
    <button
      onClick={() => {
        form.finalForm.reset()
      }}
    >
      Discard Changes
    </button>
  )
}

/*
 ** Export -----------------------------------------------
 */
// export default inlineRemarkForm(BlogPostTemplate, BlogPostForm)
export default BlogPostTemplate

/*
 ** Data Fetching -----------------------------------------------
 */

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...TinaRemark
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        # blocks {
        #   _template
        #   text
        #   alt
        #   src
        # }
        title
        date(formatString: "DD MMMM, YYYY")
        description
        heading_color
        draft
        cool
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
