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
import { useLocalMdxForm } from "gatsby-tinacms-mdx"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { MDXProvider } from "@mdx-js/react"

import Layout from "../components/layout"
import SEO from "../components/seo"

const HowAreYa = ({ you }) => <p>{you} is a fruit</p>
const shorties = {
  HowAreYa,
}

function AboutPage(props) {
  const formOptions = {
    fields: [
      {
        label: "Title",
        name: "rawFrontmatter.title",
        component: "text",
      },
      {
        label: "Fruit",
        name: "rawFrontmatter.fruit",
        description: "🍅🍋🍑🍇🥝",
        component: "text",
      },
      {
        label: "Body",
        name: "rawMarkdownBody",
        component: "markdown",
      },
    ],
  }

  const siteTitle = props.data.site.siteMetadata.title
  const [data] = useLocalMdxForm(props.data.mdx, formOptions)
  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO title="About" />
      <h1>{data.frontmatter.title}</h1>
      <MDXProvider components={shorties}>
        <MDXRenderer fruit={props.data.mdx.frontmatter.fruit}>
          {data.body}
        </MDXRenderer>
      </MDXProvider>
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
        fruit
      }
      fileRelativePath
      rawFrontmatter
      rawMarkdownBody
      rawBody
    }
  }
`
