import { ERROR_MISSING_CMS } from '@tinacms/react-tinacms'

export const ERROR_MISSING_CMS_GATSBY =
  ERROR_MISSING_CMS +
  `

1. Tina may not be listed in the gatsby-config.js plugins array

module.exports = {
  plugins: [
    "@tinacms/gatsby-plugin-tinacms"
  ]
}
`

export const ERROR_MISSING_REMARK_ID =
  'useRemarkForm(remark) Required attribute `id` was not found on `remark` argument' +
  `

1. Check if the \`id\` attribute is included in the GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      // etc...
    }
 }
\`
  `
export const ERROR_MISSING_REMARK_PATH =
  'useRemarkForm(remark) Required attribute `fileRelativePath` was not found on `remark` argument' +
  `

1. Check if the \`fileRelativePath\` attribute is included in the GraphQL query. For example:

export const pageQuery = graphql\`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      fields {
        fileRelativePath
      }
      // etc...
    }
 }
\`
  `
