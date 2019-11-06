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

1. Check if the \`...TinaRemark\` fragment is included in the markdownRemark GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...TinaRemark
      // etc...
    }
 }
\`
  `

export const ERROR_MISSING_REMARK_RAW_MARKDOWN =
  'useRemarkForm(markdownRemark) Required attribute `rawMarkdownBody` was not found on `markdownRemark` node.' +
  `

1. Check if the \`...TinaRemark\` fragment is included in the markdownRemark GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...TinaRemark
      // etc...
    }
 }
\`
  `

export const ERROR_MISSING_REMARK_RAW_FRONTMATTER =
  'useRemarkForm(markdownRemark) Required attribute `rawFrontmatter` was not found on `markdownRemark` node.' +
  `

1. Check if the \`...TinaRemark\` fragment is included in the markdownRemark GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      rawFrontmatter
      // etc...
    }
 }
\`
  `

export const ERROR_INVALID_QUERY_NAME = (queryName: string) =>
  `useRemarkForm(markdownRemark) '${queryName}' was not found on the top node of the graphql query` +
  `

1. Check if the '${queryName}' attribute is included in the GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...TinaRemark
      // etc...
    }
 }

2. If you are using an alias, For example:

   export const pageQuery = graphql\`
     query BlogPostBySlug($slug: String!) {
       ${queryName}: markdownRemark(fields: { slug: { eq: $slug } }) {
          ...TinaRemark
       // etc...
       }
    }

  then you can optionally use the 'queryName' option to specify a new property in place of 'markdownRemark':

    export const remarkForm(BlogPostTemplate, { queryName: ${queryName} })
\`
  `
