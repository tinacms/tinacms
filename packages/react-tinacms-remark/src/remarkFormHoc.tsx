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

import * as React from 'react'
import { FormOptions, Form } from '@tinacms/core'
import { TinaForm } from '@tinacms/form-builder'
import { useRemarkForm } from './useRemarkForm'

interface RemarkFormProps extends Partial<FormOptions<any>> {
  queryName?: string // Configure where we are pulling the initial form data from.
}

export function remarkForm(
  Component: any,
  options: RemarkFormProps = {
    queryName: 'markdownRemark',
  }
) {
  return function RemarkForm(props: any) {
    const [markdownRemark] = useRemarkForm(
      props.data[options.queryName || 'markdownRemark'],
      options
    )

    return <Component {...props} data={{ ...props.data, markdownRemark }} />
  }
}

export function liveRemarkForm(Component: any, options: RemarkFormProps = {}) {
  return function RemarkForm(props: any) {
    const [markdownRemark, form] = useRemarkForm(
      props.data[options.queryName || 'markdownRemark'],
      options
    )

    return (
      <TinaForm form={form as Form}>
        {editingProps => {
          return (
            <Component
              {...props}
              data={{ ...props.data, markdownRemark }}
              {...editingProps}
            />
          )
        }}
      </TinaForm>
    )
  }
}
