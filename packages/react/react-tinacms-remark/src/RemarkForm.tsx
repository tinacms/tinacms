import { FormOptions, Form } from '@tinacms/core'
import { RemarkNode } from './remark-node'
import { useRemarkForm } from './useRemarkForm'

interface RemarkFormProps extends Partial<FormOptions<any>> {
  remark: RemarkNode
  render(renderProps: { form: Form; markdownRemark: any }): JSX.Element
  timeout?: number
}

export function RemarkForm({ remark, render, ...options }: RemarkFormProps) {
  const [markdownRemark, form] = useRemarkForm(remark, options)

  return render({ form, markdownRemark })
}
