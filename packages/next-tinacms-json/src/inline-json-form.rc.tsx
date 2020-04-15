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

import React from 'react'
import { TinaForm, Form, usePlugin } from 'tinacms'
import { FC } from 'react'
import { JsonFile, Options, useJsonForm } from './use-json-form'

export interface InlineJsonFormProps extends Options {
  jsonFile: JsonFile
  children(props: InlineJsonFormRenderProps): React.ReactElement
}

export interface InlineJsonFormRenderProps {
  form: Form
  jsonFile: JsonFile
  isEditing: boolean
  setIsEditing(value: boolean): void
}

/**
 * @deprecated `react-tinacms-inline` is correct approach to inline editing
 */
export const InlineJsonForm: FC<InlineJsonFormProps> = props => {
  const { children, jsonFile, ...options } = props
  const [data, form] = useJsonForm(jsonFile, options)
  usePlugin(form)

  return (
    <TinaForm form={form}>
      {editingProps => {
        return children({
          ...editingProps,
          form,
          jsonFile: data,
        })
      }}
    </TinaForm>
  )
}
