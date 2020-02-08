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

import * as React from 'react'
import { Input } from './Input'

interface NumberFieldProps {
  label: string
  name: string
  component: string
  steps: number | string
}

export interface NumberProps {
  name: string
  input: any
  field: NumberFieldProps
  disabled?: boolean
  steps: number | string
}

export const NumberInput: React.FC<NumberProps> = ({ input, field, steps }) => (
  <Input
    type="number"
    step={steps || field.steps}
    value={input.value}
    onChange={input.onChange}
    {...input}
  />
)
