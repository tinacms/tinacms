import { commandControl } from 'components/MenuHelpers'
import { insertHr } from 'plugins/Common/commands'
// @ts-ignore
import { RulerIcon } from '@tinacms/icons'

export const ProsemirrorMenu = commandControl(
  insertHr,
  RulerIcon,
  'Horizontal Rule',
  'Horizontal Rule'
)