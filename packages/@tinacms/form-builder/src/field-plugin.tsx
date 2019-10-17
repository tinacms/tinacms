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

import { Field } from '@tinacms/core'

export interface FieldPlugin {
  __type: 'field'
  name: string
  Component: React.FC<any>
  type?: string
  validate?(
    value: any,
    allValues: any,
    meta: any,
    field: Field
  ): string | object | undefined
  parse?: (value: any, name: string, field: Field) => any
  format?: (value: any, name: string, field: Field) => any
  defaultValue?: any
}
