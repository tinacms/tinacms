import { FormOptions, Form } from '@tinacms/core'
import { RemarkNode } from './remark-node'
import { useRemarkForm } from './useRemarkForm'

interface RemarkFormProps extends Partial<FormOptions<any>> {
  remark: RemarkNode
  render(renderProps: { form: Form; markdownRemark: any }): JSX.Element
  timeout?: number
}

export function RemarkForm({
  remark,
  render,
  timeout,
  ...options
}: RemarkFormProps) {
  let [markdownRemark, form] = useRemarkForm(remark, options, timeout)

  return render({ form, markdownRemark })
}
