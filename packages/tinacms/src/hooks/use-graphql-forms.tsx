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

import { Form, GlobalFormPlugin, useCMS } from '@tinacms/toolkit'
import type { FormOptions, TinaCMS } from '@tinacms/toolkit'
import { assertShape } from '../utils'
import { useFormify } from './formify'

export function useGraphqlForms<T extends object>({
  variables,
  onSubmit,
  query,
  formify,
  eventList,
}: {
  query: string
  variables: object
  onSubmit?: (args: onSubmitArgs) => void
  formify?: formifyCallback
  /**
   * This is a test utility which allows us to keep track of all the events
   * received by this hook. See `experimental-examples/unit-test-example/pages/index.js
   * for usage.
   */
  eventList?: []
}): [T, Boolean] {
  const cms = useCMS()

  const state = useFormify({
    query,
    cms,
    variables,
    formify,
    eventList: eventList,
    onSubmit,
  })

  if (!query) {
    return [state.data as T, false]
  }

  return [state.data as T, state.status !== 'done']
}

export const transformDocumentIntoMutationRequestPayload = (
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
    if (e.message === 'Failed to assertShape - _template is a required field') {
      if (!data) {
        return []
      }
      const accum = {}
      Object.entries(data).map(([keyName, value]) => {
        accum[keyName] = transformParams(value)
      })
      return accum
    } else {
      if (!data) {
        return []
      }
      throw e
    }
  }
}

export const generateFormCreators = (
  cms: TinaCMS,
  showInSidebar?: boolean,
  global?: boolean | { icon?: any; layout: 'fullscreen' | 'popup' }
) => {
  const createForm = (formConfig) => {
    const form = new Form(formConfig)
    if (showInSidebar) {
      if (global) {
        const options =
          typeof global === 'boolean'
            ? [null, 'fullscreen']
            : [global.icon, global.layout]
        cms.plugins.add(new GlobalFormPlugin(form, ...options))
      } else {
        cms.forms.add(form)
      }
    }
    return form
  }
  const createGlobalForm: GlobalFormCreator = (
    formConfig,
    options?: { icon?: any; layout: 'fullscreen' | 'popup' }
  ) => {
    const form = new Form(formConfig)
    if (showInSidebar) {
      cms.plugins.add(
        new GlobalFormPlugin(form, options?.icon, options?.layout)
      )
    }
    return form
  }
  return { createForm, createGlobalForm }
}

type FormCreator = (formConfig: FormOptions<any>) => Form
type GlobalFormCreator = (
  formConfig: FormOptions<any>,
  options?: GlobalFormOptions
) => Form
interface GlobalFormOptions {
  icon?: any
  layout: 'fullscreen' | 'popup'
}
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
