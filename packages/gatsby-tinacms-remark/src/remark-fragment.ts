import { graphql } from 'gatsby'

export const tinaRemarkFragment = graphql`
  fragment TinaRemark on MarkdownRemark {
    fileRelativePath
    rawFrontmatter
    rawMarkdownBody
  }
`
