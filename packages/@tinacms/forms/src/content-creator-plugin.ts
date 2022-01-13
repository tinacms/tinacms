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

import { CMS, Plugin } from '@einsteinindustries/tinacms-core'
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
