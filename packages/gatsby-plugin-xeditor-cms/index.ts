import { useCMSForm } from '@forestryio/cms-react'

interface RemarkNode {
  id: string
  frontmatter: any
  html: string
  [key: string]: any
}

export function useRemarkForm(markdownRemark: RemarkNode) {
  return useCMSForm({
    name: `markdownRemark:${markdownRemark.id}`,
    initialValues: markdownRemark,
    fields: generateFields(markdownRemark),
    onSubmit() {
      console.log('Test')
    },
  })
}

function generateFields(post: RemarkNode) {
  let frontmatterFields = Object.keys(post.frontmatter).map(key => ({
    component: 'text',
    name: `frontmatter.${key}`,
  }))

  return [...frontmatterFields, { component: 'text', name: 'html' }]
}
