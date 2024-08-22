import { withCn } from '@udecode/cn'
import { Toolbar } from './toolbar'

export const FixedToolbar = withCn(
  Toolbar,
  'p-1 sticky left-0 top-0 z-50 w-full justify-between overflow-x-auto border border-border bg-background'
)
