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
import set from 'lodash.set'
import gql from 'graphql-tag'
import { print } from 'graphql'
import { produce } from 'immer'
import { getIn } from 'final-form'
import { useCMS, Form } from 'tinacms'
import { ContentCreatorPlugin, OnNewDocument } from './create-page-plugin'
import { assertShape, safeAssertShape } from '../utils'

import type { FormOptions } from 'tinacms'
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
  const [data, setData] = React.useState<Data>({})
  const [initialData, setInitialData] = React.useState<Data>({})
  const [pendingReset, setPendingReset] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [newUpdate, setNewUpdate] = React.useState<NewUpdate | null>(null)

  React.useEffect(() => {
    const run = async () => {
      if (newUpdate) {
        const newValue = getIn(formValues, newUpdate.get)
        const activeForm = getIn(data, [newUpdate.queryName, 'form'].join('.'))
        if (!activeForm) {
          throw new Error(
            `Unable to find form for query ${newUpdate.queryName}`
          )
        }
        if (activeForm?.paths) {
          const asyncUpdate = activeForm.paths?.find(
            (p) => p.dataPath.join('.') === newUpdate.set
          )
          if (asyncUpdate) {
            const nextState = await produce(data, async (draftState) => {
              const res = await cms.api.tina.request(asyncUpdate.queryString, {
                variables: { id: newValue },
              })
              set(draftState, newUpdate.set, res.node)
            })
            setData(nextState)
            setNewUpdate(null)
            return
          }
        }
        // FIXME: I don't think I'm using produce 100% correctly,
        // on subsequent updates the `item` is immuated
        const nextState = produce(data, (draftState) => {
          // If lookup is provided, we're in a polymorphic object, so we should populate
          // __typename as a disambiguator, regardless of whether or not it was queried for
          // FIXME: This assumes newValue to be an array until blocks support non-lists
          if (newUpdate.lookup) {
            const field = getFieldUpdate(newUpdate, activeForm, formValues)
            if (field && field.typeMap) {
              newValue.forEach((item) => {
                if (!item.__typename) {
                  item['__typename'] = field.typeMap[item._template]
                }
              })
            }
          }
          set(draftState, newUpdate.set, newValue)
          // FIXME: do it better than this, but this allows dataJSON to stay in sync
          set(draftState, newUpdate.set.replace('data', 'dataJSON'), newValue)
        })
        setData(nextState)
        setNewUpdate(null)
      }
    }
    run()
  }, [JSON.stringify(newUpdate)])

  const queryString = print(query(gql))

  React.useEffect(() => {
    if (pendingReset) {
      setData({ ...data, [pendingReset]: initialData[pendingReset] })
      setPendingReset(null)
    }
  }, [pendingReset])

  React.useEffect(() => {
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
              values: yup.object().required(),
              form: yup.object().required(),
            })
          )
          if (!canBeFormified) {
            // This is a list or collection query, no forms can be built
            return
          }
          assertShape<{
            values: object
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
            label: queryName,
            initialValues: result.values,
            fields: result.form.fields,

            reset: () => {
              setPendingReset(queryName)
            },
            onSubmit: async (payload) => {
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
                try {
                  await cms.api.tina.request(mutationString, {
                    variables,
                  })
                  cms.alerts.success('Document saved!')
                } catch (e) {
                  cms.alerts.error('There was a problem saving your document')
                  console.error(e)
                }
              }
            },
          }
          const createForm = (formConfig) => {
            const form = new Form(formConfig)
            cms.forms.add(form)
            return form
          }
          const SKIPPED = 'SKIPPED'
          let form
          let skipped
          const skip = () => {
            skipped = SKIPPED
          }
          if (skipped) return

          if (formify) {
            form = formify({ formConfig, createForm, skip })
          } else {
            form = createForm(formConfig)
          }

          if (!(form instanceof Form)) {
            if (skipped === SKIPPED) {
              return
            }
            throw new Error('formify must return a form or skip()')
          }
          const { change } = form.finalForm
          form.finalForm.change = (name, value) => {
            setNewUpdate({
              queryName,
              get: [queryName, 'values', name].join('.'),
              set: [queryName, 'data', name].join('.'),
            })
            return change(name, value)
          }

          const { insert, move, remove, ...rest } = form.finalForm.mutators
          const prepareNewUpdate = (name: string, lookup?: string) => {
            const extra = {}
            if (lookup) {
              extra['lookup'] = lookup
            }
            setNewUpdate({
              queryName,
              get: [queryName, 'values', name].join('.'),
              set: [queryName, 'data', name].join('.'),
              ...extra,
            })
          }
          form.finalForm.mutators = {
            insert: (...args) => {
              prepareNewUpdate(args[0], args[0])
              insert(...args)
            },
            move: (...args) => {
              prepareNewUpdate(args[0])
              move(...args)
            },
            remove: (...args) => {
              prepareNewUpdate(args[0])
              remove(...args)
            },
            ...rest,
          }
          form.subscribe(
            ({ values }) => {
              setFormValues({ ...formValues, [queryName]: { values: values } })
            },
            { values: true }
          )
        })
      })
      .catch((e) => {
        cms.alerts.error('There was a problem setting up forms for your query')
        console.error(e)
      })
  }, [queryString])

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

// newUpdate.lookup is a field name (ie. blocks.0.hero)
const getFieldUpdate = (newUpdate, activeForm, formValues) => {
  const items = newUpdate.lookup.split('.')
  let currentFields = activeForm.fields
  items.map((item, index) => {
    const lookupName = items.slice(0, index + 1).join('.')
    const value = getIn(
      formValues,
      [newUpdate.queryName, 'values', lookupName].join('.')
    )
    if (isNaN(Number(item))) {
      const field = currentFields.find((field) => field.name === item)
      currentFields = field
    } else {
      const template = currentFields.templates[value._template]
      currentFields = template.fields
    }
  })
  return currentFields
}

export interface FormifyArgs {
  formConfig: FormOptions<any>
  createForm: (formConfig: FormOptions<any>) => Form
  skip?: () => void
}

export type formifyCallback = (args: FormifyArgs) => Form | void
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
