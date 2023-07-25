import { autoformatBlocks } from './autoformat-block'
import { autoformatLists } from './autoformat-lists'
import { autoformatMarks } from './autoformat-marks'

export const autoformatRules = [
  ...autoformatBlocks,
  ...autoformatLists,
  ...autoformatMarks,
]
