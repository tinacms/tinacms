import * as pkg from 'color-string'
const { get: getColor, to: toColor } = pkg

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

const rgbToHex = function (color: { r: number; g: number; b: number }) {
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

  if (!colorDescriptor) return null
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
