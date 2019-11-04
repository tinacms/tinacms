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

import { get as getColor, to as toColor } from 'color-string'

export interface ColorRGBA {
  r: number
  g: number
  b: number
  a: number
}

export enum ColorFormat {
  Hex = 'hex',
  RGB = 'rgb',
}

interface ColorFormatHandler {
  getLabel(color: ColorRGBA): string
  getValue(color: ColorRGBA): string
  parse(color?: string): ColorRGBA | null
}

interface ColorFormatHandlers {
  [key: string]: ColorFormatHandler
}

const rgbToHex = function(color: { r: number; g: number; b: number }) {
  return (
    '#' +
    ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b)
      .toString(16)
      .slice(1)
  )
}

function ParseColorStr(color?: string): ColorRGBA | null {
  if (!color) {
    return null
  }

  const colorDescriptor = getColor(color)

  if (!colorDescriptor) return null;
  const colorVals = colorDescriptor.value

  return { r: colorVals[0], g: colorVals[1], b: colorVals[2], a: colorVals[3] }
}

export const ColorFormatter: ColorFormatHandlers = {
  [ColorFormat.RGB]: {
    getLabel(color: ColorRGBA) {
      return `R${color.r} G${color.g} B${color.b}`
    },
    getValue(color: ColorRGBA) {
      const colorVals = [color.r, color.g, color.b, color.a]
      return toColor.rgb(colorVals)
    },
    parse: ParseColorStr,
  },
  [ColorFormat.Hex]: {
    getLabel(color: ColorRGBA) {
      return rgbToHex(color)
    },
    getValue(color: ColorRGBA) {
      const colorVals = [color.r, color.g, color.b, color.a]
      return toColor.hex(colorVals)
    },
    parse: ParseColorStr,
  },
}
