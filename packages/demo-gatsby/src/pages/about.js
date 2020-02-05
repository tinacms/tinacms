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
import { graphql } from "gatsby"
import { useLocalMdx } from "gatsby-tinacms-mdx"
import { MDXRenderer } from "gatsby-plugin-mdx"

import Layout from "../components/layout"
import SEO from "../components/seo"

function AboutPage(props) {
  const siteTitle = props.data.site.siteMetadata.title
  const frontmatter = props.data.mdx.frontmatter
  const mdxBody = props.data.mdx.body
  const [data] = useLocalMdx(props.data.mdx)
  console.log("data", data)
  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO title="About" />
      <h1>{data.frontmatter.title}</h1>
      <MDXRenderer>{mdxBody}</MDXRenderer>
    </Layout>
  )
}

export default AboutPage

export const aboutPageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    mdx {
      body
      frontmatter {
        date
        description
        title
      }
      fileRelativePath
      rawFrontmatter
      rawMarkdownBody
      rawBody
    }
  }
`
