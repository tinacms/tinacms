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
import { ColorPicker } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { useFrameContext } from '../../components/SyledFrame'
import { InputProps } from 'react-select/lib/components/Input'

export interface ColorFieldProps {
  colorFormat: string
  colors: string[]
  widget?: "sketch" | "block"
}
export const ColorField = wrapFieldsWithMeta<InputProps, ColorFieldProps>(
  ({ input, field }) => {
    const frame = useFrameContext();
    return (
      <ColorPicker
        colorFormat={(field as any).colorFormat}
        userColors={(field as any).colors}
        widget={(field as any).widget}
        input={input}
        frame={frame}
      />
    )
  }
)

export default {
  name: 'color',
  Component: ColorField,
}
