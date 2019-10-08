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

export const ERROR_MISSING_REMARK_PATH =
  'useRemarkForm(markdownRemark) Required attribute `fileRelativePath` was not found on `markdownRemark` node.' +
  `

1. Check if the \`fileRelativePath\` attribute is included in the GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      fileRelativePath
      // etc...
    }
 }
\`
  `

export const ERROR_MISSING_REMARK_RAW_MARKDOWN =
  'useRemarkForm(markdownRemark) Required attribute `rawMarkdownBody` was not found on `markdownRemark` node.' +
  `

1. Check if the \`rawMarkdownBody\` attribute is included in the GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      rawMarkdownBody
      // etc...
    }
 }
\`
  `

export const ERROR_MISSING_REMARK_RAW_FRONTMATTER =
  'useRemarkForm(markdownRemark) Required attribute `rawFrontmatter` was not found on `markdownRemark` node.' +
  `

1. Check if the \`rawFrontmatter\` attribute is included in the GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      rawFrontmatter
      // etc...
    }
 }
\`
  `
