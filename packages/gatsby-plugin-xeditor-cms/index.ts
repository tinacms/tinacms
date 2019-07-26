import { Form } from '@forestryio/cms'
import { useCMSForm } from '@forestryio/cms-react'
import { ERROR_MISSING_CMS_GATSBY, ERROR_MISSING_REMARK_ID } from './errors'

interface RemarkNode {
  id: string
  frontmatter: any
  html: string
  [key: string]: any
}

export function useRemarkForm(markdownRemark: RemarkNode) {
  if (typeof markdownRemark.id == 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_ID)
  }
  try {
    return useCMSForm({
      name: `markdownRemark:${markdownRemark.id}`,
      initialValues: markdownRemark,
      fields: generateFields(markdownRemark),
      onSubmit() {
        console.log('Test')
      },
    })
  } catch (e) {
    throw new Error(ERROR_MISSING_CMS_GATSBY)
  }
}

function generateFields(post: RemarkNode) {
  let frontmatterFields = Object.keys(post.frontmatter).map(key => ({
    component: 'text',
    name: `frontmatter.${key}`,
  }))

  return [...frontmatterFields, { component: 'text', name: 'html' }]
}

interface RemarkFormProps {
  remark: RemarkNode
  children(renderProps: { form: Form; values: any }): JSX.Element
}

export function RemarkForm({ remark, children }: RemarkFormProps) {
  let [form, values] = useRemarkForm(remark)

  return children({ form, values })
}
