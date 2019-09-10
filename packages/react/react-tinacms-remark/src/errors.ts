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
