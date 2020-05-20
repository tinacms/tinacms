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
import {
  useCMS,
  useWatchFormValues,
  usePlugins,
  useForm,
  GlobalFormPlugin,
} from 'tinacms'
import { useMemo, useCallback } from 'react'
import * as React from 'react'

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

  // NODE_ENV will never change at runtime.
  const TINA_DISABLED = process.env.NODE_ENV === 'production'

  /**
   * We're returning early here which means all the hooks called by this hook
   * violate the rules of hooks.
   */
  if (!node) {
    return [node, null]
  }
  validateJsonNode(node)

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const cms = useCMS()
  const label = formOptions.label || node.fileRelativePath
  const id = node.fileRelativePath
  const actions = formOptions.actions

  /**
   * The state of the JsonForm, generated from the contents of the
   * Json file currently on disk. This state will contain any
   * un-committed changes in the Json file.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const valuesOnDisk = useMemo(
    () => ({
      // Common Props
      fileRelativePath: node.fileRelativePath,
      // Json Specific
      rawJson: JSON.parse(node.rawJson),
    }),
    [node.rawJson]
  )

  const fields = formOptions.fields || generateFields(valuesOnDisk.rawJson)

  function loadInitialValues() {
    return cms.api.git
      .show(id) // Load the contents of this file at HEAD
      .then((git: any) => {
        const file = parseContent(git.content)

        return {
          fileRelativePath: node?.fileRelativePath,
          ...file,
        }
      })
  }

  function parseContent(content: string) {
    return {
      rawJson: JSON.parse(content),
    }
  }

  const jsonFormOptions = {
    label,
    fields,
    loadInitialValues: TINA_DISABLED ? undefined : loadInitialValues,

    actions,
    ...formOptions,
  }

  const watchValuesForChange = { values: valuesOnDisk, label, fields }

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  return useGitForm(
    node,
    {
      ...jsonFormOptions,
      format: toJsonString,
    },
    watchValuesForChange
  )
}

function useGitForm(node: any, options: any, watch: any): [any, Form] {
  const { format, ...formOptions } = options
  const cms = useCMS()
  const [values, form] = useForm(
    {
      ...formOptions,
      id: node.fileRelativePath,
      onSubmit(data: any) {
        return cms.api.git.onSubmit!({
          files: [data.fileRelativePath],
          message: data.__commit_message || 'Tina commit',
          name: data.__commit_name,
          email: data.__commit_email,
        })
      },
      reset() {
        return cms.api.git.reset({ files: [node.fileRelativePath] })
      },
    },
    watch
  )

  const writeToDisk = React.useCallback(formState => {
    cms.api.git.onChange!({
      fileRelativePath: formState.values.fileRelativePath,
      content: format(formState.values),
    })
  }, [])

  useWatchFormValues(form, writeToDisk)

  return [values, form]
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
