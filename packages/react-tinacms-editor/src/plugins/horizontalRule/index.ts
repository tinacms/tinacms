import { commandControl } from 'components/MenuHelpers'
import { insertHr } from 'plugins/Common/commands'
import { QuoteIcon } from '@tinacms/icons'

export const ProsemirrorMenu = commandControl(
  insertHr,
  QuoteIcon,
  'Horizontal Rule',
  'Horizontal Rule'
)