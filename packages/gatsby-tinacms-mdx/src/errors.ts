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

export const ERROR_MISSING_MDX_PATH =
  'useMdxForm(mdx) Required attribute `fileRelativePath` was not found on `mdx` node.' +
  `

1. Check if the \`...TinaMdx\` fragment is included in the mdx GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      ...TinaMdx
      // etc...
    }
 }
\`
  `

export const ERROR_MISSING_MDX_RAW_MARKDOWN =
  'useMdxForm(mdx) Required attribute `rawMarkdownBody` was not found on `mdx` node.' +
  `

1. Check if the \`...TinaMdx\` fragment is included in the mdx GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      ...TinaMdx
      // etc...
    }
 }
\`
  `

export const ERROR_MISSING_MDX_RAW_FRONTMATTER =
  'useMdxForm(mdx) Required attribute `rawFrontmatter` was not found on `mdx` node.' +
  `

1. Check if the \`...TinaMdx\` fragment is included in the mdx GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      rawFrontmatter
      // etc...
    }
 }
\`
  `

export const ERROR_INVALID_QUERY_NAME = (queryName: string) =>
  `useMdxForm(mdx) '${queryName}' was not found on the top node of the graphql query` +
  `

1. Check if the '${queryName}' attribute is included in the GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      ...TinaMdx
      // etc...
    }
 }

2. If you are using an alias, For example:

   export const pageQuery = graphql\`
     query BlogPostBySlug($slug: String!) {
       ${queryName}: mdx(fields: { slug: { eq: $slug } }) {
          ...TinaMdx
       // etc...
       }
    }

  then you can optionally use the 'queryName' option to specify a new property in place of 'mdx':

    export const mdxForm(BlogPostTemplate, { queryName: ${queryName} })
\`
  `
