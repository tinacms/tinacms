import { Form, GlobalFormPlugin } from '@tinacms/toolkit'
import type { FormOptions, TinaCMS } from '@tinacms/toolkit'

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
