/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { FormOptions, Form } from 'tinacms'
import { RemarkNode } from './remark-node'
import { useLocalRemarkForm } from './useRemarkForm'

interface RemarkFormProps extends Partial<FormOptions<any>> {
  remark: RemarkNode
  render(renderProps: { form: Form; markdownRemark: any }): JSX.Element
  timeout?: number
}

export function RemarkForm({ remark, render, ...options }: RemarkFormProps) {
  const [markdownRemark, form] = useLocalRemarkForm(remark, options)

  return render({ form: form as Form, markdownRemark })
}
