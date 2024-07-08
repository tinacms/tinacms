import { RichTextField } from '@tinacms/schema-tools'
import type * as Plate from '../../parse/plate'
import { toTinaMarkdown } from './to-markdown'
import { preProcess } from './pre-processing'

export const stringifyMDX = (
  value: Plate.RootElement,
  field: RichTextField,
  imageCallback: (url: string) => string
) => {
  if (!value) {
    return
  }
  // We want to retain the JSON structure of the Slate Document, so we return the value as it is
  // return value

  const mdTree = preProcess(value, field, imageCallback)
  return toTinaMarkdown(mdTree, field)
}
