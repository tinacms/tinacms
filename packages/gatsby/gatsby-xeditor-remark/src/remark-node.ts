export interface RemarkNode {
  id: string
  frontmatter: any
  html: string
  rawMarkdownBody: string
  [key: string]: any
}
