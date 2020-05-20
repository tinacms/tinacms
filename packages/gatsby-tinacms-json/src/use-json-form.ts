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
import { Form, FormOptions, Field } from 'tinacms'
import { usePlugins, GlobalFormPlugin } from 'tinacms'
import { useMemo } from 'react'
import * as React from 'react'
import { useGitForm } from 'gatsby-tinacms-git'

interface JsonNode {
  id: string
  rawJson: string
  fileRelativePath: string
  [key: string]: string
}

export function useJsonForm(
  _node: JsonNode | null,
  formOptions: Partial<FormOptions<any>> = {}
): [JsonNode | null, Form | null] {
  const node = usePersistentValue(_node)

  /**
   * We're returning early here which means all the hooks called by this hook
   * violate the rules of hooks.
   */
  if (!node) {
    return [node, null]
  }
  validateJsonNode(node)

  /**
   * The state of the JsonForm, generated from the contents of the
   * Json file currently on disk. This state will contain any
   * un-committed changes in the Json file.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const valuesOnDisk = useMemo(
    () => ({
      fileRelativePath: node.fileRelativePath,
      rawJson: JSON.parse(node.rawJson),
    }),
    [node.rawJson]
  )

  const label = formOptions.label || node.fileRelativePath
  const fields = formOptions.fields || generateFields(valuesOnDisk.rawJson)

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const [, form] = useGitForm(
    valuesOnDisk,
    {
      ...formOptions,
      label,
      fields,
      format: toJsonString,
      parse: fromJsonString,
    },
    {
      label,
      fields,
      values: valuesOnDisk,
    }
  )

  return [node, form]
}

function fromJsonString(content: string) {
  return {
    rawJson: JSON.parse(content),
  }
}

function toJsonString(values: JsonNode) {
  return JSON.stringify(values.rawJson, null, 2)
}

/**
 * @deprecated See https://github.com/tinacms/rfcs/blob/master/0006-form-hook-conventions.md
 */
export function useLocalJsonForm(
  jsonNode: JsonNode | null,
  formOptions: Partial<FormOptions<any>> = {}
): [any, Form | null] {
  const [values, form] = useJsonForm(jsonNode, formOptions)
  usePlugins(form as any)
  return [values, form]
}

/**
 * @deprecated See https://github.com/tinacms/rfcs/blob/master/0006-form-hook-conventions.md
 */
export function useGlobalJsonForm(
  jsonNode: JsonNode | null,
  formOptions: Partial<FormOptions<any>> = {}
): [any, Form | null] {
  const [values, form] = useJsonForm(jsonNode, formOptions)
  usePlugins(
    React.useMemo(() => {
      if (form) {
        return new GlobalFormPlugin(form, null)
      }
    }, [form])
  )
  return [values, form]
}

function generateFields(post: any): Field[] {
  return Object.keys(post).map(key => ({
    component: 'text',
    name: `rawJson.${key}`,
  }))
}

interface JsonFormProps extends Partial<FormOptions<any>> {
  data: JsonNode
  render(renderProps: { form: Form; data: any }): JSX.Element
}

export function JsonForm({ data, render, ...options }: JsonFormProps) {
  const [currentData, form] = useJsonForm(data, options)

  return render({ form: form as any, data: currentData })
}

function validateJsonNode(jsonNode: JsonNode) {
  if (typeof jsonNode.fileRelativePath === 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_PATH)
  }

  if (typeof jsonNode.rawJson === 'undefined') {
    throw new Error(ERROR_MISSING_RAW_JSON)
  }
}

export const ERROR_MISSING_REMARK_PATH =
  'useJsonForm(jsonNode) Required attribute `fileRelativePath` was not found on the `jsonNode`.' +
  `

1. Check if the \`gatsby-tinacms-json\` was added to the \`gatsby-config.js\`.
2. Check if the \`fileRelativePath\` attribute is included in the GraphQL query.

  `

export const ERROR_MISSING_RAW_JSON =
  'useJsonForm(jsonNode) Required attribute `rawJson` was not found on the `jsonNode`.' +
  `

1. Check if the \`gatsby-tinacms-json\` was added to the \`gatsby-config.js\`.
2. Check if the \`rawJson\` attribute is included in the GraphQL query.
`

function usePersistentValue<T>(nextData: T): T {
  const [data, setData] = React.useState(nextData)

  React.useEffect(() => {
    setData(nextData || data)
  }, [nextData])

  return data
}
