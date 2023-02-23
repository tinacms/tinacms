/**

*/

import { Form, GlobalFormPlugin } from '@tinacms/toolkit'
import type { FormOptions, TinaCMS } from '@tinacms/toolkit'
import { assertShape } from '../utils'

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
