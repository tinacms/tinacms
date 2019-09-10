export interface RemarkNode {
  id: string
  frontmatter: any
  html: string
  rawMarkdownBody: string
  fileRelativePath: string
  rawFrontmatter: any
  [key: string]: any
}
