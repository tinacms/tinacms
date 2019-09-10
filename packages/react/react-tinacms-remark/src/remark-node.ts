export interface RemarkNode {
  id: string
  frontmatter: any
  html: string
  rawMarkdownBody: string
  fields: {
    fileRelativePath: string
    rawFrontmatter?: any
  }
  [key: string]: any
}
