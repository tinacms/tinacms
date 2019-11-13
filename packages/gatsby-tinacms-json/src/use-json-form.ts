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
import { Form, FormOptions, Field } from '@tinacms/core'
import { useCMS, useWatchFormValues, usePlugins, useForm } from 'react-tinacms'
import { useMemo, useCallback, useState, useEffect } from 'react'
import * as React from 'react'
import { GlobalFormPlugin } from 'tinacms'

interface JsonNode {
  id: string
  rawJson: string
  fileRelativePath: string
  [key: string]: string
}

export function useJsonForm(
  jsonNode: JsonNode | null,
  formOptions: Partial<FormOptions<any>> = {}
): [JsonNode | null, Form | null] {
  /**
   * We're returning early here which means all the hooks called by this hook
   * violate the rules of hooks. In the case of the check for
   * `NODE_ENV === 'production'` this should be a non-issue because NODE_ENV
   * will never change at runtime.
   */
  if (!jsonNode || process.env.NODE_ENV === 'production') {
    return [jsonNode, null]
  }
  validateJsonNode(jsonNode)

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const cms = useCMS()
  const label = formOptions.label || jsonNode.fileRelativePath
  const id = jsonNode.fileRelativePath

  /**
   * The state of the JsonForm, generated from the contents of the
   * Json file currently on disk. This state will contain any
   * un-committed changes in the Json file.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const valuesOnDisk = useMemo(
    () => ({
      jsonNode: jsonNode,
      rawJson: JSON.parse(jsonNode.rawJson),
    }),
    [jsonNode]
  )

  /**
   * The state of the JsonForm, generated from the contents of the
   * Json file at the HEAD of this git branch.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const [valuesInGit, setValuesInGit] = useState()
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  useEffect(() => {
    cms.api.git
      .show(id) // Load the contents of this file at HEAD
      .then((git: any) => {
        // Parse the JSON into a JsonForm data structure and store it in state.
        const rawJson = JSON.parse(git.content)
        setValuesInGit({ jsonNode, rawJson })
      })
      .catch((e: any) => {
        console.log('FAILED', e)
      })
  }, [id])

  const fields = formOptions.fields || generateFields(valuesOnDisk.rawJson)

  // TODO: This may not be necessary.
  fields.push({ name: 'jsonNode', component: null })

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const [, form] = useForm(
    {
      id,
      label,
      initialValues: valuesInGit,
      fields,
      onSubmit(data) {
        return cms.api.git.onSubmit!({
          files: [data.fileRelativePath],
          message: data.__commit_message || 'Tina commit',
          name: data.__commit_name,
          email: data.__commit_email,
        })
      },
      reset() {
        return cms.api.git.reset({ files: [id] })
      },
      ...formOptions,
    },
    // The Form will be updated if these values change.
    { values: valuesOnDisk, label, fields }
  )

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const writeToDisk = useCallback(formState => {
    const { rawJson, jsonNode } = formState.values
    cms.api.git.onChange!({
      fileRelativePath: jsonNode.fileRelativePath,
      content: JSON.stringify(rawJson, null, 2),
    })
  }, [])

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  useWatchFormValues(form, writeToDisk)

  return [jsonNode, form as Form]
}

export function useLocalJsonForm(
  jsonNode: JsonNode | null,
  formOptions: Partial<FormOptions<any>> = {}
) {
  const [values, form] = useJsonForm(jsonNode, formOptions)
  usePlugins(form as any)
  return [values, form]
}

export function useGlobalJsonForm(
  jsonNode: JsonNode | null,
  formOptions: Partial<FormOptions<any>> = {}
) {
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
