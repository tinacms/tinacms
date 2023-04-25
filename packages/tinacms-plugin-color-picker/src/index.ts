import type { TinaPlugin, FieldPlugin } from 'tinacms'
import { ColorPickerInput } from './color'
export * from './color'
// @ts-ignore
import rawFile from './color?raw'

export const colorFieldPlugin = () => {
  const plugin: TinaPlugin = {
    cmsCallback: (cms) => {
      const fieldPlugin: FieldPlugin = {
        __type: 'field',
        Component: ColorPickerInput,
        name: 'color-picker',
      }
      cms.plugins.add(fieldPlugin)
      return cms
    },
    tailwind: {
      // I don't love this since it does not scale the best but I could not figure out how to get the resolved path.
      content: [{ raw: rawFile, extension: 'ts' }],
    },
  }
  return plugin
}
