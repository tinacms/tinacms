import { Field, Form, FormOptions, TinaCMS, TinaField } from 'tinacms'

export type FieldType = Field & TinaField
export type FormValues = Record<string, unknown>
export type FormType = Form<FormValues, FieldType>

type FormCreator = (formConfig: FormOptions<any>) => Form
interface GlobalFormOptions {
  icon?: any
  layout: 'fullscreen' | 'popup'
}
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

export type FormifyCallback = (args: FormifyArgs, cms: TinaCMS) => Form | void
export type onSubmitArgs = {
  /**
   * @deprecated queryString is actually a mutation string, use `mutationString` instead
   */
  queryString: string
  mutationString: string
  variables: object
}

export const createForm = (formConfig: FormOptions<any, any>) => {
  return new Form(formConfig)
}
export const createGlobalForm: GlobalFormCreator = (
  formConfig,
  options?: { icon?: any; layout: 'fullscreen' | 'popup' }
) => {
  const form = new Form({
    ...formConfig,
    global: { global: true, ...options },
  })
  return form
}
