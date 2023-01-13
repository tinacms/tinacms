import { commandControl } from 'components/MenuHelpers'
import { insertHr } from 'plugins/Common/commands'
// @ts-ignore
import { RulerIcon } from '@einsteinindustries/tinacms-icons'

export const ProsemirrorMenu = commandControl(
  insertHr,
  RulerIcon,
  'Horizontal Rule',
  'Horizontal Rule'
)
