/**
Copyright 2021 Forestry.io Holdings, Inc.
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
import gql from 'graphql-tag'
import { print } from 'graphql'
import { useCMS, Form, GlobalFormPlugin } from '@tinacms/toolkit'
import { assertShape, safeAssertShape } from '../utils'

import type { FormOptions, TinaCMS } from '@tinacms/toolkit'
import type { DocumentNode } from 'graphql'

export function useGraphqlForms<T extends object>({
  query,
  variables,
  onSubmit,
  formify = null,
}: {
  query: (gqlTag: typeof gql) => DocumentNode
  variables: object
  onSubmit?: (args: onSubmitArgs) => void
  formify?: formifyCallback
}): [T, Boolean] {
  const cms = useCMS()
  const [formValues, setFormValues] = React.useState<FormValues>({})
  const [data, setData] = React.useState<object>(null)
  const [initialData, setInitialData] = React.useState<Data>({})
  const [pendingReset, setPendingReset] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const queryString = print(query(gql))

  React.useEffect(() => {
    if (pendingReset) {
      setData({ ...data, [pendingReset]: initialData[pendingReset] })
      setPendingReset(null)
    }
  }, [pendingReset])

  React.useEffect(() => {
    setIsLoading(true)
    cms.api.tina
      .requestWithForm(query, { variables })
      .then((payload) => {
        setData(payload)
        setInitialData(payload)
        setIsLoading(false)
        Object.entries(payload).map(([queryName, result]) => {
          const canBeFormified = safeAssertShape<{
            form: { mutationInfo: string }
          }>(result, (yup) =>
            yup.object({
              data: yup.object().required(),
              form: yup.object().required(),
            })
          )
          if (!canBeFormified) {
            // This is a list or collection query, no forms can be built
            return
          }
          assertShape<{
            data: object
            form: FormOptions<any, any> & {
              mutationInfo: {
                string: string
                includeCollection: boolean
              }
            }
          }>(
            result,
            (yup) =>
              yup.object({
                values: yup.object().required(),
                form: yup.object().required(),
              }),
            `Unable to build form shape for fields at ${queryName}`
          )
          const formConfig = {
            id: queryName,
            label: result.form.label,
            initialValues: result.data,
            fields: result.form.fields,

            reset: () => {
              setPendingReset(queryName)
            },
            onSubmit: async (payload) => {
              try {
                const params = transformDocumentIntoMutationRequestPayload(
                  payload,
                  result.form.mutationInfo
                )
                const variables = { params }
                const mutationString = result.form.mutationInfo.string
                if (onSubmit) {
                  onSubmit({
                    queryString: mutationString,
                    mutationString,
                    variables,
                  })
                } else {
                  await cms.api.tina.request(mutationString, {
                    variables,
                  })
                  cms.alerts.success('Document saved!')
                }
              } catch (e) {
                cms.alerts.error('There was a problem saving your document')
                console.error(e)
              }
            },
          }
          const { createForm, createGlobalForm } = generateFormCreators(cms)
          const SKIPPED = 'SKIPPED'
          let form
          let skipped
          const skip = () => {
            skipped = SKIPPED
          }
          if (skipped) return

          if (formify) {
            form = formify(
              { formConfig, createForm, createGlobalForm, skip },
              cms
            )
          } else {
            form = createForm(formConfig)
          }

          if (!(form instanceof Form)) {
            if (skipped === SKIPPED) {
              return
            }
            throw new Error('formify must return a form or skip()')
          }
          form.subscribe(
            ({ values }) => {
              setFormValues({ ...formValues, [queryName]: { values: values } })
              setData({ ...formValues, [queryName]: { data: values } })
            },
            { values: true }
          )
        })
      })
      .catch((e) => {
        cms.alerts.error('There was a problem setting up forms for your query')
        console.error('There was a problem setting up forms for your query')
        console.error(e)
        setIsLoading(false)
      })
  }, [queryString, JSON.stringify(variables)])

  return [data as T, isLoading]
}

const transformDocumentIntoMutationRequestPayload = (
  document: {
    _collection: string
    __typename?: string
    _template: string
    [key: string]: unknown
  },
  /** Whether to include the collection and template names as top-level keys in the payload */
  instructions: { includeCollection?: boolean; includeTemplate?: boolean }
) => {
  const { _collection, __typename, _template, ...rest } = document

  const params = transformParams(rest)
  const paramsWithTemplate = instructions.includeTemplate
    ? { [_template]: params }
    : params

  return instructions.includeCollection
    ? { [_collection]: paramsWithTemplate }
    : paramsWithTemplate
}

const transformParams = (data: unknown) => {
  if (['string', 'number', 'boolean'].includes(typeof data)) {
    return data
  }
  if (Array.isArray(data)) {
    return data.map((item) => transformParams(item))
  }
  try {
    assertShape<{ _template: string; __typename?: string }>(data, (yup) =>
      // @ts-ignore No idea what yup is trying to tell me:  Type 'RequiredStringSchema<string, Record<string, any>>' is not assignable to type 'AnySchema<any, any, any>
      yup.object({ _template: yup.string().required() })
    )
    const { _template, __typename, ...rest } = data
    const nested = transformParams(rest)
    return { [_template]: nested }
  } catch (e) {
    const accum = {}
    Object.entries(data).map(([keyName, value]) => {
      accum[keyName] = transformParams(value)
    })
    return accum
  }
}

const generateFormCreators = (cms: TinaCMS) => {
  const createForm = (formConfig) => {
    const form = new Form(formConfig)
    cms.forms.add(form)
    return form
  }
  const createGlobalForm = (formConfig) => {
    const form = new Form(formConfig)
    cms.plugins.add(new GlobalFormPlugin(form))
    return form
  }
  return { createForm, createGlobalForm }
}

type FormCreator = (formConfig: FormOptions<any>) => Form
export interface FormifyArgs {
  formConfig: FormOptions<any>
  createForm: FormCreator
  createGlobalForm: FormCreator
  skip?: () => void
}

export type formifyCallback = (args: FormifyArgs, cms: TinaCMS) => Form | void
export type onSubmitArgs = {
  /**
   * @deprecated queryString is actually a mutation string, use `mutationString` instead
   */
  queryString: string
  mutationString: string
  variables: object
}

type FormValues = {
  [queryName: string]: object
}
type Data = {
  [queryName: string]: object
}
type NewUpdate = {
  queryName: string
  get: string
  set: string
  lookup?: string
}
