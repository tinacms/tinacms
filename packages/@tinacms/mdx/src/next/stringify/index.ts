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
  const mdTree = preProcess(value, field, imageCallback)
  return toTinaMarkdown(mdTree, field)
}
