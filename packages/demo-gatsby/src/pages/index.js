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
import { useForm, usePlugin } from "react-tinacms"
import { GlobalFormPlugin } from "tinacms"

function BlogIndex(props) {
  const { data } = props
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  const [styles, form] = useForm({
    id: "blog-index-styles",
    label: "Blog Styles",
    initialValues: {
      backgroundColor: "",
      hideBio: false,
      date: "2019 03 04",
      thumbnail:
        "https://images.unsplash.com/photo-1518259102261-b40117eabbc9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2550&q=80",
    },
    fields: [
      {
        name: "backgroundColor",
        label: "Heading Color",
        component: "color",
        colorFormat: "HeX",
      },
      {
        name: "hideBio",
        label: "Hide Bio",
        component: "toggle",
      },
      {
        name: "date",
        label: "Date",
        component: "date",
        dateFormat: "YYYY MM DD",
        timeFormat: null,
      },
    ],
    onSubmit() {
      alert("Saving doesn't do anything.")
    },
  })

  useGlobalFormPlugin(form)

  return (
    <Layout location={props.location} title={siteTitle}>
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <SEO title="All posts" />
        {!styles.hideBio && <Bio />}
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <div key={node.fields.slug}>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                  ...styles,
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {title}{" "}
                  {node.frontmatter.draft && (
                    <small style={{ color: "fuchsia" }}>Draft</small>
                  )}
                </Link>
              </h3>
              <small>{node.frontmatter.date}</small>
              <p
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt,
                }}
              />
            </div>
          )
        })}
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date
            title
            description
            heading_color
            draft
          }
        }
      }
    }
  }
`

function useGlobalFormPlugin(form) {
  const GlobalForm = React.useMemo(() => {
    if (!form) return
    return new GlobalFormPlugin(form)
  }, [form])

  usePlugin(GlobalForm)
}
