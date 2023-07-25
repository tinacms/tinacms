import { CMS, Plugin } from '@toolkit/core'
import { Field } from './field'
import { FormOptions } from './form'

export interface ContentCreatorPlugin<FormShape> extends Plugin {
  __type: 'content-creator'
  fields: Field[]
  actions?: FormOptions<any>['actions']
  buttons?: FormOptions<any>['buttons']
  initialValues?: FormShape
  onSubmit(value: FormShape, cms: CMS): Promise<void> | void
  reset?: FormOptions<any>['reset']
  onChange?: FormOptions<any>['onChange']
}
