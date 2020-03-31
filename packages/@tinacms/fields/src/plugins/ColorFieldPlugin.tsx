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
import { ColorPicker, InputProps } from '../components'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { parse } from './textFormat'

export interface ColorFieldProps {
  colorFormat: string
  colors: string[]
  widget?: 'sketch' | 'block'
}
export const ColorField = wrapFieldsWithMeta<InputProps, ColorFieldProps>(
  ({ input, field }) => {
    return (
      <ColorPicker
        colorFormat={(field as any).colorFormat}
        userColors={(field as any).colors}
        widget={(field as any).widget}
        input={input}
      />
    )
  }
)

export const ColorFieldPlugin = {
  name: 'color',
  Component: ColorField,
  parse,
}
